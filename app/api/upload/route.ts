/**
 * Upload Scan API
 * POST /api/upload - Upload scan result from CLI
 * 
 * Requires CLI authentication
 * Associates scan with authenticated user
 * Stores scan in database and ImageKit
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateCLIRequest } from '@/lib/cli-auth'
import { uploadScanResult } from '@/lib/imagekit'
import { ScanModel } from '@/lib/models/Scan'
import type { ScanResult } from '@/lib/types'

// Helper to sanitize sensitive data from scan result
function sanitizeScanResult(scanResult: ScanResult): ScanResult {
  const sanitized = { ...scanResult }
  
  // Sanitize findings
  if (sanitized.findings) {
    sanitized.findings = sanitized.findings.map(finding => {
      const sanitizedFinding = { ...finding }
      
      // Redact secrets if this is a secret-type finding
      if (finding.category === 'SECRET' && finding.metadata) {
        // Redact any potential secret values
        const metadata = { ...finding.metadata }
        if (metadata.secret) {
          metadata.secret = '[REDACTED]'
        }
        if (metadata.value) {
          metadata.value = '[REDACTED]'
        }
        sanitizedFinding.metadata = metadata
      }
      
      // Normalize file paths to remove local username/absolute paths
      if (sanitizedFinding.file) {
        // Remove common path prefixes
        sanitizedFinding.file = sanitizedFinding.file
          .replace(/^[A-Z]:\\Users\\[^\\]+\\/, '') // Windows: C:\Users\username\
          .replace(/^\/home\/[^\/]+\//, '') // Linux: /home/username/
          .replace(/^\/Users\/[^\/]+\//, '') // macOS: /Users/username/
          .replace(/^.*?Desktop\//, '') // Desktop folder
          .replace(/^.*?Documents\//, '') // Documents folder
      }
      
      return sanitizedFinding
    })
  }
  
  // Sanitize scan path
  if (sanitized.scan.path) {
    sanitized.scan.path = sanitized.scan.path
      .replace(/^[A-Z]:\\Users\\[^\\]+\\/, '')
      .replace(/^\/home\/[^\/]+\//, '')
      .replace(/^\/Users\/[^\/]+\//, '')
      .replace(/^.*?Desktop\//, '')
      .replace(/^.*?Documents\//, '')
  }
  
  return sanitized
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate CLI
    const auth = await authenticateCLIRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate scan result format
    if (!body || !body.version || !body.scan || !body.findings) {
      return NextResponse.json(
        { error: 'Invalid scan result format' },
        { status: 400 }
      )
    }

    // Validate scan result size (max 10MB)
    const bodySize = JSON.stringify(body).length
    if (bodySize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Scan result too large (max 10MB)' },
        { status: 413 }
      )
    }

    // Sanitize sensitive data
    const sanitizedResult: ScanResult = sanitizeScanResult(body)

    // Upload to ImageKit
    const imagekitUrl = await uploadScanResult(sanitizedResult)

    // Store in database
    const scan = await ScanModel.create(
      auth.userId!,
      sanitizedResult,
      imagekitUrl
    )

    return NextResponse.json({
      success: true,
      scanId: scan._id?.toString(),
      url: imagekitUrl,
      message: 'Scan uploaded successfully',
    })
  } catch (error: any) {
    console.error('Upload API error:', error)
    
    // Return appropriate error based on type
    if (error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
    
    if (error.message.includes('ImageKit')) {
      return NextResponse.json(
        { error: 'Failed to store scan result' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to upload scan result' },
      { status: 500 }
    )
  }
}
