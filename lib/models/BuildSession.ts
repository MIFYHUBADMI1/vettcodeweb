/**
 * BuildSession Model
 * Tracks the entire AI build process for a project
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongodb';

export type BuildStatus = 
  | 'queued' 
  | 'planning' 
  | 'building' 
  | 'reviewing' 
  | 'testing' 
  | 'ready' 
  | 'failed' 
  | 'cancelled';

export type BuildPhase = 
  | 'requirements' 
  | 'architecture' 
  | 'ui-design' 
  | 'code-generation' 
  | 'review' 
  | 'testing' 
  | 'complete';

export interface BuildConfig {
  autoApprove: boolean;
  generateTests: boolean;
  runSecurityScan: boolean;
  targetFramework?: string;
  buildMode: 'fast' | 'standard' | 'thorough';
}

export interface BuildResults {
  filesGenerated: number;
  linesOfCode: number;
  agentsUsed: string[];
  tasksCompleted: number;
  tasksFailed: number;
  securityIssues?: number;
  testsCoverage?: number;
}

export interface PlanSection {
  id: string;
  name: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'needs_review';
  simpleExplanation: string;
  technicalDetails?: any;
  data: any;
  generatedAt?: Date;
  lastEditedAt?: Date;
  dependencies?: string[]; // Which sections this depends on
  aiUsage?: {
    provider: string;
    model: string;
    tokensUsed: number;
    cost: number;
  };
  error?: string;
}

export interface ConflictWarning {
  section: string;
  message: string;
  affectedSections: string[];
}

export interface SegmentedPlan {
  status: 'initializing' | 'generating' | 'paused' | 'completed' | 'approved' | 'failed';
  currentSection?: string;
  completedSections: string[];
  sectionsData: {
    projectUnderstanding?: PlanSection;
    projectGoals?: PlanSection;
    coreFeatures?: PlanSection;
    userExperience?: PlanSection;
    pages?: PlanSection;
    designDirection?: PlanSection;
    techStack?: PlanSection;
    dataStructure?: PlanSection;
    architecture?: PlanSection;
    security?: PlanSection;
    testing?: PlanSection;
    summary?: PlanSection;
  };
  checkpoints: {
    checkpoint1?: 'pending' | 'approved' | 'editing';
    checkpoint2?: 'pending' | 'approved' | 'editing';
    checkpoint3?: 'pending' | 'approved' | 'editing';
  };
  conflictWarnings?: ConflictWarning[];
}

export interface BuildArtifacts {
  plan?: any; // Legacy single-shot plan
  planApproved?: boolean;
  planApprovedAt?: Date;
  
  // NEW: Segmented planning
  segmentedPlan?: SegmentedPlan;
  
  requirements?: any;
  architecture?: any;
  uiDesign?: any;
}

export interface BuildError {
  message: string;
  phase: string;
  task: string;
  timestamp: Date;
  recoverable: boolean;
}

export interface BuildAIUsage {
  totalRequests: number;
  totalTokens: number;
  estimatedCost: number;
  byAgent: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

export interface BuildSession {
  _id: ObjectId;
  projectId: ObjectId;
  userId: string;
  
  // Status tracking
  status: BuildStatus;
  phase: BuildPhase;
  progress: number; // 0-100
  
  // Build metadata
  startedAt: Date;
  completedAt?: Date;
  estimatedDuration?: number; // seconds
  actualDuration?: number; // seconds
  
  // Build configuration
  buildConfig: BuildConfig;
  
  // Results tracking
  results: BuildResults;
  
  // Build artifacts
  artifacts: BuildArtifacts;
  
  // Error tracking
  error?: BuildError;
  
  // AI usage tracking
  aiUsage: BuildAIUsage;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBuildSessionInput {
  projectId: ObjectId;
  userId: string;
  buildConfig: BuildConfig;
}

/**
 * BuildSession Model
 */
export class BuildSessionModel {
  private static readonly COLLECTION = 'build_sessions';

