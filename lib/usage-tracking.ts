/**
 * Usage Tracking System with MongoDB
 * 
 * Tracks AI usage for cost analysis, quotas, and billing
 */

import { AIUsageModel } from './models/AIUsage'

export interface AIUsageRecord {
  userId: string
  plan: string
  provider: string
  model: string
  feature: string
  inputTokens: number
  outputTokens: number
  estimatedCost: number
  timestamp?: Date
}

/**
 * Track AI usage
 */
export async function trackAIUsage(record: AIUsageRecord): Promise<void> {
  try {
    await AIUsageModel.track(record)
    
    // Log for monitoring
    console.log('AI Usage:', {
      user: record.userId,
      provider: record.provider,
      model: record.model,
      cost: record.estimatedCost.toFixed(4),
      tokens: record.inputTokens + record.outputTokens,
    })
  } catch (error) {
    console.error('Failed to track AI usage:', error)
    // Don't throw - tracking failure shouldn't break the main flow
  }
}

/**
 * Get user's AI usage for a time period
 */
export async function getAIUsage(
  userId: string,
  period: 'day' | 'month' | 'all' = 'day'
): Promise<{
  requests: number
  totalTokens: number
  totalCost: number
  byProvider: Record<string, number>
}> {
  try {
    return await AIUsageModel.getAnalytics(userId, period)
  } catch (error) {
    console.error('Failed to get AI usage:', error)
    return {
      requests: 0,
      totalTokens: 0,
      totalCost: 0,
      byProvider: {},
    }
  }
}

/**
 * Get daily AI request count (for quota enforcement)
 */
export async function getDailyAIRequests(userId: string): Promise<number> {
  try {
    return await AIUsageModel.getDailyCount(userId)
  } catch (error) {
    console.error('Failed to get daily requests:', error)
    return 0
  }
}

/**
 * Get monthly AI request count (for quota enforcement)
 */
export async function getMonthlyAIRequests(userId: string): Promise<number> {
  try {
    return await AIUsageModel.getMonthlyCount(userId)
  } catch (error) {
    console.error('Failed to get monthly requests:', error)
    return 0
  }
}

/**
 * Check if user is within quota
 */
export async function checkQuota(
  userId: string,
  dailyLimit: number,
  monthlyLimit: number
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const dailyUsage = await getDailyAIRequests(userId)
    
    if (dailyUsage >= dailyLimit) {
      return {
        allowed: false,
        reason: `Daily AI limit reached (${dailyLimit} requests). Resets tomorrow or upgrade for more!`,
      }
    }

    if (monthlyLimit > 0) {
      const monthlyUsage = await getMonthlyAIRequests(userId)
      if (monthlyUsage >= monthlyLimit) {
        return {
          allowed: false,
          reason: `Monthly AI limit reached (${monthlyLimit} requests). Resets next month or upgrade!`,
        }
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Failed to check quota:', error)
    // Fail open - allow request if check fails
    return { allowed: true }
  }
}

/**
 * Get usage analytics (for dashboard)
 */
export async function getUsageAnalytics(userId: string): Promise<{
  today: { requests: number; cost: number }
  thisMonth: { requests: number; cost: number }
  topProviders: Array<{ provider: string; requests: number }>
  topFeatures: Array<{ feature: string; requests: number }>
}> {
  try {
    const todayUsage = await getAIUsage(userId, 'day')
    const monthUsage = await getAIUsage(userId, 'month')
    
    // Get top providers
    const topProviders = Object.entries(todayUsage.byProvider)
      .map(([provider, requests]) => ({ provider, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5)

    // Get top features
    const topFeatures = await AIUsageModel.getTopFeatures(userId, 5)

    return {
      today: {
        requests: todayUsage.requests,
        cost: todayUsage.totalCost,
      },
      thisMonth: {
        requests: monthUsage.requests,
        cost: monthUsage.totalCost,
      },
      topProviders,
      topFeatures,
    }
  } catch (error) {
    console.error('Failed to get usage analytics:', error)
    return {
      today: { requests: 0, cost: 0 },
      thisMonth: { requests: 0, cost: 0 },
      topProviders: [],
      topFeatures: [],
    }
  }
}

/**
 * Get admin analytics (total usage across all users)
 */
export async function getAdminAnalytics(): Promise<{
  totalRequests: number
  totalCost: number
  totalUsers: number
  byPlan: Record<string, { requests: number; cost: number }>
  byProvider: Record<string, { requests: number; cost: number }>
}> {
  try {
    return await AIUsageModel.getAdminAnalytics()
  } catch (error) {
    console.error('Failed to get admin analytics:', error)
    return {
      totalRequests: 0,
      totalCost: 0,
      totalUsers: 0,
      byPlan: {},
      byProvider: {},
    }
  }
}

/**
 * Export usage data (for billing/analysis)
 */
export async function exportUsageData(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<AIUsageRecord[]> {
  try {
    return await AIUsageModel.export(userId, startDate, endDate)
  } catch (error) {
    console.error('Failed to export usage data:', error)
    return []
  }
}
