/**
 * User Model (MongoDB)
 */

import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'
import { PlanTier } from '../subscription'

export interface User {
  _id?: ObjectId
  email: string
  name?: string
  image?: string
  password?: string // Only for email/password auth
  plan: PlanTier
  createdAt: Date
  updatedAt: Date
  
  // Email verification
  emailVerified?: Date
  verificationToken?: string
  verificationExpires?: Date
  
  // Auth provider
  provider?: 'google' | 'credentials'
  
  // Token-based usage (NEW)
  tokens: {
    monthlyAllocation: number // Tokens allocated per month based on plan
    currentBalance: number // Remaining tokens this month
    lastResetDate: Date // When tokens were last reset/topped up
    lifetimeUsed: number // Total tokens used ever
    dailyLimit?: number // For free users: daily token limit (15000/30 = 500)
    dailyUsed?: number // For free users: tokens used today
    lastDailyResetDate?: Date // For free users: when daily usage was last reset
  }
  
  // Subscription details (for paid plans)
  subscriptionId?: string // Stripe subscription ID
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing'
  subscriptionStartDate?: Date
  subscriptionEndDate?: Date
  
  // Settings
  preferences?: {
    emailNotifications?: boolean
    weeklyReports?: boolean
  }
  
  // Metadata
  lastLoginAt?: Date
  scanCount?: number
}

export class UserModel {
  static async getCollection() {
    const db = await getDb()
    return db.collection<User>('users')
  }

