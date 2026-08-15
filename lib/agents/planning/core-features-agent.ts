/**
 * Core Features Agent
 * Lists main functionality in beginner-friendly terms
 */

import { BaseAgent } from '../base-agent';
import { BuildContext, AgentOutput, ValidationResult } from '../types';
import { AgentType } from '../../models/BuildTask';
import { PlanSection } from '../../models/BuildSession';

export class CoreFeaturesAgent extends BaseAgent {
  readonly type: AgentType = 'planner';
  readonly name = 'Core Features Agent';
  readonly description = 'Lists main functionality in beginner-friendly terms';

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
          maxTokens: 2000,
        }
      );

      const parsed = this.parseJSONResponse<{
        simpleExplanation: string;
        features: Array<{
          id: string;
          name: string;
          description: string;
          userStory: string;
          priority: 'must-have' | 'should-have' | 'nice-to-have';
          estimatedComplexity: 'simple' | 'moderate' | 'complex';
        }>;
        technicalNotes?: string[];
      }>(response.content);

      const section: PlanSection = {
        id: 'coreFeatures',
        name: 'Core Features',
        status: 'completed',
        simpleExplanation: parsed.simpleExplanation,
        technicalDetails: parsed.technicalNotes,
        data: {
          features: parsed.features,
        },
        generatedAt: new Date(),
        dependencies: ['projectGoals'],
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
      console.error('[CoreFeaturesAgent] Failed:', error);
      throw error;
    }
  }

  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];
    
    if (!context.session.artifacts?.segmentedPlan?.sectionsData?.projectGoals) {
      errors.push('Project goals are required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private buildPrompt(context: BuildContext): string {
    const understanding = context.session.artifacts?.segmentedPlan?.sectionsData?.projectUnderstanding;
    const goals = context.session.artifacts?.segmentedPlan?.sectionsData?.projectGoals;
    
    const systemPrompt = `You are defining core features for a beginner.
Features are the main things users can DO in the application.

RULES:
1. Write like you're explaining to someone who has never built software
2. Each feature should have a clear user story ("As a user, I can...")
3. Focus on WHAT users can do, not HOW it's implemented
4. Prioritize features (must-have for MVP, should-have, nice-to-have)
5. Keep it practical and achievable
6. Return ONLY valid JSON`;

    const userPrompt = `Based on the project goals, define the core features:

PROJECT: ${context.project.description}
TYPE: ${context.project.type}
UNDERSTANDING: ${understanding?.simpleExplanation}
GOALS: ${JSON.stringify(goals?.data?.goals?.map((g: any) => g.title), null, 2)}

Return ONLY this JSON structure:
{
  "simpleExplanation": "What core features mean and why they're important (2-3 sentences)",
  "features": [
    {
      "id": "feature-1",
      "name": "Feature name (short, clear)",
      "description": "What this feature does (2-3 sentences, beginner-friendly)",
      "userStory": "As a [user], I can [action] so that [benefit]",
      "priority": "must-have" | "should-have" | "nice-to-have",
      "estimatedComplexity": "simple" | "moderate" | "complex"
    }
  ],
  "technicalNotes": ["Optional: Any important technical considerations"]
}

Example for student expense tracker:
{
  "simpleExplanation": "Core features are the main actions users can take in your app. These are the building blocks that make your app useful. We focus on must-have features first to create a working version quickly.",
  "features": [
    {
      "id": "feature-1",
      "name": "Add expenses",
      "description": "Students can quickly record any expense by entering the amount, category, and a brief note about what they bought. This happens in seconds so they can track everything easily.",
      "userStory": "As a student, I can add an expense with amount and category so that I keep track of all my spending",
      "priority": "must-have",
      "estimatedComplexity": "simple"
    },
    {
      "id": "feature-2",
      "name": "View expense history",
      "description": "Students can see a list of all their past expenses, organized by date. They can filter by category or search for specific purchases.",
      "userStory": "As a student, I can view all my expenses so that I can see where my money went",
      "priority": "must-have",
      "estimatedComplexity": "simple"
    },
    {
      "id": "feature-3",
      "name": "Categorize spending",
      "description": "Expenses are grouped into categories like Food, Transport, Entertainment. Students can see how much they spend in each category.",
      "userStory": "As a student, I can organize expenses by category so that I understand my spending patterns",
      "priority": "must-have",
      "estimatedComplexity": "moderate"
    },
    {
      "id": "feature-4",
      "name": "Set monthly budgets",
      "description": "Students can set spending limits for each category. The app shows how close they are to their budget.",
      "userStory": "As a student, I can set budget limits so that I stay within my financial goals",
      "priority": "should-have",
      "estimatedComplexity": "moderate"
    },
    {
      "id": "feature-5",
      "name": "Spending insights",
      "description": "The app shows simple charts and trends, like which categories students spend most on, and how spending changes over time.",
      "userStory": "As a student, I can see spending trends so that I can make better financial decisions",
      "priority": "should-have",
      "estimatedComplexity": "moderate"
    }
  ],
  "technicalNotes": [
    "Data will be stored locally for privacy",
    "Consider adding export functionality for must-have features"
  ]
}

Define 4-8 features based on the goals. Focus on must-have features for MVP. Return ONLY valid JSON.`;

    return `${systemPrompt}\n\n${userPrompt}`;
  }

  async estimateCost(context: BuildContext): Promise<{
    estimatedTokens: number;
    estimatedCost: number;
    estimatedDuration: number;
  }> {
    return {
      estimatedTokens: 1500,
      estimatedCost: 0.0015,
      estimatedDuration: 12,
    };
  }
}
