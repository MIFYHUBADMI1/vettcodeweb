/**
 * VettCode Vibe Project Model
 * Represents an AI-powered development project
 */

import { ObjectId } from 'mongodb';
import { getDatabase } from '../mongodb';

export type ProjectType = 'web' | 'mobile' | 'game' | 'api' | 'other';
export type ProjectStatus = 'planning' | 'active' | 'archived';

export interface ProjectPlan {
  goal: string;
  features: string[];
  pages: string[];
  dataRequirements: string[];
  authentication: boolean;
  externalServices: string[];
  securityConsiderations: string[];
  deploymentTarget: string;
}

export interface VibeProject {
  _id: ObjectId;
  userId: string;
  name: string;
  description: string;
  type: ProjectType;
  framework?: string;
  status: ProjectStatus;
  
  // AI-generated project plan
  plan?: ProjectPlan;
  
  // File storage reference
  storageId?: string;
  
  // Associated scans
  scanIds: string[];
  
  // Deployment
  deploymentUrl?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
}

export interface CreateVibeProjectInput {
  userId: string;
  name: string;
  description: string;
  type: ProjectType;
  framework?: string;
}

export interface UpdateVibeProjectInput {
  name?: string;
  description?: string;
  framework?: string;
  status?: ProjectStatus;
  plan?: ProjectPlan;
  deploymentUrl?: string;
}

/**
 * VibeProject database operations
 */
export class VibeProjectModel {
  private static COLLECTION = 'vibe_projects';
  
  /**
   * Create a new project
   */
  static async create(input: CreateVibeProjectInput): Promise<VibeProject> {
    const db = await getDatabase();
    const collection = db.collection<VibeProject>(this.COLLECTION);
    
    const project: Omit<VibeProject, '_id'> = {
      userId: input.userId,
      name: input.name,
      description: input.description,
      type: input.type,
      framework: input.framework,
      status: 'planning',
      scanIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessedAt: new Date(),
    };
    
    const result = await collection.insertOne(project as VibeProject);
    
    return {
      ...project,
      _id: result.insertedId,
    } as VibeProject;
  }
  
  /**
   * Find project by ID
   */
  static async findById(projectId: string, userId: string): Promise<VibeProject | null> {
    const db = await getDatabase();
    const collection = db.collection<VibeProject>(this.COLLECTION);
    
    if (!ObjectId.isValid(projectId)) {
      return null;
    }
    
    const project = await collection.findOne({
      _id: new ObjectId(projectId),
      userId,
    });
    
    // Update last accessed
    if (project) {
      await collection.updateOne(
        { _id: new ObjectId(projectId) },
        { $set: { lastAccessedAt: new Date() } }
      );
    }
    
    return project;
  }
  
  /**
   * Get all projects for a user
   */
  static async getUserProjects(userId: string, status?: ProjectStatus): Promise<VibeProject[]> {
    const db = await getDatabase();
    const collection = db.collection<VibeProject>(this.COLLECTION);
    
    const filter: any = { userId };
    if (status) {
      filter.status = status;
    }
    
    return collection
      .find(filter)
      .sort({ updatedAt: -1 })
      .toArray();
  }
  
  /**
   * Update project
   */
  static async update(
    projectId: string,
    userId: string,
    updates: UpdateVibeProjectInput
  ): Promise<VibeProject | null> {
    const db = await getDatabase();
    const collection = db.collection<VibeProject>(this.COLLECTION);
    
    if (!ObjectId.isValid(projectId)) {
      return null;
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(projectId), userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
    
    return result;
  }
  
  /**
   * Archive project (soft delete)
   */
  static async archive(projectId: string, userId: string): Promise<boolean> {
    const db = await getDatabase();
    const collection = db.collection<VibeProject>(this.COLLECTION);
    
    if (!ObjectId.isValid(projectId)) {
      return false;
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(projectId), userId },
      {
        $set: {
          status: 'archived',
          updatedAt: new Date(),
        },
      }
    );
    
    return result.modifiedCount > 0;
  }
  
  /**
   * Link scan to project
   */
  static async linkScan(projectId: string, userId: string, scanId: string): Promise<boolean> {
    const db = await getDatabase();
    const collection = db.collection<VibeProject>(this.COLLECTION);
    
    if (!ObjectId.isValid(projectId)) {
      return false;
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(projectId), userId },
      {
        $addToSet: { scanIds: scanId },
        $set: { updatedAt: new Date() },
      }
    );
    
    return result.modifiedCount > 0;
  }
  
  /**
   * Get project statistics
   */
  static async getStats(userId: string): Promise<{
    total: number;
    byType: Record<ProjectType, number>;
    byStatus: Record<ProjectStatus, number>;
  }> {
    const db = await getDatabase();
    const collection = db.collection<VibeProject>(this.COLLECTION);
    
    const projects = await collection.find({ userId }).toArray();
    
    const stats = {
      total: projects.length,
      byType: {
        web: 0,
        mobile: 0,
        game: 0,
        api: 0,
        other: 0,
      } as Record<ProjectType, number>,
      byStatus: {
        planning: 0,
        active: 0,
        archived: 0,
      } as Record<ProjectStatus, number>,
    };
    
    projects.forEach(project => {
      stats.byType[project.type]++;
      stats.byStatus[project.status]++;
    });
    
    return stats;
  }
  
  /**
   * Create indexes
   */
  static async createIndexes(): Promise<void> {
    const db = await getDatabase();
    const collection = db.collection<VibeProject>(this.COLLECTION);
    
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ userId: 1, status: 1 });
    await collection.createIndex({ userId: 1, type: 1 });
    await collection.createIndex({ updatedAt: -1 });
  }
}
