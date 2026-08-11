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
  
  // Subscription details
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
   */
  static async create(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const collection = await this.getCollection()
    
    const user: User = {
      ...userData,
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
}
