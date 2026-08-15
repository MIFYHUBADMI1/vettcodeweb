/**
 * BuildTask Model
 * Individual tasks executed by agents during the build
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongodb';

export type AgentType = 
  | 'planner' 
  | 'requirements' 
  | 'architecture' 
  | 'ui-ux' 
  | 'code' 
  | 'review' 
  | 'test';

export type TaskStatus = 
  | 'pending' 
  | 'running' 
  | 'waiting_approval' 
  | 'completed' 
  | 'failed' 
  | 'skipped';

export interface TaskInput {
  context: Record<string, any>;
  parameters: Record<string, any>;
}

export interface TaskOutput {
  success: boolean;
  data: Record<string, any>;
  filesCreated?: string[];
  filesModified?: string[];
  warnings?: string[];
}

export interface ApprovalRequest {
  reason: string;
  riskLevel: 'low' | 'medium' | 'high';
  details: Record<string, any>;
  requestedAt: Date;
}

export interface ApprovalResponse {
  approved: boolean;
  respondedAt: Date;
  notes?: string;
}

export interface TaskAIUsage {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export interface TaskError {
  message: string;
  stack?: string;
  retryable: boolean;
}

export interface BuildTask {
  _id: ObjectId;
  sessionId: ObjectId;
  projectId: ObjectId;
  userId: string;
  
  // Task identification
  taskId: string;
  agentType: AgentType;
  taskType: string;
  
  // Task details
  title: string;
  description: string;
  priority: number;
  
  // Status tracking
  status: TaskStatus;
  progress: number;
  
  // Dependencies
  dependsOn: string[];
  blockedBy: string[];
  
  // Execution
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  retries: number;
  maxRetries: number;
  
  // Input/Output
  input: TaskInput;
  output?: TaskOutput;
  
  // Approval workflow
  requiresApproval: boolean;
  approvalRequest?: ApprovalRequest;
  approvalResponse?: ApprovalResponse;
  
  // AI usage
  aiUsage?: TaskAIUsage;
  
  // Error tracking
  error?: TaskError;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBuildTaskInput {
  sessionId: ObjectId;
  projectId: ObjectId;
  userId: string;
  taskId: string;
  agentType: AgentType;
  taskType: string;
  title: string;
  description: string;
  priority?: number;
  dependsOn?: string[];
  input: TaskInput;
  requiresApproval?: boolean;
  maxRetries?: number;
}

/**
 * BuildTask Model
 */
export class BuildTaskModel {
  private static readonly COLLECTION = 'build_tasks';

