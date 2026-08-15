/**
 * Project Goals Agent
 * Defines what the application should accomplish
 */

import { BaseAgent } from '../base-agent';
import { BuildContext, AgentOutput, ValidationResult } from '../types';
import { AgentType } from '../../models/BuildTask';
import { PlanSection } from '../../models/BuildSession';

export class ProjectGoalsAgent extends BaseAgent {
  readonly type: AgentType = 'planner';
  readonly name = 'Project Goals Agent';
  readonly description = 'Defines what the application should accomplish';

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
        goals: Array<{
          id: string;
          title: string;
          description: string;
          priority: 'high' | 'medium' | 'low';
          userBenefit: string;
        }>;
      }>(response.content);

      const section: PlanSection = {
        id: 'projectGoals',
        name: 'Project Goals',
        status: 'completed',
        simpleExplanation: parsed.simpleExplanation,
        data: {
          goals: parsed.goals,
        },
        generatedAt: new Date(),
        dependencies: ['projectUnderstanding'],
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
      console.error('[ProjectGoalsAgent] Failed:', error);
      throw error;
    }
  }

  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];
    
    if (!context.session.artifacts?.segmentedPlan?.sectionsData?.projectUnderstanding) {
      errors.push('Project understanding is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private buildPrompt(context: BuildContext): string {
    const understanding = context.session.artifacts?.segmentedPlan?.sectionsData?.projectUnderstanding;
    
    const systemPrompt = `You are defining project goals for a beginner.
Goals should be clear, specific, and focus on what the user wants to achieve.

RULES:
1. Write in simple, everyday language
2. Focus on outcomes, not technical implementation
3. Each goal should explain WHY it matters to users
4. Keep descriptions concise (1-2 sentences)
5. Return ONLY valid JSON`;

    const userPrompt = `Based on this project understanding, define clear project goals:

PROJECT: ${context.project.description}
TYPE: ${context.project.type}
UNDERSTANDING: ${understanding?.simpleExplanation}

Return ONLY this JSON structure:
{
  "simpleExplanation": "A brief overview of what this project aims to accomplish (2-3 sentences)",
  "goals": [
    {
      "id": "goal-1",
      "title": "Short goal title",
      "description": "What this goal is about (1-2 sentences, beginner-friendly)",
      "priority": "high" | "medium" | "low",
      "userBenefit": "Why this matters to users (1 sentence)"
    }
  ]
}

Example for a student expense tracker:
{
  "simpleExplanation": "This project aims to help students take control of their spending, understand their financial habits, and make better money decisions.",
  "goals": [
    {
      "id": "goal-1",
      "title": "Track every expense easily",
      "description": "Students can quickly add any purchase they make, no matter how small, so nothing gets forgotten.",
      "priority": "high",
      "userBenefit": "Helps students see exactly where their money goes"
    },
    {
      "id": "goal-2",
      "title": "Understand spending patterns",
      "description": "Show students their spending organized by category and over time, so they can spot trends.",
      "priority": "high",
      "userBenefit": "Makes it easy to identify areas where they might be overspending"
    },
    {
      "id": "goal-3",
      "title": "Set and track budgets",
      "description": "Let students set spending limits for different categories and see how they're doing.",
      "priority": "medium",
      "userBenefit": "Encourages better financial planning and awareness"
    }
  ]
}

Define 3-5 clear goals. Return ONLY valid JSON.`;

    return `${systemPrompt}\n\n${userPrompt}`;
  }

  async estimateCost(context: BuildContext): Promise<{
    estimatedTokens: number;
    estimatedCost: number;
    estimatedDuration: number;
  }> {
    return {
      estimatedTokens: 1200,
      estimatedCost: 0.0012,
      estimatedDuration: 10,
    };
  }
}
