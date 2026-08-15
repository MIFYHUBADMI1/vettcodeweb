/**
 * Design Direction Agent
 * Defines visual style and theme
 */

import { BaseAgent } from '../base-agent';
import { BuildContext, AgentOutput, ValidationResult } from '../types';
import { AgentType } from '../../models/BuildTask';
import { PlanSection } from '../../models/BuildSession';

export class DesignDirectionAgent extends BaseAgent {
  readonly type: AgentType = 'planner';
  readonly name = 'Design Direction Agent';
  readonly description = 'Defines visual style and theme';

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
          temperature: 0.8,
          maxTokens: 1800,
        }
      );

      const parsed = this.parseJSONResponse<{
        simpleExplanation: string;
        styleDirection: string;
        colorScheme: {
          primary: string;
          secondary: string;
          accent: string;
          description: string;
        };
        typography: {
          style: string;
          description: string;
        };
        mood: string[];
        visualElements: string[];
      }>(response.content);

      const section: PlanSection = {
        id: 'designDirection',
        name: 'Design Direction',
        status: 'completed',
        simpleExplanation: parsed.simpleExplanation,
        data: parsed,
        generatedAt: new Date(),
        dependencies: ['pages'],
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
      console.error('[DesignDirectionAgent] Failed:', error);
      throw error;
    }
  }

  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) return baseValidation;

    return { valid: true };
  }

  private buildPrompt(context: BuildContext): string {
    const understanding = context.session.artifacts?.segmentedPlan?.sectionsData?.projectUnderstanding;
    
    const systemPrompt = `You are defining visual design for a beginner.
Design direction is about how the app LOOKS and FEELS.

RULES:
1. Use descriptive, visual language anyone can understand
2. Explain color and style choices in simple terms
3. Connect design to the app's purpose
4. Keep it modern and professional
5. Return ONLY valid JSON`;

    const userPrompt = `Based on the project, define the design direction:

PROJECT: ${context.project.description}
TYPE: ${context.project.type}
UNDERSTANDING: ${understanding?.simpleExplanation}

Return ONLY this JSON structure:
{
  "simpleExplanation": "What design direction means and why it matters (2-3 sentences)",
  "styleDirection": "Overall visual style (e.g., 'Clean and minimal', 'Playful and colorful', 'Professional and trustworthy')",
  "colorScheme": {
    "primary": "Color name (e.g., 'Deep Blue')",
    "secondary": "Color name (e.g., 'Soft Gray')",
    "accent": "Color name (e.g., 'Bright Green')",
    "description": "Why these colors work for this app (1-2 sentences)"
  },
  "typography": {
    "style": "Font personality (e.g., 'Modern and readable', 'Bold and friendly')",
    "description": "How text will look and feel (1 sentence)"
  },
  "mood": ["Mood word 1", "Mood word 2", "Mood word 3"],
  "visualElements": [
    "Key visual element 1 (e.g., 'Rounded corners for friendliness')",
    "Key visual element 2",
    "Key visual element 3"
  ]
}

Example for student expense tracker:
{
  "simpleExplanation": "Design direction is about creating a look and feel that makes students want to use the app. We want it to feel approachable and easy, not intimidating or complicated like banking apps.",
  "styleDirection": "Clean, modern, and student-friendly",
  "colorScheme": {
    "primary": "Calm Blue",
    "secondary": "Light Gray",
    "accent": "Bright Green",
    "description": "Blue feels trustworthy for money matters, green represents positive progress, and gray keeps it clean without being boring."
  },
  "typography": {
    "style": "Clear and friendly",
    "description": "Easy-to-read fonts that feel modern but not too corporate"
  },
  "mood": ["Approachable", "Organized", "Encouraging", "Simple"],
  "visualElements": [
    "Soft rounded corners to feel friendly, not harsh",
    "Simple icons that are instantly recognizable",
    "Subtle shadows for depth without clutter",
    "Clear visual hierarchy so important info stands out",
    "Generous spacing to avoid feeling cramped"
  ]
}

Return ONLY valid JSON.`;

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
