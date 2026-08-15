/**
 * Planner Agent
 * Creates high-level project plan from user's description
 */

import { BaseAgent } from './base-agent';
import { BuildContext, AgentOutput, ValidationResult } from './types';
import { AgentType } from '../models/BuildTask';

export interface PlannerInput {
  projectDescription: string;
  projectType: string;
  framework?: string;
  userPreferences?: {
    complexity?: 'simple' | 'medium' | 'complex';
    features?: string[];
  };
}

export interface PlannerOutput {
  plan: {
    overview: string;
    features: Array<{
      name: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      estimatedDuration: number; // hours
    }>;
    pages: Array<{
      name: string;
      route: string;
      description: string;
      components?: string[];
    }>;
    techStack: {
      frontend: string[];
      backend?: string[];
      database?: string;
      styling: string;
    };
    timeline: {
      estimatedDays: number;
      phases: string[];
    };
    securityConsiderations?: string[];
  };
}

export class PlannerAgent extends BaseAgent {
  readonly type: AgentType = 'planner';
  readonly name = 'Planner Agent';
  readonly description = 'Creates high-level project plan from description';

  /**
   * Execute planner agent
   */
  async execute(context: BuildContext): Promise<AgentOutput> {
    // Validate input
    const validation = this.validateInput(context);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join(', ')}`);
    }

    // Extract input
    const input: PlannerInput = {
      projectDescription: context.project.description,
      projectType: context.project.type,
      framework: context.project.framework,
    };

    // Try to get plan from AI (with retry logic)
    let plan: PlannerOutput;
    let response: any;
    
    try {
      // First attempt with normal prompt
      const prompt = this.buildPlannerPrompt(input);
      response = await this.callAI(
        context.user.email,
        'build_planning',
        prompt,
        {
          temperature: 0.7,
          maxTokens: 4000, // Increased from 3000 to allow more response
        }
      );

      plan = this.parseJSONResponse<PlannerOutput>(response.content);
    } catch (firstError) {
      console.warn(`[${this.type}] First attempt failed, trying with more directive prompt...`);
      console.warn(`[${this.type}] Error:`, firstError instanceof Error ? firstError.message : 'Unknown');
      
      try {
        // Second attempt with ultra-directive prompt
        const ultraDirectivePrompt = this.buildUltraDirectivePlannerPrompt(input);
        response = await this.callAI(
          context.user.email,
          'build_planning',
          ultraDirectivePrompt,
          {
            temperature: 0.5, // Lower temperature for more focused output
            maxTokens: 2000, // Reduce to avoid truncation
          }
        );

        plan = this.parseJSONResponse<PlannerOutput>(response.content);
        console.log(`[${this.type}] ✅ Second attempt succeeded!`);
      } catch (secondError) {
        console.error(`[${this.type}] Both attempts failed!`);
        console.error(`[${this.type}] First error:`, firstError instanceof Error ? firstError.message : 'Unknown');
        console.error(`[${this.type}] Second error:`, secondError instanceof Error ? secondError.message : 'Unknown');
        throw new Error(
          `Failed to generate plan after 2 attempts. ` +
          `The AI model may be returning truncated or malformed responses. ` +
          `Please try again or contact support.`
        );
      }
    }

    // Validate output and add defaults for missing fields
    if (!plan || !plan.plan) {
      console.error(`[${this.type}] Invalid plan structure:`, JSON.stringify(plan, null, 2));
      throw new Error('Invalid planner output: missing plan property');
    }

    // Add defaults for missing required fields
    const planData = plan.plan;
    
    if (!planData.overview) {
      planData.overview = `A ${input.projectType} application`;
    }
    
    if (!planData.features || planData.features.length === 0) {
      planData.features = [{
        name: 'Core Functionality',
        description: 'Main features of the application',
        priority: 'high' as const,
        estimatedDuration: 5,
      }];
    }
    
    if (!planData.pages || planData.pages.length === 0) {
      planData.pages = [{
        name: 'Home',
        route: '/',
        description: 'Main landing page',
      }];
    }
    
    if (!planData.techStack) {
      planData.techStack = {
        frontend: [input.framework || 'React'],
        styling: 'Tailwind CSS',
      };
    }
    
    if (!planData.timeline) {
      planData.timeline = {
        estimatedDays: 5,
        phases: ['Planning', 'Development', 'Testing'],
      };
    }
    
    if (!planData.securityConsiderations) {
      planData.securityConsiderations = ['Input validation', 'Authentication'];
    }

    return {
      success: true,
      data: plan,
      warnings: this.generateWarnings(plan),
      aiUsage: {
        provider: response.provider,
        model: response.model,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        cost: response.usage.cost,
      },
    };
  }

  /**
   * Validate input
   */
  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) {
      return baseValidation;
    }

    const errors: string[] = [];

    if (!context.project.description) {
      errors.push('Project description is required');
    }

    if (!context.project.type) {
      errors.push('Project type is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Build planner prompt (ultra concise to avoid truncation)
   */
  private buildPlannerPrompt(input: PlannerInput): string {
    const systemPrompt = `You are a software architect. Respond with ONLY valid JSON. No text before or after.`;

    const userPrompt = `Create plan for: ${input.projectDescription}

Type: ${input.projectType}
Framework: ${input.framework || 'Not specified'}

Respond with ONLY this JSON (keep it SHORT):
{
  "plan": {
    "overview": "1-2 sentences max",
    "features": [
      {"name": "Short name", "description": "1 sentence", "priority": "high", "estimatedDuration": 2}
    ],
    "pages": [
      {"name": "Page name", "route": "/path", "description": "1 sentence"}
    ],
    "techStack": {
      "frontend": ["${input.framework || 'React'}"],
      "styling": "Tailwind CSS"
    },
    "timeline": {
      "estimatedDays": 3,
      "phases": ["Planning", "Development", "Testing"]
    },
    "securityConsiderations": ["Consider 1", "Consider 2"]
  }
}

CRITICAL:
- Maximum 3 features
- Maximum 3 pages
- Descriptions under 10 words
- JSON ONLY, no other text`;

    return `${systemPrompt}\n\n${userPrompt}`;
  }

  /**
   * Build ultra-directive prompt (used on retry)
   */
  private buildUltraDirectivePlannerPrompt(input: PlannerInput): string {
    return `OUTPUT ONLY THIS JSON STRUCTURE WITH NO OTHER TEXT:

{
  "plan": {
    "overview": "A ${input.projectType} application using ${input.framework || 'modern stack'}",
    "features": [
      {"name": "Core Feature 1", "description": "Main functionality", "priority": "high", "estimatedDuration": 2},
      {"name": "Core Feature 2", "description": "Secondary functionality", "priority": "medium", "estimatedDuration": 1}
    ],
    "pages": [
      {"name": "Home", "route": "/", "description": "Landing page"},
      {"name": "Dashboard", "route": "/dashboard", "description": "Main app interface"}
    ],
    "techStack": {
      "frontend": ["${input.framework || 'React'}", "TypeScript"],
      "styling": "Tailwind CSS"
    },
    "timeline": {
      "estimatedDays": 3,
      "phases": ["Setup", "Development", "Testing"]
    },
    "securityConsiderations": ["Input validation", "Authentication"]
  }
}

ADAPT THE ABOVE TO: ${input.projectDescription}`;
  }

  /**
   * Generate warnings based on plan (with safe property access)
   */
  private generateWarnings(plan: PlannerOutput): string[] {
    const warnings: string[] = [];

    // Safely access nested properties
    const planData = plan.plan;
    if (!planData) {
      warnings.push('Plan data structure is incomplete');
      return warnings;
    }

    // Check for overly ambitious timeline (if timeline exists)
    if (planData.timeline?.estimatedDays && planData.timeline.estimatedDays > 30) {
      warnings.push('Timeline exceeds 30 days - consider breaking into smaller projects');
    }

    // Check for too many features (if features exist)
    if (planData.features && planData.features.length > 15) {
      warnings.push('Large number of features - consider prioritizing MVP features first');
    }

    // Check for security considerations (if they exist)
    if (!planData.securityConsiderations || planData.securityConsiderations.length === 0) {
      warnings.push('No security considerations identified - manual review recommended');
    }

    // Check for missing required fields
    if (!planData.overview) {
      warnings.push('Missing project overview');
    }
    if (!planData.features || planData.features.length === 0) {
      warnings.push('No features defined');
    }
    if (!planData.pages || planData.pages.length === 0) {
      warnings.push('No pages defined');
    }
    if (!planData.techStack) {
      warnings.push('Tech stack not specified');
    }

    return warnings;
  }

  /**
   * Estimate cost
   */
  async estimateCost(context: BuildContext): Promise<{
    estimatedTokens: number;
    estimatedCost: number;
    estimatedDuration: number;
  }> {
    // Planner uses more tokens for comprehensive planning
    return {
      estimatedTokens: 3000,
      estimatedCost: 0.003,
      estimatedDuration: 15, // ~15 seconds
    };
  }
}