  /**
   * Create new user
   * Tokens are initialized here based on plan, so callers don't pass them.
   */
  static async create(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'tokens'>): Promise<User> {
    const collection = await this.getCollection()
    
    // Initialize tokens based on plan
    const { SUBSCRIPTION_PLANS } = await import('../subscription')
    const plan = SUBSCRIPTION_PLANS[userData.plan] || SUBSCRIPTION_PLANS.free
    
    const user: User = {
      ...userData,
      tokens: {
        monthlyAllocation: plan.monthlyTokenAllocation,
        currentBalance: plan.monthlyTokenAllocation,
        lastResetDate: new Date(),
        lifetimeUsed: 0,
        // Free users get daily limits
        ...(userData.plan === 'free' ? {
          dailyLimit: Math.floor(plan.monthlyTokenAllocation / 30), // 15000 / 30 = 500
          dailyUsed: 0,
          lastDailyResetDate: new Date(),
        } : {}),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      scanCount: 0,
    }
    
    const result = await collection.insertOne(user as any)
    return { ...user, _id: result.insertedId }
  }

  /**
   * Find user by ID
   */
  static async findById(userId: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id: new ObjectId(userId) })
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ email })
  }

  /**
   * Find user by verification token
   */
  static async findByVerificationToken(token: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    })
  }

  /**
   * Set verification token
   */
  static async setVerificationToken(
    userId: string,
    token: string,
    expiresInHours: number = 24
  ): Promise<void> {
    const collection = await this.getCollection()
    
    const expires = new Date()
    expires.setHours(expires.getHours() + expiresInHours)
    
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          verificationToken: token,
          verificationExpires: expires,
          updatedAt: new Date(),
        },
      }
    )
  }

  /**
   * Verify email
   */
  static async verifyEmail(userId: string): Promise<void> {
    const collection = await this.getCollection()
    
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          emailVerified: new Date(),
          updatedAt: new Date(),
        },
        $unset: {
          verificationToken: '',
          verificationExpires: '',
        },
      }
    )
  }

  /**
   * Update user plan
   */
  static async updatePlan(
    userId: string,
    plan: PlanTier,
    subscriptionDetails?: {
      subscriptionId: string
      status: User['subscriptionStatus']
      startDate: Date
      endDate: Date
    }
  ): Promise<void> {
    const collection = await this.getCollection()
    
    const update: any = {
      plan,
      updatedAt: new Date(),
    }
    
    if (subscriptionDetails) {
      update.subscriptionId = subscriptionDetails.subscriptionId
      update.subscriptionStatus = subscriptionDetails.status
      update.subscriptionStartDate = subscriptionDetails.startDate
      update.subscriptionEndDate = subscriptionDetails.endDate
    }
    
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: update }
    )
  }

  /**
   * Increment scan count
   */
  static async incrementScanCount(userId: string): Promise<void> {
    const collection = await this.getCollection()
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $inc: { scanCount: 1 },
        $set: { updatedAt: new Date() }
      }
    )
  }

  /**
   * Update last login
   */
  static async updateLastLogin(userId: string): Promise<void> {
    const collection = await this.getCollection()
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          lastLoginAt: new Date(),
          updatedAt: new Date()
        }
      }
    )
  }

  /**
   * Update password
   */
  static async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    const collection = await this.getCollection()
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    )
  }

  /**
   * Get all users (admin)
   */
  static async findAll(limit: number = 100, skip: number = 0): Promise<User[]> {
    const collection = await this.getCollection()
    return await collection
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray()
  }

  /**
   * Count users by plan
   */
  static async countByPlan(): Promise<Record<PlanTier, number>> {
    const collection = await this.getCollection()
    
    const result = await collection
      .aggregate([
        {
          $group: {
            _id: '$plan',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()
    
    const counts: any = { free: 0, pro: 0, pro_plus: 0 }
    result.forEach((item) => {
      counts[item._id] = item.count
    })
    
    return counts
  }

  /**
   * Deduct tokens from user balance
   */
  static async deductTokens(userId: string, tokens: number): Promise<{ success: boolean; newBalance: number; reason?: string }> {
    const collection = await this.getCollection()
    
    // Check and reset tokens if needed (handles both free reset and paid top-up)
    await this.resetTokensIfNeeded(userId)
    
    const user = await this.findById(userId)
    if (!user) {
      return { success: false, newBalance: 0, reason: 'User not found' }
    }
    
    // For FREE users: Check daily limit first
    if (user.plan === 'free' && user.tokens.dailyLimit) {
      // Reset daily usage if new day
      await this.resetDailyUsageIfNeeded(userId)
      
      // Refresh user data after potential daily reset
      const refreshedUser = await this.findById(userId)
      if (!refreshedUser) {
        return { success: false, newBalance: 0, reason: 'User not found' }
      }
      
      const dailyUsed = refreshedUser.tokens.dailyUsed || 0
      const dailyLimit = refreshedUser.tokens.dailyLimit!
      
      // Check if it's the last day of the month
      const now = new Date()
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const isLastDayOfMonth = now.getDate() === lastDayOfMonth
      
      // On last day of month, allow using all remaining tokens
      // Otherwise, enforce daily limit
      if (!isLastDayOfMonth && dailyUsed + tokens > dailyLimit) {
        return { 
          success: false, 
          newBalance: refreshedUser.tokens.currentBalance,
          reason: `Daily limit reached (${dailyLimit} tokens/day). Resets tomorrow or upgrade for unlimited daily usage.`
        }
      }
    }
    
    // Check overall balance
    if (user.tokens.currentBalance < tokens) {
      return { 
        success: false, 
        newBalance: user.tokens.currentBalance,
        reason: 'Insufficient tokens. Upgrade your plan for more tokens.'
      }
    }
    
    // Deduct tokens
    const updateDoc: any = {
      $inc: {
        'tokens.currentBalance': -tokens,
        'tokens.lifetimeUsed': tokens,
      },
      $set: {
        updatedAt: new Date(),
      },
    }
    
    // For free users, also increment daily usage
    if (user.plan === 'free') {
      updateDoc.$inc['tokens.dailyUsed'] = tokens
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      updateDoc,
      { returnDocument: 'after' }
    )
    
    return {
      success: true,
      newBalance: result?.tokens.currentBalance || 0,
    }
  }

  /**
   * Reset daily usage for free users if new day
   */
  static async resetDailyUsageIfNeeded(userId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const user = await this.findById(userId)
    
    if (!user || user.plan !== 'free') {
      return false
    }
    
    // If tokens not initialized or daily tracking missing, skip
    if (!user.tokens || !user.tokens.lastDailyResetDate) {
      return false
    }
    
    const now = new Date()
    const lastReset = new Date(user.tokens.lastDailyResetDate)
    
    // Check if we're in a new day
    const isNewDay = 
      now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()
    
    if (isNewDay) {
      await collection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            'tokens.dailyUsed': 0,
            'tokens.lastDailyResetDate': now,
            updatedAt: now,
          },
        }
      )
      return true
    }
    
    return false
  }

  /**
   * Reset tokens if new month started
   * - Free users: RESET to monthly allocation
   * - Paid users: TOP UP (add monthly allocation to current balance)
   */
  static async resetTokensIfNeeded(userId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const user = await this.findById(userId)
    
    if (!user) return false
    
    // If user doesn't have tokens initialized, initialize them now
    if (!user.tokens || typeof user.tokens.currentBalance !== 'number') {
      const { SUBSCRIPTION_PLANS } = await import('../subscription')
      const plan = SUBSCRIPTION_PLANS[user.plan] || SUBSCRIPTION_PLANS.free
      const now = new Date()

      const tokenData: any = {
        monthlyAllocation: plan.monthlyTokenAllocation,
        currentBalance: plan.monthlyTokenAllocation,
        lastResetDate: now,
        lifetimeUsed: 0,
      }

      // Add daily limits for free users
      if (user.plan === 'free') {
        tokenData.dailyLimit = Math.floor(plan.monthlyTokenAllocation / 30)
        tokenData.dailyUsed = 0
        tokenData.lastDailyResetDate = now
      }

      await collection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            tokens: tokenData,
            updatedAt: now,
          },
        }
      )

      console.log(`[USER] Initialized tokens for user ${userId}`)
      return true
    }
    
    const now = new Date()
    const lastReset = new Date(user.tokens.lastResetDate)
    
    // Check if we're in a new month
    const isNewMonth = 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()
    
    if (isNewMonth) {
      const { SUBSCRIPTION_PLANS } = await import('../subscription')
      const plan = SUBSCRIPTION_PLANS[user.plan] || SUBSCRIPTION_PLANS.free
      
      if (user.plan === 'free') {
        // FREE USERS: RESET tokens to monthly allocation
        await collection.updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              'tokens.currentBalance': plan.monthlyTokenAllocation,
              'tokens.lastResetDate': now,
              'tokens.monthlyAllocation': plan.monthlyTokenAllocation,
              'tokens.dailyUsed': 0,
              'tokens.dailyLimit': Math.floor(plan.monthlyTokenAllocation / 30),
              'tokens.lastDailyResetDate': now,
              updatedAt: now,
            },
          }
        )
      } else {
        // PAID USERS: TOP UP (add tokens to existing balance)
        await collection.updateOne(
          { _id: new ObjectId(userId) },
          {
            $inc: {
              'tokens.currentBalance': plan.monthlyTokenAllocation,
            },
            $set: {
              'tokens.lastResetDate': now,
              'tokens.monthlyAllocation': plan.monthlyTokenAllocation,
              updatedAt: now,
            },
          }
        )
      }
      
      return true
    }
    
    return false
  }

  /**
   * Get token balance
   */
  static async getTokenBalance(userId: string): Promise<{ 
    currentBalance: number
    monthlyAllocation: number
    percentUsed: number
    plan: PlanTier
    // Free user specific
    dailyLimit?: number
    dailyUsed?: number
    dailyRemaining?: number
    isLastDayOfMonth?: boolean
  } | null> {
    await this.resetTokensIfNeeded(userId)
    
    const user = await this.findById(userId)
    if (!user) return null
    
    const percentUsed = ((user.tokens.monthlyAllocation - user.tokens.currentBalance) / user.tokens.monthlyAllocation) * 100
    
    const result: any = {
      currentBalance: user.tokens.currentBalance,
      monthlyAllocation: user.tokens.monthlyAllocation,
      percentUsed: Math.round(percentUsed),
      plan: user.plan,
    }
    
    // Add daily usage info for free users
    if (user.plan === 'free' && user.tokens.dailyLimit) {
      await this.resetDailyUsageIfNeeded(userId)
      const refreshedUser = await this.findById(userId)
      
      if (refreshedUser) {
        const dailyUsed = refreshedUser.tokens.dailyUsed || 0
        const dailyLimit = refreshedUser.tokens.dailyLimit!
        
        // Check if it's last day of month
        const now = new Date()
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const isLastDayOfMonth = now.getDate() === lastDayOfMonth
        
        result.dailyLimit = dailyLimit
        result.dailyUsed = dailyUsed
        result.dailyRemaining = Math.max(0, dailyLimit - dailyUsed)
        result.isLastDayOfMonth = isLastDayOfMonth
      }
    }
    
    return result
  }

  /**
   * Add bonus tokens (for promotions, referrals, etc.)
   */
  static async addBonusTokens(userId: string, tokens: number): Promise<number> {
    const collection = await this.getCollection()
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $inc: {
          'tokens.currentBalance': tokens,
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )
    
    return result?.tokens.currentBalance || 0
  }
}
