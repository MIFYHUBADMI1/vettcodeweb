/**
 * UI/UX Agent
 * Designs user interface and user experience
 */

import { BaseAgent } from './base-agent';
import { BuildContext, AgentOutput, ValidationResult } from './types';
import { AgentType } from '../models/BuildTask';

export interface UIUXOutput {
  design: {
    theme: {
      colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
      };
      typography: {
        fontFamily: string;
        sizes: Record<string, string>;
      };
      spacing: Record<string, string>;
    };
    components: Array<{
      name: string;
      type: string;
      description: string;
      styling: string;
    }>;
    layouts: Array<{
      name: string;
      sections: string[];
      responsive: boolean;
    }>;
    accessibility: {
      contrast: boolean;
      keyboardNav: boolean;
      ariaLabels: boolean;
      screenReader: boolean;
    };
  };
}

export class UIUXAgent extends BaseAgent {
  readonly type: AgentType = 'ui-ux';
  readonly name = 'UI/UX Agent';
  readonly description = 'Designs user interface and user experience';

  async execute(context: BuildContext): Promise<AgentOutput> {
    const validation = this.validateInput(context);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join(', ')}`);
    }

    const prompt = this.buildUIUXPrompt(context);
    const response = await this.callAI(
      context.user.email,
      'build_ui_design',
      prompt,
      {
        temperature: 0.7,
        maxTokens: 2500,
        responseFormat: 'json',
      }
    );

    const design = this.parseJSONResponse<UIUXOutput>(response.content);

    return {
      success: true,
      data: design,
      aiUsage: {
        provider: response.provider,
        model: response.model,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        cost: response.usage.cost,
      },
    };
  }

  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];
    if (!context.plan) {
      errors.push('Project plan is required');
    }
    if (!context.architecture) {
      errors.push('Architecture is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private buildUIUXPrompt(context: BuildContext): string {
    const systemPrompt = `You are a senior UI/UX designer. Your role is to create beautiful, accessible, and user-friendly interfaces.

Design principles:
- User-centered design
- Accessibility (WCAG 2.1 AA)
- Consistent design system
- Mobile-first responsive
- Modern aesthetics`;

    const userPrompt = `Design the UI/UX for this project:

PROJECT TYPE: ${context.project.type}
PROJECT PLAN: ${JSON.stringify(context.plan, null, 2)}
ARCHITECTURE: ${JSON.stringify(context.architecture, null, 2)}

Create a comprehensive design with:
1. Theme (colors, typography, spacing)
2. Component Specifications
3. Layout Patterns
4. Accessibility Features

Return ONLY valid JSON in this format:
{
  "design": {
    "theme": {
      "colors": {
        "primary": "#3B82F6",
        "secondary": "#10B981",
        "accent": "#F59E0B",
        "background": "#FFFFFF",
        "text": "#1F2937"
      },
      "typography": {
        "fontFamily": "Inter, sans-serif",
        "sizes": {
          "xs": "0.75rem",
          "sm": "0.875rem",
          "base": "1rem",
          "lg": "1.125rem",
          "xl": "1.25rem"
        }
      },
      "spacing": {
        "xs": "0.25rem",
        "sm": "0.5rem",
        "md": "1rem",
        "lg": "1.5rem",
        "xl": "2rem"
      }
    },
    "components": [
      {
        "name": "Button",
        "type": "interactive",
        "description": "Primary action button",
        "styling": "rounded corners, shadow on hover, focus ring"
      }
    ],
    "layouts": [
      {
        "name": "MainLayout",
        "sections": ["header", "main", "footer"],
        "responsive": true
      }
    ],
    "accessibility": {
      "contrast": true,
      "keyboardNav": true,
      "ariaLabels": true,
      "screenReader": true
    }
  }
}`;

    return this.buildPrompt(systemPrompt, userPrompt);
  }

  async estimateCost(context: BuildContext): Promise<{
    estimatedTokens: number;
    estimatedCost: number;
    estimatedDuration: number;
  }> {
    return {
      estimatedTokens: 2500,
      estimatedCost: 0.0025,
      estimatedDuration: 12,
    };
  }
}
