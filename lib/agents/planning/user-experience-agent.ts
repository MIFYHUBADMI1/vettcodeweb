/**
 * User Experience Agent
 * Defines how users will interact with the application
 */

import { BaseAgent } from '../base-agent';
import { BuildContext, AgentOutput, ValidationResult } from '../types';
import { AgentType } from '../../models/BuildTask';
import { PlanSection } from '../../models/BuildSession';

export class UserExperienceAgent extends BaseAgent {
  readonly type: AgentType = 'planner';
  readonly name = 'User Experience Agent';
  readonly description = 'Defines how users will interact with the application';

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
          maxTokens: 1800,
        }
      );

      const parsed = this.parseJSONResponse<{
        simpleExplanation: string;
        userFlows: Array<{
          id: string;
          name: string;
          description: string;
          steps: string[];
          startPoint: string;
          endGoal: string;
        }>;
        keyInteractions: string[];
      }>(response.content);

      const section: PlanSection = {
        id: 'userExperience',
        name: 'User Experience',
        status: 'completed',
        simpleExplanation: parsed.simpleExplanation,
        data: {
          userFlows: parsed.userFlows,
          keyInteractions: parsed.keyInteractions,
        },
        generatedAt: new Date(),
        dependencies: ['coreFeatures'],
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
      console.error('[UserExperienceAgent] Failed:', error);
      throw error;
    }
  }

  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];
    
    if (!context.session.artifacts?.segmentedPlan?.sectionsData?.coreFeatures) {
      errors.push('Core features are required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private buildPrompt(context: BuildContext): string {
    const features = context.session.artifacts?.segmentedPlan?.sectionsData?.coreFeatures;
    
    const systemPrompt = `You are designing user experience for a beginner.
User flows describe the journey a user takes to accomplish something.

RULES:
1. Describe interactions in simple, step-by-step language
2. Focus on the user's perspective ("First, you...", "Then, you...")
3. Each flow should have a clear start and end goal
4. Keep steps concise and actionable
5. Return ONLY valid JSON`;

    const userPrompt = `Based on these features, design the main user flows:

PROJECT: ${context.project.description}
TYPE: ${context.project.type}
FEATURES: ${JSON.stringify(features?.data?.features?.map((f: any) => f.name), null, 2)}

Return ONLY this JSON structure:
{
  "simpleExplanation": "What user experience means and why we map it out (2-3 sentences)",
  "userFlows": [
    {
      "id": "flow-1",
      "name": "Flow name (e.g., 'Adding a new expense')",
      "description": "What the user accomplishes in this flow (1-2 sentences)",
      "steps": [
        "Step 1: User action",
        "Step 2: Next action",
        "Step 3: Final action"
      ],
      "startPoint": "Where the user begins (e.g., 'Home page')",
      "endGoal": "What the user achieves (e.g., 'Expense saved successfully')"
    }
  ],
  "keyInteractions": [
    "Important interaction pattern 1",
    "Important interaction pattern 2"
  ]
}

Example for student expense tracker:
{
  "simpleExplanation": "User experience is about making your app easy and intuitive to use. We map out the main journeys users will take, step by step, so the app feels natural and straightforward.",
  "userFlows": [
    {
      "id": "flow-1",
      "name": "Adding a new expense",
      "description": "A student records a purchase they just made, categorizes it, and saves it to their expense history.",
      "steps": [
        "Student clicks 'Add Expense' button",
        "Student enters amount (e.g., $12.50)",
        "Student selects category from dropdown (e.g., Food)",
        "Student optionally adds a note (e.g., 'Lunch at campus cafe')",
        "Student clicks 'Save'",
        "App confirms expense was saved",
        "Student returns to main view where new expense appears"
      ],
      "startPoint": "Home screen / Expense list",
      "endGoal": "Expense recorded and visible in history"
    },
    {
      "id": "flow-2",
      "name": "Viewing spending by category",
      "description": "A student wants to see how much they've spent on food this month.",
      "steps": [
        "Student navigates to 'Categories' or 'Insights' tab",
        "Student sees list of categories with spending amounts",
        "Student clicks on 'Food' category",
        "App shows all food expenses for current month",
        "Student can see total spent on food"
      ],
      "startPoint": "Home screen",
      "endGoal": "Understanding category spending"
    },
    {
      "id": "flow-3",
      "name": "Setting a monthly budget",
      "description": "A student sets a spending limit for a category to help them stay on track.",
      "steps": [
        "Student navigates to 'Budget' section",
        "Student selects a category (e.g., Entertainment)",
        "Student enters budget amount (e.g., $50)",
        "Student saves the budget",
        "App shows progress bar indicating current spending vs budget"
      ],
      "startPoint": "Budget settings",
      "endGoal": "Budget set and tracking begins"
    }
  ],
  "keyInteractions": [
    "Quick expense entry - should take less than 10 seconds",
    "Visual feedback when actions complete (confirmations, animations)",
    "Easy navigation between main sections (expenses, categories, budget)",
    "Clear visual indicators for budget status (on track, near limit, over budget)"
  ]
}

Define 3-5 main user flows based on the features. Return ONLY valid JSON.`;

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
