/**
 * AI Integration - Main Entry Point
 * Uses AI Router for intelligent provider selection
 */

import { Explanation, Finding } from './types'
import { AIRouter, AIRouterResult } from './ai-router'
import { getUserPlan, canMakeAIRequest } from './subscription'
import { checkQuota } from './usage-tracking'

// Create singleton router instance
const aiRouter = new AIRouter()

/**
 * Main AI explanation function
 * Uses AI Router with subscription-aware routing
 */
export async function generateAIExplanation(
  finding: Finding,
  userId: string = 'anonymous'
): Promise<{
  explanation: Explanation
  source: 'template' | 'ai'
  provider?: string
  model?: string
  duration: number
  quotaInfo?: {
    allowed: boolean
    remaining?: number
    limit?: number
    reason?: string
  }
}> {
  // Get user's plan
  const plan = await getUserPlan(userId)

  // Check if user can make AI request (quota enforcement)
  const quotaCheck = await checkQuota(
    userId,
    plan.dailyAIRequestLimit,
    plan.monthlyAIRequestLimit
  )

  if (!quotaCheck.allowed) {
    // Quota exceeded - return template-only result
    const result = await aiRouter.generateExplanation(finding, {
      userId,
      plan: { ...plan, allowedProviders: [] }, // Force template-only
      feature: 'finding_explanation',
    })

    return {
      ...result,
      quotaInfo: {
        allowed: false,
        reason: quotaCheck.reason,
      },
    }
  }

  // Quota OK - use AI router
  const result = await aiRouter.generateExplanation(finding, {
    userId,
    plan,
    feature: 'finding_explanation',
  })

  return {
    ...result,
    quotaInfo: {
      allowed: true,
    },
  }
}

/**
 * Get router statistics (for monitoring)
 */
export function getAIStats() {
  return aiRouter.getCacheStats()
}
