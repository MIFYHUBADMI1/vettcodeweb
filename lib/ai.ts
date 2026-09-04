/**
 * AI Integration - Main Entry Point
 * Uses AI Router for intelligent provider selection
 */

import { Explanation, Finding } from './types'
import { AIRouter, AIRouterResult, getBestModelTierForPlan } from './ai-router'
import { getUserPlan, canMakeAIRequest } from './subscription'

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

  // Check if user can make AI request (token-based enforcement)
  const modelTier = getBestModelTierForPlan(plan, 'explanation')
  const tokenCheck = await canMakeAIRequest(userId, plan, modelTier)

  if (!tokenCheck.allowed) {
    // Token limit reached - return template-only result
    const result = await aiRouter.generateExplanation(finding, {
      userId,
      plan: { ...plan, allowedModelTiers: [] }, // Force template-only by blocking all model tiers
      feature: 'finding_explanation',
    })

    return {
      ...result,
      quotaInfo: {
        allowed: false,
        remaining: tokenCheck.tokensRemaining,
        limit: plan.monthlyTokenAllocation,
        reason: tokenCheck.reason,
      },
    }
  }

  // Token balance OK - use AI router
  const result = await aiRouter.generateExplanation(finding, {
    userId,
    plan,
    feature: 'finding_explanation',
  })

  return {
    ...result,
    quotaInfo: {
      allowed: true,
      remaining: tokenCheck.tokensRemaining,
      limit: plan.monthlyTokenAllocation,
    },
  }
}

/**
 * Get router statistics (for monitoring)
 */
export function getAIStats() {
  return aiRouter.getCacheStats()
}
