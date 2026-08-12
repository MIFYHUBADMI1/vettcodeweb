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
import type { ScanContext } from '@/lib/ai-chat-utils'

export const dynamic = 'force-dynamic'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

interface ChatRequest {
  message: string
  conversationHistory?: ChatMessage[]
  requestOverview?: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: { scanId: string } }
) {
  console.log('[CHAT-API] POST request received for scanId:', params.scanId)
  
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log('[CHAT-API] Unauthorized - no session')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.email
    console.log('[CHAT-API] Authenticated user:', userId)

    // 2. Get scan and verify ownership
    const scan = await ScanModel.findById(params.scanId)
    
    if (!scan) {
      console.log('[CHAT-API] Scan not found:', params.scanId)
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      )
    }

    if (scan.userId !== session.user.id) {
      console.log('[CHAT-API] Unauthorized - wrong user. Scan owner:', scan.userId, 'Request user:', session.user.id)
      return NextResponse.json(
        { error: 'Unauthorized - not your scan' },
        { status: 403 }
      )
    }

    console.log('[CHAT-API] Scan verified, findings count:', scan.totalFindings)

    // 3. Parse request
    const body: ChatRequest = await request.json()
    const { message, conversationHistory = [], requestOverview = false } = body
    
    console.log('[CHAT-API] Request type:', requestOverview ? 'overview' : 'chat')
    console.log('[CHAT-API] User message:', message?.substring(0, 100))
    console.log('[CHAT-API] Conversation history length:', conversationHistory.length)

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
      console.log('[CHAT-API] Generating scan overview...')
      response = await generateScanOverview(scanContext, userId)
    } else {
      // Conversational response
      if (!message || message.trim().length === 0) {
        console.log('[CHAT-API] Error: Empty message')
        return NextResponse.json(
          { error: 'Message is required' },
          { status: 400 }
        )
      }

      console.log('[CHAT-API] Generating chat response...')
      response = await generateChatResponse(
        message,
        scanContext,
        conversationHistory,
        userId
      )
    }

    console.log('[CHAT-API] Response generated successfully')
    console.log('[CHAT-API] Source:', response.source, 'Provider:', response.provider, 'Model:', response.model)
    console.log('[CHAT-API] Duration:', response.duration, 'ms')

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
    console.error('[CHAT-API] Error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
