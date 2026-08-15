/**
 * BuildActivity Model
 * User-facing activity log (timeline of what AI team is doing)
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongodb';

export type ActivityType =
  | 'agent_started'
  | 'agent_completed'
  | 'file_created'
  | 'file_modified'
  | 'approval_requested'
  | 'approval_granted'
  | 'approval_denied'
  | 'task_completed'
  | 'phase_changed'
  | 'error'
  | 'info';

export type ActivitySeverity = 'info' | 'success' | 'warning' | 'error';

export interface BuildActivity {
  _id: ObjectId;
  sessionId: ObjectId;
  projectId: ObjectId;
  userId: string;
  
  // Activity metadata
  type: ActivityType;
  severity: ActivitySeverity;
  
  // Content
  title: string;
  message: string;
  agentType?: string;
  taskId?: string;
  
  // Metadata
  metadata?: {
    filesAffected?: string[];
    linesChanged?: number;
    duration?: number;
    [key: string]: any;
  };
  
  // Timeline position
  timestamp: Date;
  sequenceNumber: number;
  
  // UI presentation
  icon?: string;
  color?: string;
  
  createdAt: Date;
}

export interface CreateActivityInput {
  sessionId: ObjectId;
  projectId: ObjectId;
  userId: string;
  type: ActivityType;
  severity: ActivitySeverity;
  title: string;
  message: string;
  agentType?: string;
  taskId?: string;
  metadata?: Record<string, any>;
  icon?: string;
  color?: string;
}

/**
 * BuildActivity Model
 */
export class BuildActivityModel {
  private static readonly COLLECTION = 'build_activities';

  /**
   * Create a new activity
   */
  static async create(input: CreateActivityInput): Promise<BuildActivity> {
    const db = await getDb();
    const now = new Date();

    // Get next sequence number for this session
    const lastActivity = await db
      .collection(this.COLLECTION)
      .findOne(
        { sessionId: input.sessionId },
        { sort: { sequenceNumber: -1 } }
      );

    const sequenceNumber = (lastActivity as any)?.sequenceNumber + 1 || 1;

    const activity: Omit<BuildActivity, '_id'> = {
      sessionId: input.sessionId,
      projectId: input.projectId,
      userId: input.userId,
      type: input.type,
      severity: input.severity,
      title: input.title,
      message: input.message,
      agentType: input.agentType,
      taskId: input.taskId,
      metadata: input.metadata,
      timestamp: now,
      sequenceNumber,
      icon: input.icon,
      color: input.color,
      createdAt: now,
    };

    const result = await db.collection(this.COLLECTION).insertOne(activity);

    return {
      _id: result.insertedId,
      ...activity,
    };
  }

  /**
   * Get activities by session
   */
  static async getBySession(
    sessionId: ObjectId,
    options?: {
      since?: Date;
      limit?: number;
    }
  ): Promise<BuildActivity[]> {
    const db = await getDb();

    const query: any = { sessionId };
    if (options?.since) {
      query.timestamp = { $gt: options.since };
    }

    return db
      .collection(this.COLLECTION)
      .find(query)
      .sort({ sequenceNumber: 1 })
      .limit(options?.limit || 50)
      .toArray() as Promise<BuildActivity[]>;
  }

  /**
   * Get recent activities
   */
  static async getRecent(
    sessionId: ObjectId,
    limit: number = 10
  ): Promise<BuildActivity[]> {
    const db = await getDb();

    return db
      .collection(this.COLLECTION)
      .find({ sessionId })
      .sort({ sequenceNumber: -1 })
      .limit(limit)
      .toArray() as Promise<BuildActivity[]>;
  }

  /**
   * Helper: Log agent started
   */
  static async logAgentStarted(
    sessionId: ObjectId,
    projectId: ObjectId,
    userId: string,
    agentType: string,
    taskTitle: string
  ): Promise<void> {
    await this.create({
      sessionId,
      projectId,
      userId,
      type: 'agent_started',
      severity: 'info',
      title: `${this.formatAgentName(agentType)} started`,
      message: taskTitle,
      agentType,
      icon: '🤖',
      color: 'blue',
    });
  }

  /**
   * Helper: Log agent completed
   */
  static async logAgentCompleted(
    sessionId: ObjectId,
    projectId: ObjectId,
    userId: string,
    agentType: string,
    taskTitle: string,
    duration?: number
  ): Promise<void> {
    await this.create({
      sessionId,
      projectId,
      userId,
      type: 'agent_completed',
      severity: 'success',
      title: `${this.formatAgentName(agentType)} completed`,
      message: taskTitle,
      agentType,
      metadata: { duration },
      icon: '✓',
      color: 'green',
    });
  }

  /**
   * Helper: Log file created
   */
  static async logFileCreated(
    sessionId: ObjectId,
    projectId: ObjectId,
    userId: string,
    filePath: string,
    agentType?: string
  ): Promise<void> {
    await this.create({
      sessionId,
      projectId,
      userId,
      type: 'file_created',
      severity: 'success',
      title: 'File created',
      message: filePath,
      agentType,
      metadata: { filesAffected: [filePath] },
      icon: '📄',
      color: 'green',
    });
  }

  /**
   * Helper: Log phase changed
   */
  static async logPhaseChanged(
    sessionId: ObjectId,
    projectId: ObjectId,
    userId: string,
    newPhase: string
  ): Promise<void> {
    await this.create({
      sessionId,
      projectId,
      userId,
      type: 'phase_changed',
      severity: 'info',
      title: 'Build phase changed',
      message: `Now in ${newPhase} phase`,
      icon: '🔄',
      color: 'blue',
    });
  }

  /**
   * Helper: Log error
   */
  static async logError(
    sessionId: ObjectId,
    projectId: ObjectId,
    userId: string,
    error: string,
    agentType?: string
  ): Promise<void> {
    await this.create({
      sessionId,
      projectId,
      userId,
      type: 'error',
      severity: 'error',
      title: 'Build error occurred',
      message: error,
      agentType,
      icon: '⚠️',
      color: 'red',
    });
  }

  /**
   * Format agent name for display
   */
  private static formatAgentName(agentType: string): string {
    const names: Record<string, string> = {
      planner: 'Planner Agent',
      requirements: 'Requirements Agent',
      architecture: 'Architecture Agent',
      'ui-ux': 'UI/UX Agent',
      code: 'Code Agent',
      review: 'Review Agent',
      test: 'Test Agent',
    };
    return names[agentType] || agentType;
  }

  /**
   * Create indexes
   */
  static async createIndexes(): Promise<void> {
    const db = await getDb();
    const collection = db.collection(this.COLLECTION);

    await collection.createIndex({ sessionId: 1, sequenceNumber: 1 });
    await collection.createIndex({ projectId: 1, timestamp: -1 });
    await collection.createIndex({ userId: 1, timestamp: -1 });
  }
}
