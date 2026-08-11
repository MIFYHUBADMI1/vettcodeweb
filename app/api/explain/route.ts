import { NextRequest, NextResponse } from 'next/server'
import { generateAIExplanation } from '@/lib/ai'
import { Finding } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const finding: Finding = body.finding
    const userId = body.userId || 'anonymous' // In production, get from auth session

    if (!finding) {
      return NextResponse.json({ error: 'Finding is required' }, { status: 400 })
    }

    // Generate explanation with subscription-aware routing
    const result = await generateAIExplanation(finding, userId)

    // Check if quota was exceeded
    if (result.quotaInfo && !result.quotaInfo.allowed) {
      return NextResponse.json({
        explanation: result.explanation,
        source: result.source,
        duration: result.duration,
        quotaExceeded: true,
        quotaMessage: result.quotaInfo.reason,
        upgradePrompt: 'Upgrade to Pro for more AI explanations!',
      })
    }

    return NextResponse.json({
      explanation: result.explanation,
      source: result.source,
      provider: result.provider,
      model: result.model,
      duration: result.duration,
      quotaExceeded: false,
    })
  } catch (error: any) {
    console.error('Explanation API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate explanation' },
      { status: 500 }
    )
  }
}
