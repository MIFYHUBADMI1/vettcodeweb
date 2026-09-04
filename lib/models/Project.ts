/**
 * Project Model
 * User projects for organizing scans, code, and work
 */

import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'

export type ProjectType = 'web' | 'mobile' | 'api' | 'library' | 'other'
export type ProjectStatus = 'active' | 'archived' | 'deleted'

export interface Project {
  _id: ObjectId
  userId: string
  name: string
  description?: string
  type: ProjectType
  status: ProjectStatus
  
  // Project metadata
  repository?: string // Git repo URL
  language?: string // Primary language
  framework?: string // Framework/stack
  
  // Stats
  scanCount: number
  lastScanAt?: Date
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export interface CreateProjectInput {
  userId: string
  name: string
  description?: string
  type: ProjectType
  repository?: string
  language?: string
  framework?: string
}

export class ProjectModel {
  private static readonly COLLECTION = 'projects'

  static async getCollection() {
    const db = await getDb()
    return db.collection<Project>(this.COLLECTION)
  }

  /**
   * Create a new project
   */
  static async create(input: CreateProjectInput): Promise<Project> {
    const collection = await this.getCollection()
    
    const project: Omit<Project, '_id'> = {
      ...input,
      status: 'active',
      scanCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await collection.insertOne(project as any)
    return { ...project, _id: result.insertedId }
  }

  /**
   * Find project by ID
   */
  static async findById(projectId: string, userId: string): Promise<Project | null> {
    const collection = await this.getCollection()
    return await collection.findOne({
      _id: new ObjectId(projectId),
      userId,
      status: { $ne: 'deleted' },
    })
  }

  /**
   * Get all projects for a user
   */
  static async getByUser(
    userId: string,
    options?: {
      status?: ProjectStatus
      limit?: number
      skip?: number
    }
  ): Promise<Project[]> {
    const collection = await this.getCollection()
    
    const query: any = { userId }
    if (options?.status) {
      query.status = options.status
    } else {
      query.status = { $ne: 'deleted' }
    }
    
    return await collection
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(options?.limit || 100)
      .skip(options?.skip || 0)
      .toArray()
  }

  /**
   * Update project
   */
  static async update(
    projectId: string,
    userId: string,
    updates: Partial<Omit<Project, '_id' | 'userId' | 'createdAt'>>
  ): Promise<Project | null> {
    const collection = await this.getCollection()
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(projectId), userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )
    
    return result as Project | null
  }

  /**
   * Delete project (soft delete)
   */
  static async delete(projectId: string, userId: string): Promise<boolean> {
    const collection = await this.getCollection()
    
    const result = await collection.updateOne(
      { _id: new ObjectId(projectId), userId },
      {
        $set: {
          status: 'deleted',
          updatedAt: new Date(),
        },
      }
    )
    
    return result.modifiedCount > 0
  }

  /**
   * Increment scan count
   */
  static async incrementScanCount(projectId: string): Promise<void> {
    const collection = await this.getCollection()
    
    await collection.updateOne(
      { _id: new ObjectId(projectId) },
      {
        $inc: { scanCount: 1 },
        $set: {
          lastScanAt: new Date(),
          updatedAt: new Date(),
        },
      }
    )
  }

  /**
   * Get project stats
   */
  static async getStats(userId: string): Promise<{
    total: number
    active: number
    archived: number
    byType: Record<ProjectType, number>
  }> {
    const collection = await this.getCollection()
    
    const projects = await collection
      .find({ userId, status: { $ne: 'deleted' } })
      .toArray()
    
    const stats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      archived: projects.filter(p => p.status === 'archived').length,
      byType: {
        web: 0,
        mobile: 0,
        api: 0,
        library: 0,
        other: 0,
      } as Record<ProjectType, number>,
    }
    
    projects.forEach(project => {
      stats.byType[project.type]++
    })
    
    return stats
  }

  /**
   * Archive project
   */
  static async archive(projectId: string, userId: string): Promise<boolean> {
    return !!(await this.update(projectId, userId, { status: 'archived' }))
  }

  /**
   * Restore archived project
   */
  static async restore(projectId: string, userId: string): Promise<boolean> {
    return !!(await this.update(projectId, userId, { status: 'active' }))
  }

  /**
   * Create indexes
   */
  static async createIndexes(): Promise<void> {
    const collection = await this.getCollection()
    
    await collection.createIndex({ userId: 1, status: 1 })
    await collection.createIndex({ userId: 1, updatedAt: -1 })
  }
}
