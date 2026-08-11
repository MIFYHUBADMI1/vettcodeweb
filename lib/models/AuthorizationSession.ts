/**
 * Authorization Session Model (MongoDB)
 * Temporary sessions for CLI device authorization flow
 */

import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'
import crypto from 'crypto'

export type AuthorizationStatus = 'pending' | 'approved' | 'denied' | 'expired'

export interface AuthorizationSession {
  _id?: ObjectId
  sessionId: string // Random unique identifier
  verificationCode: string // Short human-friendly code
  status: AuthorizationStatus
  userId?: ObjectId // Set when user approves
  deviceInfo?: {
    userAgent?: string
    ip?: string
    platform?: string
    hostname?: string
  }
  cliToken?: string // Generated when approved (stored temporarily)
  createdAt: Date
  expiresAt: Date
  approvedAt?: Date
  deniedAt?: Date
}

export class AuthorizationSessionModel {
  static async getCollection() {
    const db = await getDb()
    return db.collection<AuthorizationSession>('authorization_sessions')
  }

  /**
   * Generate a short human-friendly verification code
   * Format: ABCD-EFGH (8 characters, 4-4 split)
   */
  static generateVerificationCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing characters
    let code = ''

    for (let i = 0; i < 8; i++) {
      if (i === 4) code += '-'
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return code
  }

  /**
   * Generate a unique session ID
   */
  static generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  /**
   * Create a new authorization session
   */
  static async create(
    deviceInfo?: AuthorizationSession['deviceInfo'],
    expiresInMinutes: number = 15
  ): Promise<AuthorizationSession> {
    const collection = await this.getCollection()

    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes)

    const session: AuthorizationSession = {
      sessionId: this.generateSessionId(),
      verificationCode: this.generateVerificationCode(),
      status: 'pending',
      deviceInfo,
      createdAt: now,
      expiresAt,
    }

    const result = await collection.insertOne(session as any)
    return { ...session, _id: result.insertedId }
  }

  /**
   * Find session by session ID
   */
  static async findBySessionId(sessionId: string): Promise<AuthorizationSession | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ sessionId })
  }

  /**
   * Find session by verification code
   */
  static async findByVerificationCode(code: string): Promise<AuthorizationSession | null> {
    const collection = await this.getCollection()
    
    // Case-insensitive search
    return await collection.findOne({
      verificationCode: code.toUpperCase(),
      status: 'pending',
      expiresAt: { $gt: new Date() },
    })
  }

  /**
   * Approve a session (user authorized the CLI)
   */
  static async approve(sessionId: string, userId: string, cliToken: string): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      {
        sessionId,
        status: 'pending',
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          status: 'approved',
          userId: new ObjectId(userId),
          cliToken,
          approvedAt: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  }

  /**
   * Deny a session (user rejected the CLI)
   */
  static async deny(sessionId: string): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      {
        sessionId,
        status: 'pending',
      },
      {
        $set: {
          status: 'denied',
          deniedAt: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  }

  /**
   * Mark expired sessions (cleanup)
   */
  static async expireOldSessions(): Promise<number> {
    const collection = await this.getCollection()

    const result = await collection.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() },
      },
      {
        $set: { status: 'expired' },
      }
    )

    return result.modifiedCount
  }

  /**
   * Delete old sessions (cleanup - optional)
   */
  static async deleteOldSessions(olderThanHours: number = 24): Promise<number> {
    const collection = await this.getCollection()

    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - olderThanHours)

    const result = await collection.deleteMany({
      createdAt: { $lt: cutoff },
    })

    return result.deletedCount
  }

  /**
   * Get session status
   */
  static async getStatus(sessionId: string): Promise<{
    status: AuthorizationStatus
    cliToken?: string
  } | null> {
    const collection = await this.getCollection()
    const session = await collection.findOne({ sessionId })

    if (!session) return null

    // Check if expired
    if (session.status === 'pending' && new Date() > session.expiresAt) {
      await collection.updateOne(
        { sessionId },
        { $set: { status: 'expired' } }
      )
      return { status: 'expired' }
    }

    return {
      status: session.status,
      cliToken: session.status === 'approved' ? session.cliToken : undefined,
    }
  }
}
