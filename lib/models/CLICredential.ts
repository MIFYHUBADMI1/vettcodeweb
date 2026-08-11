/**
 * CLI Credential Model (MongoDB)
 * Stores hashed CLI authentication tokens
 */

import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'
import crypto from 'crypto'

export interface CLICredential {
  _id?: ObjectId
  userId: ObjectId
  tokenHash: string // SHA-256 hash of the actual token
  deviceName?: string
  deviceInfo?: {
    platform?: string
    hostname?: string
  }
  createdAt: Date
  lastUsedAt: Date
  expiresAt: Date
  revokedAt?: Date
}

export class CLICredentialModel {
  static async getCollection() {
    const db = await getDb()
    return db.collection<CLICredential>('cli_credentials')
  }

  /**
   * Hash a token for storage
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  /**
   * Generate a cryptographically secure token
   */
  static generateToken(): string {
    // Generate 32 bytes = 256 bits of randomness
    // Base64 encoded for safe transmission
    return crypto.randomBytes(32).toString('base64url')
  }

  /**
   * Create new CLI credential
   * @returns The raw token (only time it's ever returned) and credential record
   */
  static async create(
    userId: string | ObjectId,
    deviceName?: string,
    deviceInfo?: CLICredential['deviceInfo'],
    expiresInDays: number = 90
  ): Promise<{ token: string; credential: CLICredential }> {
    const collection = await this.getCollection()

    // Generate secure token
    const token = this.generateToken()
    const tokenHash = this.hashToken(token)

    // Calculate expiration
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const credential: CLICredential = {
      userId: typeof userId === 'string' ? new ObjectId(userId) : userId,
      tokenHash,
      deviceName,
      deviceInfo,
      createdAt: now,
      lastUsedAt: now,
      expiresAt,
    }

    const result = await collection.insertOne(credential as any)
    const createdCredential = { ...credential, _id: result.insertedId }

    return { token, credential: createdCredential }
  }

  /**
   * Find credential by token hash
   */
  static async findByToken(token: string): Promise<CLICredential | null> {
    const collection = await this.getCollection()
    const tokenHash = this.hashToken(token)

    const credential = await collection.findOne({
      tokenHash,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    })

    return credential
  }

  /**
   * Find all credentials for a user
   */
  static async findByUserId(userId: string): Promise<CLICredential[]> {
    const collection = await this.getCollection()

    return await collection
      .find({
        userId: new ObjectId(userId),
        revokedAt: { $exists: false },
      })
      .sort({ createdAt: -1 })
      .toArray()
  }

  /**
   * Update last used timestamp
   */
  static async updateLastUsed(credentialId: ObjectId): Promise<void> {
    const collection = await this.getCollection()

    await collection.updateOne(
      { _id: credentialId },
      { $set: { lastUsedAt: new Date() } }
    )
  }

  /**
   * Revoke a credential
   */
  static async revoke(token: string): Promise<boolean> {
    const collection = await this.getCollection()
    const tokenHash = this.hashToken(token)

    const result = await collection.updateOne(
      { tokenHash, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } }
    )

    return result.modifiedCount > 0
  }

  /**
   * Revoke a credential by ID
   */
  static async revokeById(credentialId: string): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { _id: new ObjectId(credentialId), revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } }
    )

    return result.modifiedCount > 0
  }

  /**
   * Revoke all credentials for a user
   */
  static async revokeAllForUser(userId: string): Promise<number> {
    const collection = await this.getCollection()

    const result = await collection.updateMany(
      { userId: new ObjectId(userId), revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } }
    )

    return result.modifiedCount
  }

  /**
   * Clean up expired credentials (maintenance)
   */
  static async cleanupExpired(): Promise<number> {
    const collection = await this.getCollection()

    const result = await collection.deleteMany({
      expiresAt: { $lt: new Date() },
    })

    return result.deletedCount
  }
}
