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
    console.log('[UPLOAD API] Starting upload process...')
    
    // Authenticate CLI
    const auth = await authenticateCLIRequest(request)
    console.log('[UPLOAD API] Auth result:', { authenticated: auth.authenticated, userId: auth.userId })

    if (!auth.authenticated) {
      console.log('[UPLOAD API] Authentication failed:', auth.error)
      return NextResponse.json(
        { error: auth.error || 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('[UPLOAD API] Received body keys:', Object.keys(body))
    console.log('[UPLOAD API] Body structure:', {
      hasVersion: !!body.version,
      hasScan: !!body.scan,
      hasFindings: !!body.findings,
      hasSummary: !!body.summary,
      findingsCount: body.findings?.length
    })

    // Validate scan result format
    if (!body || !body.version || !body.scan || !body.findings) {
      console.log('[UPLOAD API] Invalid format - missing required fields')
      return NextResponse.json(
        { error: 'Invalid scan result format' },
        { status: 400 }
      )
    }

    // Validate scan result size (max 10MB)
    const bodySize = JSON.stringify(body).length
    console.log('[UPLOAD API] Body size:', bodySize, 'bytes')
    if (bodySize > 10 * 1024 * 1024) {
      console.log('[UPLOAD API] Body too large')
      return NextResponse.json(
        { error: 'Scan result too large (max 10MB)' },
        { status: 413 }
      )
    }

    // Sanitize sensitive data
    console.log('[UPLOAD API] Sanitizing scan result...')
    let sanitizedResult: ScanResult
    try {
      sanitizedResult = sanitizeScanResult(body)
      console.log('[UPLOAD API] Sanitization complete')
    } catch (sanitizeError: any) {
      console.error('[UPLOAD API] Sanitization failed:', sanitizeError)
      throw new Error(`Sanitization failed: ${sanitizeError.message}`)
    }

    // Upload to ImageKit
    console.log('[UPLOAD API] Uploading to ImageKit...')
    let imagekitUrl: string
    try {
      imagekitUrl = await uploadScanResult(sanitizedResult)
      console.log('[UPLOAD API] ImageKit upload success:', imagekitUrl)
    } catch (imagekitError: any) {
      console.error('[UPLOAD API] ImageKit upload failed:', imagekitError)
      throw new Error(`ImageKit upload failed: ${imagekitError.message}`)
    }

    // Store in database
    console.log('[UPLOAD API] Storing in database...')
    let scan
    try {
      scan = await ScanModel.create(
        auth.userId!,
        sanitizedResult,
        imagekitUrl
      )
      console.log('[UPLOAD API] Database insert success, scanId:', scan._id?.toString())
    } catch (dbError: any) {
      console.error('[UPLOAD API] Database insert failed:', dbError)
      throw new Error(`Database insert failed: ${dbError.message}`)
    }

    return NextResponse.json({
      success: true,
      scanId: scan._id?.toString(),
      url: imagekitUrl,
      message: 'Scan uploaded successfully',
    })
  } catch (error: any) {
    console.error('Upload API error:', error)
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('Error cause:', error?.cause)
    
    // Return appropriate error based on type
    if (error.message?.includes('Authentication')) {
      return NextResponse.json(
        { error: 'Authentication failed', details: error.message },
        { status: 401 }
      )
    }
    
    if (error.message?.includes('ImageKit')) {
      return NextResponse.json(
        { error: 'Failed to store scan result: ' + error.message, details: error.stack },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to upload scan result',
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
