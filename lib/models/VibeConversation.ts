/**
 * VettCode Vibe Conversation Model
 * Represents AI chat conversations within a project
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongodb';

export type MessageRole = 'user' | 'assistant';
export type ActionType = 'create_file' | 'update_file' | 'delete_file' | 'install_dependency' | 'run_command';
export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';

export interface AIAction {
  id: string;
  type: ActionType;
  target: string; // File path or command
  payload: any;
  status: ActionStatus;
  result?: any;
  error?: string;
  createdAt: Date;
  executedAt?: Date;
}

export interface VibeMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  
  // AI actions (if assistant message)
  actions?: AIAction[];
  
  // Token usage
  tokens?: {
    input: number;
    output: number;
    cost: number;
  };
  
  // Model used
  model?: string;
  provider?: string;
}

export interface ProjectContext {
  framework?: string;
  dependencies: string[];
  currentFiles: string[];
  recentChanges: string[];
}

export interface VibeConversation {
  _id: ObjectId;
  projectId: string;
  userId: string;
  
  messages: VibeMessage[];
  
  // Project context for AI
  projectContext: ProjectContext;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface AddMessageInput {
  projectId: string;
  userId: string;
  role: MessageRole;
  content: string;
  actions?: AIAction[];
  tokens?: {
    input: number;
    output: number;
    cost: number;
  };
  model?: string;
  provider?: string;
}

/**
 * VibeConversation database operations
 */
export class VibeConversationModel {
  private static COLLECTION = 'vibe_conversations';
  private static MAX_MESSAGES = 100; // Keep last 100 messages
  
  /**
   * Get or create conversation for a project
   */
  static async getOrCreate(
    projectId: string,
    userId: string
  ): Promise<VibeConversation> {
    const db = await getDb();
    const collection = db.collection<VibeConversation>(this.COLLECTION);
    
    let conversation = await collection.findOne({ projectId, userId });
    
    if (!conversation) {
      const newConversation: Omit<VibeConversation, '_id'> = {
        projectId,
        userId,
        messages: [],
        projectContext: {
          dependencies: [],
          currentFiles: [],
          recentChanges: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = await collection.insertOne(newConversation as VibeConversation);
      conversation = {
        ...newConversation,
        _id: result.insertedId,
      } as VibeConversation;
    }
    
    return conversation;
  }
  
  /**
   * Add message to conversation
   */
  static async addMessage(input: AddMessageInput): Promise<VibeMessage> {
    const db = await getDb();
    const collection = db.collection<VibeConversation>(this.COLLECTION);
    
    const message: VibeMessage = {
      id: new ObjectId().toString(),
      role: input.role,
      content: input.content,
      timestamp: new Date(),
      ...(input.actions && { actions: input.actions }),
      ...(input.tokens && { tokens: input.tokens }),
      ...(input.model && { model: input.model }),
      ...(input.provider && { provider: input.provider }),
    };
    
    // Add message and trim if exceeds limit
    await collection.updateOne(
      { projectId: input.projectId, userId: input.userId },
      {
        $push: {
          messages: {
            $each: [message],
            $slice: -this.MAX_MESSAGES, // Keep last N messages
          },
        } as any,
        $set: { updatedAt: new Date() },
      },
      { upsert: true }
    );
    
    return message;
  }
  
  /**
   * Update action status
   */
  static async updateActionStatus(
    projectId: string,
    userId: string,
    messageId: string,
    actionId: string,
    status: ActionStatus,
    result?: any,
    error?: string
  ): Promise<boolean> {
    const db = await getDb();
    const collection = db.collection<VibeConversation>(this.COLLECTION);
    
    const conversation = await collection.findOne({ projectId, userId });
    if (!conversation) return false;
    
    // Find and update the action
    let updated = false;
    conversation.messages.forEach(msg => {
      if (msg.id === messageId && msg.actions) {
        msg.actions.forEach(action => {
          if (action.id === actionId) {
            action.status = status;
            if (result !== undefined) action.result = result;
            if (error) action.error = error;
            if (status === 'executed' || status === 'failed') {
              action.executedAt = new Date();
            }
            updated = true;
          }
        });
      }
    });
    
    if (updated) {
      await collection.updateOne(
        { projectId, userId },
        {
          $set: {
            messages: conversation.messages,
            updatedAt: new Date(),
          },
        }
      );
    }
    
    return updated;
  }
  
  /**
   * Update project context
   */
  static async updateContext(
    projectId: string,
    userId: string,
    context: Partial<ProjectContext>
  ): Promise<boolean> {
    const db = await getDb();
    const collection = db.collection<VibeConversation>(this.COLLECTION);
    
    const result = await collection.updateOne(
      { projectId, userId },
      {
        $set: {
          'projectContext.framework': context.framework,
          'projectContext.dependencies': context.dependencies,
          'projectContext.currentFiles': context.currentFiles,
          'projectContext.recentChanges': context.recentChanges,
          updatedAt: new Date(),
        },
      }
    );
    
    return result.modifiedCount > 0;
  }
  
  /**
   * Get conversation messages
   */
  static async getMessages(
    projectId: string,
    userId: string,
    limit?: number
  ): Promise<VibeMessage[]> {
    const conversation = await this.getOrCreate(projectId, userId);
    
    if (limit && limit < conversation.messages.length) {
      return conversation.messages.slice(-limit);
    }
    
    return conversation.messages;
  }
  
  /**
   * Clear conversation
   */
  static async clear(projectId: string, userId: string): Promise<boolean> {
    const db = await getDb();
    const collection = db.collection<VibeConversation>(this.COLLECTION);
    
    const result = await collection.updateOne(
      { projectId, userId },
      {
        $set: {
          messages: [],
          updatedAt: new Date(),
        },
      }
    );
    
    return result.modifiedCount > 0;
  }
  
  /**
   * Delete conversation
   */
  static async delete(projectId: string, userId: string): Promise<boolean> {
    const db = await getDb();
    const collection = db.collection<VibeConversation>(this.COLLECTION);
    
    const result = await collection.deleteOne({ projectId, userId });
    return result.deletedCount > 0;
  }
  
  /**
   * Get conversation statistics
   */
  static async getStats(
    projectId: string,
    userId: string
  ): Promise<{
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    totalTokens: number;
    totalCost: number;
    pendingActions: number;
  }> {
    const conversation = await this.getOrCreate(projectId, userId);
    
    const stats = {
      totalMessages: conversation.messages.length,
      userMessages: 0,
      assistantMessages: 0,
      totalTokens: 0,
      totalCost: 0,
      pendingActions: 0,
    };
    
    conversation.messages.forEach(msg => {
      if (msg.role === 'user') {
        stats.userMessages++;
      } else {
        stats.assistantMessages++;
      }
      
      if (msg.tokens) {
        stats.totalTokens += msg.tokens.input + msg.tokens.output;
        stats.totalCost += msg.tokens.cost;
      }
      
      if (msg.actions) {
        msg.actions.forEach(action => {
          if (action.status === 'pending') {
            stats.pendingActions++;
          }
        });
      }
    });
    
    return stats;
  }
  
  /**
   * Create indexes
   */
  static async createIndexes(): Promise<void> {
    const db = await getDb();
    const collection = db.collection<VibeConversation>(this.COLLECTION);
    
    await collection.createIndex({ projectId: 1, userId: 1 }, { unique: true });
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ updatedAt: -1 });
  }
}

