/**
 * AI Usage Model (MongoDB)
 */

import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'

export interface AIUsage {
  _id?: ObjectId
  userId: string
  plan: string
  provider: string
  model: string
  feature: string
  inputTokens: number
  outputTokens: number
  estimatedCost: number
  createdAt: Date
  
  // Optional metadata
  scanId?: string
  findingId?: string
  success?: boolean
  errorMessage?: string
  duration?: number
}

export class AIUsageModel {
  static async getCollection() {
    const db = await getDb()
    return db.collection<AIUsage>('ai_usage')
  }

  /**
   * Track AI usage
   */
  static async track(usage: Omit<AIUsage, '_id' | 'createdAt'>): Promise<AIUsage> {
    const collection = await this.getCollection()
    
    const record: AIUsage = {
      ...usage,
      createdAt: new Date(),
    }
    
    const result = await collection.insertOne(record as any)
    return { ...record, _id: result.insertedId }
  }

  /**
   * Get usage for a user in a time period
   */
  static async getUsage(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AIUsage[]> {
    const collection = await this.getCollection()
    
    return await collection
      .find({
        userId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ createdAt: -1 })
      .toArray()
  }

  /**
   * Get daily usage count
   */
  static async getDailyCount(userId: string): Promise<number> {
    const collection = await this.getCollection()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return await collection.countDocuments({
      userId,
      createdAt: { $gte: today },
    })
  }

  /**
   * Get monthly usage count
   */
  static async getMonthlyCount(userId: string): Promise<number> {
    const collection = await this.getCollection()
    
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    return await collection.countDocuments({
      userId,
      createdAt: { $gte: startOfMonth },
    })
  }

  /**
   * Get usage analytics
   */
  static async getAnalytics(
    userId: string,
    period: 'day' | 'month' | 'all' = 'day'
  ): Promise<{
    requests: number
    totalTokens: number
    totalCost: number
    byProvider: Record<string, number>
  }> {
    const collection = await this.getCollection()
    
    // Determine date range
    let startDate: Date
    if (period === 'day') {
      startDate = new Date()
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'month') {
      startDate = new Date()
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
    } else {
      startDate = new Date(0) // Beginning of time
    }
    
    const result = await collection
      .aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$provider',
            requests: { $sum: 1 },
            totalTokens: { $sum: { $add: ['$inputTokens', '$outputTokens'] } },
            totalCost: { $sum: '$estimatedCost' },
          },
        },
      ])
      .toArray()
    
    const byProvider: Record<string, number> = {}
    let totalRequests = 0
    let totalTokens = 0
    let totalCost = 0
    
    result.forEach((item) => {
      byProvider[item._id] = item.requests
      totalRequests += item.requests
      totalTokens += item.totalTokens
      totalCost += item.totalCost
    })
    
    return {
      requests: totalRequests,
      totalTokens,
      totalCost,
      byProvider,
    }
  }

  /**
   * Get top features by usage
   */
  static async getTopFeatures(userId: string, limit: number = 5): Promise<
    Array<{ feature: string; requests: number }>
  > {
    const collection = await this.getCollection()
    
    const result = await collection
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$feature',
            requests: { $sum: 1 },
          },
        },
        { $sort: { requests: -1 } },
        { $limit: limit },
      ])
      .toArray()
    
    return result.map((item) => ({
      feature: item._id,
      requests: item.requests,
    }))
  }

  /**
   * Get admin analytics (all users)
   */
  static async getAdminAnalytics(): Promise<{
    totalRequests: number
    totalCost: number
    totalUsers: number
    byPlan: Record<string, { requests: number; cost: number }>
    byProvider: Record<string, { requests: number; cost: number }>
  }> {
    const collection = await this.getCollection()
    
    // Total stats
    const totalStats = await collection
      .aggregate([
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalCost: { $sum: '$estimatedCost' },
            uniqueUsers: { $addToSet: '$userId' },
          },
        },
      ])
      .toArray()
    
    // By plan
    const byPlanResult = await collection
      .aggregate([
        {
          $group: {
            _id: '$plan',
            requests: { $sum: 1 },
            cost: { $sum: '$estimatedCost' },
          },
        },
      ])
      .toArray()
    
    // By provider
    const byProviderResult = await collection
      .aggregate([
        {
          $group: {
            _id: '$provider',
            requests: { $sum: 1 },
            cost: { $sum: '$estimatedCost' },
          },
        },
      ])
      .toArray()
    
    const byPlan: Record<string, { requests: number; cost: number }> = {}
    byPlanResult.forEach((item) => {
      byPlan[item._id] = { requests: item.requests, cost: item.cost }
    })
    
    const byProvider: Record<string, { requests: number; cost: number }> = {}
    byProviderResult.forEach((item) => {
      byProvider[item._id] = { requests: item.requests, cost: item.cost }
    })
    
    return {
      totalRequests: totalStats[0]?.totalRequests || 0,
      totalCost: totalStats[0]?.totalCost || 0,
      totalUsers: totalStats[0]?.uniqueUsers?.length || 0,
      byPlan,
      byProvider,
    }
  }

  /**
   * Export usage data (for billing)
   */
  static async export(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AIUsage[]> {
    return await this.getUsage(userId, startDate, endDate)
  }
}
