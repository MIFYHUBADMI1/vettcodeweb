/**
 * Scan Chat API
 * POST /api/scans/[scanId]/chat
 * 
 * Conversational AI coach for security scans
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ScanModel } from '@/lib/models/Scan'
import { generateChatResponse, generateScanOverview } from '@/lib/ai-chat'
import { calculateSecurityScore } from '@/lib/security-score'
import type { ChatMessage, ScanContext } from '@/lib/ai-chat'

export const dynamic = 'force-dynamic'

interface ChatRequest {
  message: string
  conversationHistory?: ChatMessage[]
  requestOverview?: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: { scanId: string } }
) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.email

    // 2. Get scan and verify ownership
    const scan = await ScanModel.findById(params.scanId)
    
    if (!scan) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      )
    }

    if (scan.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - not your scan' },
        { status: 403 }
      )
    }

    // 3. Parse request
    const body: ChatRequest = await request.json()
    const { message, conversationHistory = [], requestOverview = false } = body

    // 4. Build scan context
    const { score, grade } = calculateSecurityScore({
      criticalCount: scan.criticalCount,
      highCount: scan.highCount,
      mediumCount: scan.mediumCount,
      lowCount: scan.lowCount,
      infoCount: scan.infoCount,
      totalFindings: scan.totalFindings,
    })

    // Get categories
    const categories = Array.from(
      new Set(scan.scanData.findings.map((f) => f.category))
    )

    // Get priority findings (top 10)
    const priorityFindings = scan.scanData.findings
      .sort((a, b) => {
        const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 }
        const aSeverity = severityOrder[a.severity]
        const bSeverity = severityOrder[b.severity]
        
        if (aSeverity !== bSeverity) return aSeverity - bSeverity
        
        // Then by confidence
        const aConf = a.confidence || 0.5
        const bConf = b.confidence || 0.5
        return bConf - aConf
      })
      .slice(0, 10)

    const scanContext: ScanContext = {
      scanId: params.scanId,
      scanPath: scan.scanPath,
      totalFindings: scan.totalFindings,
      criticalCount: scan.criticalCount,
      highCount: scan.highCount,
      mediumCount: scan.mediumCount,
      lowCount: scan.lowCount,
      infoCount: scan.infoCount,
      score,
      grade,
      categories,
      priorityFindings,
    }

    // 5. Generate response
    let response

    if (requestOverview) {
      // Initial scan overview
      response = await generateScanOverview(scanContext, userId)
    } else {
      // Conversational response
      if (!message || message.trim().length === 0) {
        return NextResponse.json(
          { error: 'Message is required' },
          { status: 400 }
        )
      }

      response = await generateChatResponse(
        message,
        scanContext,
        conversationHistory,
        userId
      )
    }

    // 6. Return response
    return NextResponse.json({
      message: response.message,
      source: response.source,
      provider: response.provider,
      model: response.model,
      duration: response.duration,
      quotaExceeded: response.quotaExceeded,
      quotaReason: response.quotaReason,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