  /**
   * Create a new build session
   */
  static async create(input: CreateBuildSessionInput): Promise<BuildSession> {
    const db = await getDb();
    const now = new Date();

    const session: Omit<BuildSession, '_id'> = {
      projectId: input.projectId,
      userId: input.userId,
      status: 'queued',
      phase: 'requirements',
      progress: 0,
      startedAt: now,
      buildConfig: input.buildConfig,
      results: {
        filesGenerated: 0,
        linesOfCode: 0,
        agentsUsed: [],
        tasksCompleted: 0,
        tasksFailed: 0,
      },
      artifacts: {},
      aiUsage: {
        totalRequests: 0,
        totalTokens: 0,
        estimatedCost: 0,
        byAgent: {},
      },
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(this.COLLECTION).insertOne(session);

    return {
      _id: result.insertedId,
      ...session,
    };
  }

  /**
   * Find session by ID
   */
  static async findById(
    sessionId: ObjectId,
    userId: string
  ): Promise<BuildSession | null> {
    const db = await getDb();
    
    return db.collection(this.COLLECTION).findOne({
      _id: sessionId,
      userId,
    }) as Promise<BuildSession | null>;
  }

  /**
   * Update session
   */
  static async update(
    sessionId: ObjectId,
    userId: string,
    updates: Partial<BuildSession> | Record<string, any>
  ): Promise<BuildSession | null> {
    const db = await getDb();

    const result = await db.collection(this.COLLECTION).findOneAndUpdate(
      { _id: sessionId, userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result as BuildSession | null;
  }

  /**
   * Update status
   */
  static async updateStatus(
    sessionId: ObjectId,
    status: BuildStatus
  ): Promise<void> {
    const db = await getDb();

    await db.collection(this.COLLECTION).updateOne(
      { _id: sessionId },
      {
        $set: {
          status,
          updatedAt: new Date(),
          ...(status === 'ready' || status === 'failed' || status === 'cancelled'
            ? { completedAt: new Date() }
            : {}),
        },
      }
    );
  }

  /**
   * Update phase
   */
  static async updatePhase(
    sessionId: ObjectId,
    phase: BuildPhase,
    progress: number
  ): Promise<void> {
    const db = await getDb();

    await db.collection(this.COLLECTION).updateOne(
      { _id: sessionId },
      {
        $set: {
          phase,
          progress,
          updatedAt: new Date(),
        },
      }
    );
  }

  /**
   * Track AI usage
   */
  static async trackAIUsage(
    sessionId: ObjectId,
    agent: string,
    usage: {
      provider: string;
      model: string;
      inputTokens: number;
      outputTokens: number;
      cost: number;
    }
  ): Promise<void> {
    const db = await getDb();

    const totalTokens = usage.inputTokens + usage.outputTokens;

    await db.collection(this.COLLECTION).updateOne(
      { _id: sessionId },
      {
        $inc: {
          'aiUsage.totalRequests': 1,
          'aiUsage.totalTokens': totalTokens,
          'aiUsage.estimatedCost': usage.cost,
        },
        $set: {
          [`aiUsage.byAgent.${agent}`]: {
            requests: 1,
            tokens: totalTokens,
            cost: usage.cost,
          },
          updatedAt: new Date(),
        },
      }
    );
  }

  /**
   * Increment results
   */
  static async incrementResults(
    sessionId: ObjectId,
    field: keyof BuildResults,
    value: number = 1
  ): Promise<void> {
    const db = await getDb();

    await db.collection(this.COLLECTION).updateOne(
      { _id: sessionId },
      {
        $inc: { [`results.${field}`]: value },
        $set: { updatedAt: new Date() },
      }
    );
  }

  /**
   * Set error
   */
  static async setError(
    sessionId: ObjectId,
    error: BuildError
  ): Promise<void> {
    const db = await getDb();

    await db.collection(this.COLLECTION).updateOne(
      { _id: sessionId },
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
   * Get sessions by project
   */
  static async getByProject(
    projectId: ObjectId,
    userId: string
  ): Promise<BuildSession[]> {
    const db = await getDb();

    return db
      .collection(this.COLLECTION)
      .find({ projectId, userId })
      .sort({ createdAt: -1 })
      .toArray() as Promise<BuildSession[]>;
  }

  /**
   * Get active session for project
   */
  static async getActiveSession(
    projectId: ObjectId,
    userId: string
  ): Promise<BuildSession | null> {
    const db = await getDb();

    return db.collection(this.COLLECTION).findOne({
      projectId,
      userId,
      status: { $in: ['queued', 'planning', 'building', 'reviewing', 'testing'] },
    }) as Promise<BuildSession | null>;
  }

  /**
   * Create indexes
   */
  static async createIndexes(): Promise<void> {
    const db = await getDb();
    const collection = db.collection(this.COLLECTION);

    await collection.createIndex({ projectId: 1, userId: 1 });
    await collection.createIndex({ userId: 1, createdAt: -1 });
    await collection.createIndex({ status: 1 });
  }

  /**
   * Update with custom MongoDB operators (for complex updates like $addToSet, $push, etc.)
   */
  static async updateWithOperators(
    sessionId: ObjectId,
    userId: string,
    operators: Record<string, any>
  ): Promise<BuildSession | null> {
    const db = await getDb();

    // Ensure updatedAt is always set
    const updateDoc = {
      ...operators,
      $set: {
        ...(operators.$set || {}),
        updatedAt: new Date(),
      },
    };

    const result = await db.collection(this.COLLECTION).findOneAndUpdate(
      { _id: sessionId, userId },
      updateDoc,
      { returnDocument: 'after' }
    );

    return result as BuildSession | null;
  }
}
