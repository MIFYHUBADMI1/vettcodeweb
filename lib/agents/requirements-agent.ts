/**
 * Requirements Agent
 * Breaks down plan into detailed technical requirements
 */

import { BaseAgent } from './base-agent';
import { BuildContext, AgentOutput, ValidationResult } from './types';
import { AgentType } from '../models/BuildTask';

export interface RequirementsOutput {
  requirements: {
    functional: Array<{
      id: string;
      title: string;
      description: string;
      acceptance: string[];
      dependencies: string[];
    }>;
    nonFunctional: Array<{
      category: 'performance' | 'security' | 'accessibility' | 'ux';
      requirement: string;
      metric?: string;
    }>;
    dataModels: Array<{
      name: string;
      fields: Array<{
        name: string;
        type: string;
        required: boolean;
        validation?: string;
      }>;
    }>;
    apis?: Array<{
      method: string;
      endpoint: string;
      description: string;
      input?: any;
      output?: any;
    }>;
  };
}

export class RequirementsAgent extends BaseAgent {
  readonly type: AgentType = 'requirements';
  readonly name = 'Requirements Agent';
  readonly description = 'Breaks down plan into detailed technical requirements';

  async execute(context: BuildContext): Promise<AgentOutput> {
    const validation = this.validateInput(context);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join(', ')}`);
    }

    const prompt = this.buildRequirementsPrompt(context);
    const response = await this.callAI(
      context.user.email,
      'build_requirements',
      prompt,
      {
        temperature: 0.6,
        maxTokens: 3000,
        responseFormat: 'json',
      }
    );

    const requirements = this.parseJSONResponse<RequirementsOutput>(response.content);

    return {
      success: true,
      data: requirements,
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

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private buildRequirementsPrompt(context: BuildContext): string {
    const systemPrompt = `You are a senior business analyst and technical requirements specialist. Your role is to analyze a project plan and create detailed, actionable technical requirements.

Consider:
- Clear acceptance criteria
- Data model design
- API contracts (if applicable)
- Security requirements
- Accessibility requirements
- Performance requirements`;

    const userPrompt = `Analyze this project plan and create detailed technical requirements:

PROJECT PLAN:
${JSON.stringify(context.plan, null, 2)}

Create comprehensive requirements with:
1. Functional Requirements (what the system must do)
2. Non-Functional Requirements (performance, security, accessibility, UX)
3. Data Models (entities with fields and validation)
4. APIs (if this is a full-stack project)

Return ONLY valid JSON in this format:
{
  "requirements": {
    "functional": [
      {
        "id": "FR-001",
        "title": "User Authentication",
        "description": "System must allow users to register and login",
        "acceptance": ["User can create account", "User can login"],
        "dependencies": []
      }
    ],
    "nonFunctional": [
      {
        "category": "security",
        "requirement": "All passwords must be hashed",
        "metric": "bcrypt with salt rounds >= 10"
      }
    ],
    "dataModels": [
      {
        "name": "User",
        "fields": [
          {
            "name": "email",
            "type": "string",
            "required": true,
            "validation": "valid email format"
          }
        ]
      }
    ],
    "apis": [
      {
        "method": "POST",
        "endpoint": "/api/auth/register",
        "description": "Register new user",
        "input": { "email": "string", "password": "string" },
        "output": { "success": "boolean", "userId": "string" }
      }
    ]
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
      estimatedTokens: 3000,
      estimatedCost: 0.003,
      estimatedDuration: 15,
    };
  }
}
