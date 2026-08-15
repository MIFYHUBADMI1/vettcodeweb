/**
 * Data Structure Agent
 * Designs what information needs to be stored
 */

import { BaseAgent } from '../base-agent';
import { BuildContext, AgentOutput, ValidationResult } from '../types';
import { AgentType } from '../../models/BuildTask';
import { PlanSection } from '../../models/BuildSession';

export class DataStructureAgent extends BaseAgent {
  readonly type: AgentType = 'planner';
  readonly name = 'Data Structure Agent';
  readonly description = 'Designs what information needs to be stored';

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
          temperature: 0.6,
          maxTokens: 2000,
        }
      );

      const parsed = this.parseJSONResponse<{
        simpleExplanation: string;
        dataModels: Array<{
          name: string;
          purpose: string;
          fields: Array<{
            name: string;
            type: string;
            description: string;
            required: boolean;
          }>;
          relationships?: string[];
        }>;
        technicalSchema?: any;
      }>(response.content);

      const section: PlanSection = {
        id: 'dataStructure',
        name: 'Data Structure',
        status: 'completed',
        simpleExplanation: parsed.simpleExplanation,
        technicalDetails: parsed.technicalSchema,
        data: {
          dataModels: parsed.dataModels,
        },
        generatedAt: new Date(),
        dependencies: ['coreFeatures', 'techStack'],
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
      console.error('[DataStructureAgent] Failed:', error);
      throw error;
    }
  }

  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) return baseValidation;

    return { valid: true };
  }

  private buildPrompt(context: BuildContext): string {
    const features = context.session.artifacts?.segmentedPlan?.sectionsData?.coreFeatures;
    const techStack = context.session.artifacts?.segmentedPlan?.sectionsData?.techStack;
    
    const systemPrompt = `You are designing data structure for a beginner.
Data structure is about what information the app needs to remember.

RULES:
1. Explain data models like organizing information in folders
2. Use simple field types (text, number, date, true/false)
3. Describe WHY each piece of data is needed
4. Keep it simple - only essential data
5. Return ONLY valid JSON`;

    const userPrompt = `Design the data structure for this project:

PROJECT: ${context.project.description}
FEATURES: ${JSON.stringify(features?.data?.features?.map((f: any) => f.name), null, 2)}
DATABASE: ${techStack?.data?.database?.name || 'Not specified'}

Return ONLY this JSON structure:
{
  "simpleExplanation": "What data structure means and why we organize information this way (2-3 sentences)",
  "dataModels": [
    {
      "name": "ModelName",
      "purpose": "What this data represents (1-2 sentences, beginner-friendly)",
      "fields": [
        {
          "name": "fieldName",
          "type": "text" | "number" | "date" | "true/false" | "email",
          "description": "What this field stores",
          "required": true | false
        }
      ],
      "relationships": ["How this connects to other data models"]
    }
  ],
  "technicalSchema": {
    "notes": "Optional technical details for developers"
  }
}

Example for student expense tracker:
{
  "simpleExplanation": "Data structure is like organizing information into labeled containers. We design what information needs to be saved and how different pieces of information connect to each other.",
  "dataModels": [
    {
      "name": "User",
      "purpose": "Represents each student who uses the app. Stores their account information and preferences.",
      "fields": [
        {
          "name": "id",
          "type": "number",
          "description": "Unique identifier for each user",
          "required": true
        },
        {
          "name": "name",
          "type": "text",
          "description": "Student's full name",
          "required": true
        },
        {
          "name": "email",
          "type": "email",
          "description": "Email address for login",
          "required": true
        },
        {
          "name": "createdAt",
          "type": "date",
          "description": "When the account was created",
          "required": true
        }
      ],
      "relationships": ["A User has many Expenses", "A User has many Budgets"]
    },
    {
      "name": "Expense",
      "purpose": "Represents a single purchase or expense. This is the core data that students track.",
      "fields": [
        {
          "name": "id",
          "type": "number",
          "description": "Unique identifier for each expense",
          "required": true
        },
        {
          "name": "amount",
          "type": "number",
          "description": "How much money was spent (e.g., 12.50)",
          "required": true
        },
        {
          "name": "category",
          "type": "text",
          "description": "What type of expense (Food, Transport, etc.)",
          "required": true
        },
        {
          "name": "description",
          "type": "text",
          "description": "Optional note about what was bought",
          "required": false
        },
        {
          "name": "date",
          "type": "date",
          "description": "When the expense happened",
          "required": true
        },
        {
          "name": "userId",
          "type": "number",
          "description": "Which user this expense belongs to",
          "required": true
        }
      ],
      "relationships": ["An Expense belongs to one User", "An Expense has one Category"]
    },
    {
      "name": "Category",
      "purpose": "Represents expense categories like Food, Transport, Entertainment. Helps organize spending.",
      "fields": [
        {
          "name": "id",
          "type": "number",
          "description": "Unique identifier for each category",
          "required": true
        },
        {
          "name": "name",
          "type": "text",
          "description": "Category name (e.g., 'Food', 'Transport')",
          "required": true
        },
        {
          "name": "icon",
          "type": "text",
          "description": "Icon name for visual display",
          "required": false
        },
        {
          "name": "userId",
          "type": "number",
          "description": "Which user this category belongs to (allows custom categories)",
          "required": true
        }
      ],
      "relationships": ["A Category belongs to one User", "A Category has many Expenses"]
    },
    {
      "name": "Budget",
      "purpose": "Represents spending limits set by students for different categories.",
      "fields": [
        {
          "name": "id",
          "type": "number",
          "description": "Unique identifier for each budget",
          "required": true
        },
        {
          "name": "categoryId",
          "type": "number",
          "description": "Which category this budget applies to",
          "required": true
        },
        {
          "name": "amount",
          "type": "number",
          "description": "Maximum amount to spend in this category per month",
          "required": true
        },
        {
          "name": "month",
          "type": "date",
          "description": "Which month this budget is for",
          "required": true
        },
        {
          "name": "userId",
          "type": "number",
          "description": "Which user this budget belongs to",
          "required": true
        }
      ],
      "relationships": ["A Budget belongs to one User", "A Budget applies to one Category"]
    }
  ],
  "technicalSchema": {
    "notes": "Consider adding indexes on userId and date fields for faster queries. Use DECIMAL type for amounts to avoid floating-point issues."
  }
}

Design data models based on the features. Return ONLY valid JSON.`;

    return `${systemPrompt}\n\n${userPrompt}`;
  }

  async estimateCost(context: BuildContext): Promise<{
    estimatedTokens: number;
    estimatedCost: number;
    estimatedDuration: number;
  }> {
    return {
      estimatedTokens: 1800,
      estimatedCost: 0.0018,
      estimatedDuration: 14,
    };
  }
}
