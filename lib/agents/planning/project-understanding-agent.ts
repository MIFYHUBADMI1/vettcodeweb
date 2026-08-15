/**
 * Project Understanding Agent
 * First section: Translates user's original idea into clear, simple language
 */

import { BaseAgent } from '../base-agent';
import { BuildContext, AgentOutput, ValidationResult } from '../types';
import { AgentType } from '../../models/BuildTask';
import { PlanSection } from '../../models/BuildSession';

export interface ProjectUnderstandingOutput {
  section: PlanSection;
}

export class ProjectUnderstandingAgent extends BaseAgent {
  readonly type: AgentType = 'planner'; // Use planner type for all planning agents
  readonly name = 'Project Understanding Agent';
  readonly description = 'Translates user idea into simple, clear language';

  async execute(context: BuildContext): Promise<AgentOutput> {
    const validation = this.validateInput(context);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join(', ')}`);
    }

    const prompt = this.buildPrompt(context);
    
    try {
      const response = await this.callAI(
        context.user.email,
        'build_planning',
        prompt,
        {
          temperature: 0.7,
          maxTokens: 1500,
        }
      );

      const parsed = this.parseJSONResponse<{
        simpleExplanation: string;
        keyPoints: string[];
        projectType: string;
        targetAudience?: string;
      }>(response.content);

      // Build section data
      const section: PlanSection = {
        id: 'projectUnderstanding',
        name: 'Project Understanding',
        status: 'completed',
        simpleExplanation: parsed.simpleExplanation,
        data: {
          keyPoints: parsed.keyPoints,
          projectType: parsed.projectType,
          targetAudience: parsed.targetAudience,
        },
        generatedAt: new Date(),
        aiUsage: {
          provider: response.provider,
          model: response.model,
          tokensUsed: response.usage.inputTokens + response.usage.outputTokens,
          cost: response.usage.cost,
        },
      };

      return {
        success: true,
        data: { section },
        aiUsage: {
          provider: response.provider,
          model: response.model,
          inputTokens: response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
          cost: response.usage.cost,
        },
      };
    } catch (error) {
      console.error('[ProjectUnderstandingAgent] Failed:', error);
      throw error;
    }
  }

  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) return baseValidation;

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

  private buildPrompt(context: BuildContext): string {
    const systemPrompt = `You are a helpful assistant explaining technical projects to beginners.
Your job is to translate a user's idea into clear, simple language that anyone can understand.

IMPORTANT RULES:
1. Use everyday language - no technical jargon
2. Write like you're explaining to a friend
3. Focus on WHAT the app does, not HOW it's built
4. Keep explanations concise (2-3 sentences max)
5. Return ONLY valid JSON`;

    const userPrompt = `A user wants to build this:

ORIGINAL IDEA: "${context.project.description}"
PROJECT TYPE: ${context.project.type}
${context.project.framework ? `PREFERRED FRAMEWORK: ${context.project.framework}` : ''}

Your task: Translate this into simple, beginner-friendly language.

Return ONLY this JSON structure:
{
  "simpleExplanation": "In simple terms, describe what the user wants to build (2-3 sentences, no jargon)",
  "keyPoints": [
    "First key thing about this project",
    "Second key thing",
    "Third key thing"
  ],
  "projectType": "web app" | "mobile app" | "game" | "website" | "API",
  "targetAudience": "Who will use this? (optional)"
}

Example for "Build a student expense tracker":
{
  "simpleExplanation": "You want to build an application that helps students keep track of how much money they spend. It will let them record their expenses and see where their money goes each month.",
  "keyPoints": [
    "Students can add and categorize their expenses",
    "They can see their spending patterns over time",
    "It helps them understand where their money goes"
  ],
  "projectType": "web app",
  "targetAudience": "College and university students"
}

Now process the user's idea. Return ONLY valid JSON.`;

    return `${systemPrompt}\n\n${userPrompt}`;
  }

  async estimateCost(context: BuildContext): Promise<{
    estimatedTokens: number;
    estimatedCost: number;
    estimatedDuration: number;
  }> {
    return {
      estimatedTokens: 1000,
      estimatedCost: 0.001,
      estimatedDuration: 8,
    };
  }
}
