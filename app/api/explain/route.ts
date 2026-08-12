/**
 * AI Explanation API Endpoint
 * POST /api/explain
 * 
 * Generates beginner-friendly explanations for security findings
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateAIExplanation } from '@/lib/ai'
import { redactSecrets, containsSecrets } from '@/lib/secret-redaction'
import type { Finding, AIExplanationRequest, AIExplanationResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body: AIExplanationRequest = await request.json()
    const { finding } = body

    if (!finding) {
      return NextResponse.json(
        { error: 'Finding is required' },
        { status: 400 }
      )
    }

    // 3. Redact secrets if necessary
    let safeFinding = finding
    if (containsSecrets(finding)) {
      safeFinding = redactSecrets(finding)
      console.log('🔒 Redacted secret before sending to AI')
    }

    // 4. Generate explanation using AI Router
    const startTime = Date.now()
    
    const result = await generateAIExplanation(
      safeFinding,
      session.user.email // Use email as userId
    )

    const duration = Date.now() - startTime

    // 5. Build response
    const response: AIExplanationResponse = {
      explanation: result.explanation,
      source: result.source,
      duration,
    }

    // Add quota info if quota was exceeded
    if (result.quotaInfo && !result.quotaInfo.allowed) {
      return NextResponse.json(
        {
          ...response,
          quotaExceeded: true,
          quotaReason: result.quotaInfo.reason,
        },
        { status: 200 } // Still 200, just with quota info
      )
    }

    // 6. Return successful response
    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('AI Explanation error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to generate explanation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