  /**
   * Create a new task
   */
  static async create(input: CreateBuildTaskInput): Promise<BuildTask> {
    const db = await getDb();
    const now = new Date();

    const task: Omit<BuildTask, '_id'> = {
      sessionId: input.sessionId,
      projectId: input.projectId,
      userId: input.userId,
      taskId: input.taskId,
      agentType: input.agentType,
      taskType: input.taskType,
      title: input.title,
      description: input.description,
      priority: input.priority || 5,
      status: 'pending',
      progress: 0,
      dependsOn: input.dependsOn || [],
      blockedBy: [],
      retries: 0,
      maxRetries: input.maxRetries || 3,
      input: input.input,
      requiresApproval: input.requiresApproval || false,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(this.COLLECTION).insertOne(task);

    return {
      _id: result.insertedId,
      ...task,
    };
  }

  /**
   * Find task by ID
   */
  static async findById(
    taskId: ObjectId,
    userId: string
  ): Promise<BuildTask | null> {
    const db = await getDb();
    
    return db.collection(this.COLLECTION).findOne({
      _id: taskId,
      userId,
    }) as Promise<BuildTask | null>;
  }

  /**
   * Find task by taskId string
   */
  static async findByTaskId(
    sessionId: ObjectId,
    taskId: string
  ): Promise<BuildTask | null> {
    const db = await getDb();
    
    return db.collection(this.COLLECTION).findOne({
      sessionId,
      taskId,
    }) as Promise<BuildTask | null>;
  }

  /**
   * Get tasks by session
   */
  static async getBySession(sessionId: ObjectId): Promise<BuildTask[]> {
    const db = await getDb();

    return db
      .collection(this.COLLECTION)
      .find({ sessionId })
      .sort({ priority: -1, createdAt: 1 })
      .toArray() as Promise<BuildTask[]>;
  }

  /**
   * Get pending tasks
   */
  static async getPendingTasks(sessionId: ObjectId): Promise<BuildTask[]> {
    const db = await getDb();

    return db
      .collection(this.COLLECTION)
      .find({ 
        sessionId, 
        status: 'pending',
      })
      .sort({ priority: -1 })
      .toArray() as Promise<BuildTask[]>;
  }

  /**
   * Update task status
   */
  static async updateStatus(
    taskId: ObjectId,
    status: TaskStatus,
    updates?: Partial<BuildTask>
  ): Promise<BuildTask | null> {
    const db = await getDb();

    const result = await db.collection(this.COLLECTION).findOneAndUpdate(
      { _id: taskId },
      {
        $set: {
          status,
          ...updates,
          ...(status === 'running' ? { startedAt: new Date() } : {}),
          ...(status === 'completed' || status === 'failed' ? { completedAt: new Date() } : {}),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result as BuildTask | null;
  }

  /**
   * Set task output
   */
  static async setOutput(
    taskId: ObjectId,
    output: TaskOutput
  ): Promise<void> {
    const db = await getDb();

    await db.collection(this.COLLECTION).updateOne(
      { _id: taskId },
      {
        $set: {
          output,
          status: output.success ? 'completed' : 'failed',
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  }

  /**
   * Set task error
   */
  static async setError(
    taskId: ObjectId,
    error: TaskError
  ): Promise<void> {
    const db = await getDb();

    await db.collection(this.COLLECTION).updateOne(
      { _id: taskId },
      {
        $set: {
          error,
          status: 'failed',
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  }

  /**
   * Request approval
   */
  static async requestApproval(
    taskId: ObjectId,
    request: Omit<ApprovalRequest, 'requestedAt'>
  ): Promise<void> {
    const db = await getDb();

    await db.collection(this.COLLECTION).updateOne(
      { _id: taskId },
      {
        $set: {
          status: 'waiting_approval',
          approvalRequest: {
            ...request,
            requestedAt: new Date(),
          },
          updatedAt: new Date(),
        },
      }
    );
  }

  /**
   * Respond to approval
   */
  static async respondApproval(
    taskId: ObjectId,
    approved: boolean,
    notes?: string
  ): Promise<BuildTask | null> {
    const db = await getDb();

    const result = await db.collection(this.COLLECTION).findOneAndUpdate(
      { _id: taskId },
      {
        $set: {
          approvalResponse: {
            approved,
            respondedAt: new Date(),
            notes,
          },
          status: approved ? 'pending' : 'skipped',
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result as BuildTask | null;
  }

  /**
   * Increment retries
   */
  static async incrementRetries(taskId: ObjectId): Promise<number> {
    const db = await getDb();

    const result = await db.collection(this.COLLECTION).findOneAndUpdate(
      { _id: taskId },
      {
        $inc: { retries: 1 },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );

    return (result as BuildTask)?.retries || 0;
  }

  /**
   * Track AI usage
   */
  static async trackAIUsage(
    taskId: ObjectId,
    usage: TaskAIUsage
  ): Promise<void> {
    const db = await getDb();

    await db.collection(this.COLLECTION).updateOne(
      { _id: taskId },
      {
        $set: {
          aiUsage: usage,
          updatedAt: new Date(),
        },
      }
    );
  }

  /**
   * Create indexes
   */
  static async createIndexes(): Promise<void> {
    const db = await getDb();
    const collection = db.collection(this.COLLECTION);

    await collection.createIndex({ sessionId: 1, status: 1 });
    await collection.createIndex({ sessionId: 1, agentType: 1 });
    await collection.createIndex({ status: 1, priority: -1 });
    await collection.createIndex({ projectId: 1, userId: 1 });
  }
}
