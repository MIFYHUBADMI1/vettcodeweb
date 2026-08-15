/**
 * Security Planning Agent
 * How to keep the application safe
 */

import { BaseAgent } from '../base-agent';
import { BuildContext, AgentOutput, ValidationResult } from '../types';
import { AgentType } from '../../models/BuildTask';
import { PlanSection } from '../../models/BuildSession';

export class SecurityPlanningAgent extends BaseAgent {
  readonly type: AgentType = 'planner';
  readonly name = 'Security Planning Agent';
  readonly description = 'Plans how to keep the application safe';

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
          maxTokens: 1800,
        }
      );

      const parsed = this.parseJSONResponse<{
        simpleExplanation: string;
        considerations: Array<{
          area: string;
          concern: string;
          solution: string;
          why: string;
        }>;
        technicalMeasures?: string[];
      }>(response.content);

      const section: PlanSection = {
        id: 'security',
        name: 'Security Considerations',
        status: 'completed',
        simpleExplanation: parsed.simpleExplanation,
        technicalDetails: parsed.technicalMeasures,
        data: {
          considerations: parsed.considerations,
        },
        generatedAt: new Date(),
        dependencies: ['architecture', 'dataStructure'],
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
      console.error('[SecurityPlanningAgent] Failed:', error);
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
    const dataStructure = context.session.artifacts?.segmentedPlan?.sectionsData?.dataStructure;
    const architecture = context.session.artifacts?.segmentedPlan?.sectionsData?.architecture;
    
    const systemPrompt = `You are explaining security to a beginner.
Security is about protecting user data and preventing bad actors from causing harm.

RULES:
1. Explain security concerns in everyday language (like locking doors, checking IDs)
2. For each concern, explain WHAT could go wrong and HOW we prevent it
3. Focus on WHY security matters to users
4. Don't use scary technical jargon
5. Return ONLY valid JSON`;

    const userPrompt = `Identify security considerations for this project:

PROJECT: ${context.project.description}
FEATURES: ${JSON.stringify(features?.data?.features?.slice(0, 5)?.map((f: any) => f.name), null, 2)}
DATA MODELS: ${JSON.stringify(dataStructure?.data?.dataModels?.map((m: any) => m.name), null, 2)}

Return ONLY this JSON structure:
{
  "simpleExplanation": "What security means and why it's important for this app (2-3 sentences)",
  "considerations": [
    {
      "area": "Security area (e.g., 'User Passwords', 'Data Privacy')",
      "concern": "What could go wrong (beginner-friendly, 1-2 sentences)",
      "solution": "How we protect against this (beginner-friendly, 2-3 sentences)",
      "why": "Why this matters to users (1 sentence)"
    }
  ],
  "technicalMeasures": ["Optional technical security measures"]
}

Example for student expense tracker:
{
  "simpleExplanation": "Security is about keeping student data safe and private. We make sure only the right person can access their expenses, and we protect sensitive information like passwords.",
  "considerations": [
    {
      "area": "User Passwords",
      "concern": "If passwords are stored as plain text, anyone with database access can see them and steal accounts.",
      "solution": "Passwords are hashed (scrambled using a special one-way process) before saving. Even we can't read the original password. When users log in, we hash what they type and compare it to the stored hash.",
      "why": "Protects user accounts even if the database is compromised"
    },
    {
      "area": "Data Privacy",
      "concern": "Users shouldn't be able to see other people's expenses. If the system doesn't check properly, one student could see another student's spending.",
      "solution": "Every time someone requests expense data, we verify their identity and make sure they only get their own data. We check user ID on every request before returning any information.",
      "why": "Ensures personal financial data stays completely private"
    },
    {
      "area": "User Input",
      "concern": "Malicious users might try to break the app or inject harmful code through forms where they enter expense amounts or notes.",
      "solution": "We validate all input before processing it. Numbers must be actual numbers, text fields have character limits, and we sanitize input to remove any code that could be harmful.",
      "why": "Prevents attackers from breaking the app or stealing data"
    },
    {
      "area": "Authentication",
      "concern": "If someone steals a user's login session, they could access that person's account without knowing the password.",
      "solution": "Login sessions automatically expire after a period of inactivity. We use secure, encrypted tokens that are hard to steal. Users can log out from all devices if they suspect a problem.",
      "why": "Limits damage if a device is lost or compromised"
    },
    {
      "area": "HTTPS/Encryption",
      "concern": "Data traveling between the user's browser and our server could be intercepted by attackers on public WiFi.",
      "solution": "All communication uses HTTPS (the lock icon in the browser). This encrypts data in transit so interceptors only see scrambled garbage.",
      "why": "Protects data even on public/unsecured networks"
    }
  ],
  "technicalMeasures": [
    "bcrypt for password hashing with salt",
    "JWT tokens with short expiration",
    "CSRF protection on all forms",
    "SQL parameterization to prevent injection",
    "Rate limiting on login attempts",
    "HTTP-only secure cookies",
    "Content Security Policy headers"
  ]
}

Identify 4-6 key security considerations. Return ONLY valid JSON.`;

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
