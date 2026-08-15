/**
 * Architecture Agent
 * Designs system architecture and folder structure
 */

import { BaseAgent } from './base-agent';
import { BuildContext, AgentOutput, ValidationResult } from './types';
import { AgentType } from '../models/BuildTask';

export interface ArchitectureOutput {
  architecture: {
    folderStructure: Record<string, {
      type: 'folder' | 'file';
      purpose: string;
    }>;
    componentHierarchy: Array<{
      name: string;
      path: string;
      type: 'page' | 'layout' | 'component' | 'utility';
      props?: any;
    }>;
    stateManagement: {
      approach: string;
      stores?: Array<{
        name: string;
        purpose: string;
      }>;
    };
    routing: Array<{
      path: string;
      component: string;
      protected: boolean;
    }>;
    patterns: string[];
  };
}

export class ArchitectureAgent extends BaseAgent {
  readonly type: AgentType = 'architecture';
  readonly name = 'Architecture Agent';
  readonly description = 'Designs system architecture and folder structure';

  async execute(context: BuildContext): Promise<AgentOutput> {
    const validation = this.validateInput(context);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join(', ')}`);
    }

    const prompt = this.buildArchitecturePrompt(context);
    const response = await this.callAI(
      context.user.email,
      'build_architecture',
      prompt,
      {
        temperature: 0.5,
        maxTokens: 3500,
        responseFormat: 'json',
      }
    );

    const architecture = this.parseJSONResponse<ArchitectureOutput>(response.content);

    return {
      success: true,
      data: architecture,
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
    if (!context.requirements) {
      errors.push('Requirements are required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private buildArchitecturePrompt(context: BuildContext): string {
    const systemPrompt = `You are a senior software architect. Your role is to design a clean, scalable, and maintainable system architecture.

Follow best practices:
- Separation of concerns
- Component reusability
- Clear folder structure
- Scalability patterns
- Framework conventions (${context.project.framework})`;

    const userPrompt = `Design the system architecture for this project:

FRAMEWORK: ${context.project.framework}
PROJECT PLAN: ${JSON.stringify(context.plan, null, 2)}
REQUIREMENTS: ${JSON.stringify(context.requirements, null, 2)}

Create a comprehensive architecture with:
1. Folder Structure (all folders and key files)
2. Component Hierarchy (all components with relationships)
3. State Management Strategy
4. Routing Configuration
5. Design Patterns Used

Return ONLY valid JSON in this format:
{
  "architecture": {
    "folderStructure": {
      "src": { "type": "folder", "purpose": "Source code" },
      "src/components": { "type": "folder", "purpose": "React components" },
      "src/App.tsx": { "type": "file", "purpose": "Main app component" }
    },
    "componentHierarchy": [
      {
        "name": "App",
        "path": "src/App.tsx",
        "type": "page",
        "props": {}
      }
    ],
    "stateManagement": {
      "approach": "React Context API",
      "stores": [
        { "name": "AuthContext", "purpose": "User authentication state" }
      ]
    },
    "routing": [
      { "path": "/", "component": "Home", "protected": false },
      { "path": "/dashboard", "component": "Dashboard", "protected": true }
    ],
    "patterns": ["Container/Presenter", "Custom Hooks", "Context API"]
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
      estimatedTokens: 3500,
      estimatedCost: 0.0035,
      estimatedDuration: 18,
    };
  }
}
