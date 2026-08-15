/**
 * Agent System Types
 * Common interfaces for all build agents
 */

import { BuildSession } from '../models/BuildSession';
import { VibeProject } from '../models/VibeProject';
import { SubscriptionPlan } from '../subscription';
import { AgentType } from '../models/BuildTask';

/**
 * Build Context
 * Shared context passed to all agents
 */
export interface BuildContext {
  session: BuildSession;
  project: VibeProject;
  user: {
    email: string;
    plan: SubscriptionPlan;
  };
  
  // Accumulated knowledge (filled as build progresses)
  plan?: any;
  requirements?: any;
  architecture?: any;
  uiDesign?: any;
  
  // Generated files (cumulative)
  generatedFiles: Map<string, { content: string; version: number }>;
  
  // Current phase info
  currentPhase: string;
  
  // Budget tracking
  budget: {
    maxTokens: number;
    usedTokens: number;
    maxCost: number;
    usedCost: number;
  };
}

/**
 * Agent Output
 * Standard output format for all agents
 */
export interface AgentOutput {
  success: boolean;
  data: any; // Agent-specific structured output
  filesGenerated?: FileOutput[];
  nextTasks?: TaskDefinition[];
  warnings?: string[];
  aiUsage: {
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
}

/**
 * File Output
 * File to be created by agent
 */
export interface FileOutput {
  path: string;
  content: string;
  reason: string;
  requiresApproval: boolean;
}

/**
 * Task Definition
 * Next task recommended by agent
 */
export interface TaskDefinition {
  taskId: string;
  agentType: AgentType;
  taskType: string;
  title: string;
  description: string;
  priority?: number;
  dependsOn?: string[];
  input: Record<string, any>;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Cost Estimate
 */
export interface CostEstimate {
  estimatedTokens: number;
  estimatedCost: number;
  estimatedDuration: number; // seconds
}

/**
 * Build Agent Interface
 * All agents implement this interface
 */
export interface IBuildAgent {
  // Agent identity
  readonly type: AgentType;
  readonly name: string;
  readonly description: string;
  
  // Execution
  execute(context: BuildContext): Promise<AgentOutput>;
  
  // Validation
  validateInput(context: BuildContext): ValidationResult;
  validateOutput(output: AgentOutput): ValidationResult;
  
  // Cost estimation
  estimateCost(context: BuildContext): Promise<CostEstimate>;
}
