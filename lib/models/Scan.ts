/**
 * Scan Model (MongoDB)
 * Stores scan results and history
 */

import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'
import { ScanResult } from '../types'

export interface Scan {
  _id?: ObjectId
  userId: string
  
  // Scan metadata
  scanPath: string
  timestamp: Date
  sensorsUsed: string[]
  sensorsSkipped: string[]
  
  // Summary
  totalFindings: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  infoCount: number
  
  // Full scan data (JSON)
  scanData: ScanResult
  
  // Storage
  imagekitUrl?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export class ScanModel {
  static async getCollection() {
    const db = await getDb()
    return db.collection<Scan>('scans')
  }

  /**
   * Create new scan record
   */
  static async create(
    userId: string,
    scanData: ScanResult,
    imagekitUrl?: string
  ): Promise<Scan> {
    const collection = await this.getCollection()
    
    const scan: Scan = {
      userId,
      scanPath: scanData.scan.path,
      timestamp: new Date(scanData.scan.timestamp),
      sensorsUsed: scanData.scan.sensorsUsed,
      sensorsSkipped: scanData.scan.sensorsSkipped,
      totalFindings: scanData.summary.total,
      criticalCount: scanData.summary.critical,
      highCount: scanData.summary.high,
      mediumCount: scanData.summary.medium,
      lowCount: scanData.summary.low,
      infoCount: scanData.summary.info,
      scanData,
      imagekitUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await collection.insertOne(scan as any)
    return { ...scan, _id: result.insertedId }
  }

  /**
   * Find scan by ID
   */
  static async findById(scanId: string): Promise<Scan | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id: new ObjectId(scanId) })
  }

  /**
   * Get user's scans
   */
  static async getUserScans(
    userId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<Scan[]> {
    const collection = await this.getCollection()
    
    return await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray()
  }

  /**
   * Get scan count for user
   */
  static async getUserScanCount(userId: string): Promise<number> {
    const collection = await this.getCollection()
    return await collection.countDocuments({ userId })
  }

  /**
   * Get scan history with trends
   */
  static async getHistory(userId: string, days: number = 30): Promise<{
    scans: Scan[]
    trends: {
      totalScans: number
      avgFindings: number
      criticalTrend: number[]
      highTrend: number[]
    }
  }> {
    const collection = await this.getCollection()
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const scans = await collection
      .find({
        userId,
        createdAt: { $gte: startDate },
      })
      .sort({ createdAt: -1 })
      .toArray()
    
    // Calculate trends
    const totalScans = scans.length
    const avgFindings = totalScans > 0
      ? scans.reduce((sum, s) => sum + s.totalFindings, 0) / totalScans
      : 0
    
    const criticalTrend = scans.map((s) => s.criticalCount)
    const highTrend = scans.map((s) => s.highCount)
    
    return {
      scans,
      trends: {
        totalScans,
        avgFindings,
        criticalTrend,
        highTrend,
      },
    }
  }

  /**
   * Get latest scan for user
   */
  static async getLatest(userId: string): Promise<Scan | null> {
    const collection = await this.getCollection()
    
    return await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(1)
      .next()
  }

  /**
   * Delete scan
   */
  static async delete(scanId: string): Promise<boolean> {
    const collection = await this.getCollection()
    
    const result = await collection.deleteOne({ _id: new ObjectId(scanId) })
    return result.deletedCount === 1
  }

  /**
   * Get scan statistics (admin)
   */
  static async getStats(): Promise<{
    totalScans: number
    totalFindings: number
    avgFindingsPerScan: number
    bySeverity: {
      critical: number
      high: number
      medium: number
      low: number
      info: number
    }
  }> {
    const collection = await this.getCollection()
    
    const result = await collection
      .aggregate([
        {
          $group: {
            _id: null,
            totalScans: { $sum: 1 },
            totalFindings: { $sum: '$totalFindings' },
            critical: { $sum: '$criticalCount' },
            high: { $sum: '$highCount' },
            medium: { $sum: '$mediumCount' },
            low: { $sum: '$lowCount' },
            info: { $sum: '$infoCount' },
          },
        },
      ])
      .toArray()
    
    const stats = result[0] || {
      totalScans: 0,
      totalFindings: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    }
    
    return {
      totalScans: stats.totalScans,
      totalFindings: stats.totalFindings,
      avgFindingsPerScan: stats.totalScans > 0
        ? stats.totalFindings / stats.totalScans
        : 0,
      bySeverity: {
        critical: stats.critical,
        high: stats.high,
        medium: stats.medium,
        low: stats.low,
        info: stats.info,
      },
    }
  }
}
