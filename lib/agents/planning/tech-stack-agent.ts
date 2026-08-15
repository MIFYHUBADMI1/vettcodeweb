/**
 * Tech Stack Agent
 * Selects technologies with beginner explanations
 */

import { BaseAgent } from '../base-agent';
import { BuildContext, AgentOutput, ValidationResult } from '../types';
import { AgentType } from '../../models/BuildTask';
import { PlanSection } from '../../models/BuildSession';

export class TechStackAgent extends BaseAgent {
  readonly type: AgentType = 'planner';
  readonly name = 'Tech Stack Agent';
  readonly description = 'Selects technologies with beginner explanations';

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
        technologies: {
          framework?: { name: string; why: string };
          language?: { name: string; why: string };
          styling?: { name: string; why: string };
          database?: { name: string; why: string };
          authentication?: { name: string; why: string };
          hosting?: { name: string; why: string };
        };
        technicalNotes?: string[];
      }>(response.content);

      const section: PlanSection = {
        id: 'techStack',
        name: 'Technology Stack',
        status: 'completed',
        simpleExplanation: parsed.simpleExplanation,
        technicalDetails: parsed.technicalNotes,
        data: parsed.technologies,
        generatedAt: new Date(),
        dependencies: ['coreFeatures', 'pages'],
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
      console.error('[TechStackAgent] Failed:', error);
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
    const pages = context.session.artifacts?.segmentedPlan?.sectionsData?.pages;
    
    const systemPrompt = `You are selecting technology for a beginner.
Technology stack is the set of tools used to build the application.

RULES:
1. Explain WHAT each technology does in simple terms
2. Explain WHY it's a good choice for this project
3. Prefer user's framework choice if specified
4. Choose beginner-friendly, well-documented technologies
5. Keep it simple - don't over-engineer
6. Return ONLY valid JSON`;

    const userPrompt = `Select the best technologies for this project:

PROJECT: ${context.project.description}
TYPE: ${context.project.type}
${context.project.framework ? `PREFERRED FRAMEWORK: ${context.project.framework}` : ''}
FEATURES: ${JSON.stringify(features?.data?.features?.map((f: any) => f.name), null, 2)}

Return ONLY this JSON structure:
{
  "simpleExplanation": "What technology stack means and why these choices matter (2-3 sentences)",
  "technologies": {
    "framework": {
      "name": "Technology name",
      "why": "Why we're using this (beginner-friendly explanation, 2-3 sentences)"
    },
    "language": {
      "name": "Programming language",
      "why": "Why this language fits the project"
    },
    "styling": {
      "name": "CSS framework or approach",
      "why": "Why this styling approach"
    },
    "database": {
      "name": "Database choice",
      "why": "Why this database"
    },
    "authentication": {
      "name": "Auth solution",
      "why": "Why this approach to user accounts"
    },
    "hosting": {
      "name": "Hosting platform",
      "why": "Why this platform"
    }
  },
  "technicalNotes": ["Additional technical consideration"]
}

Example for student expense tracker (web app):
{
  "simpleExplanation": "The technology stack is like choosing the right tools and materials to build a house. We pick technologies that work well together, are reliable, and make development faster.",
  "technologies": {
    "framework": {
      "name": "Next.js",
      "why": "Next.js is a modern web framework that makes building fast, SEO-friendly web apps easy. It handles routing, server functions, and deployment automatically, so you can focus on features rather than setup."
    },
    "language": {
      "name": "TypeScript",
      "why": "TypeScript is JavaScript with extra safety features. It catches errors before you run the code, making development faster and more reliable. It's the industry standard for modern web apps."
    },
    "styling": {
      "name": "Tailwind CSS",
      "why": "Tailwind lets you style components quickly using utility classes. It's fast to work with, keeps styles consistent, and produces clean, performant CSS."
    },
    "database": {
      "name": "PostgreSQL",
      "why": "PostgreSQL is a powerful, reliable database perfect for structured data like expenses and budgets. It's free, well-supported, and scales from small projects to enterprise apps."
    },
    "authentication": {
      "name": "NextAuth.js",
      "why": "NextAuth handles user accounts, login, and security automatically. It integrates perfectly with Next.js and supports email/password login plus social providers."
    },
    "hosting": {
      "name": "Vercel",
      "why": "Vercel is made by the Next.js team, so deployment is instant and automatic. Free tier is generous, and it handles scaling, HTTPS, and CDN automatically."
    }
  },
  "technicalNotes": [
    "Consider adding Prisma ORM for easier database interactions",
    "SWR or React Query for client-side data fetching",
    "Consider environment variable management for API keys"
  ]
}

Example for mobile app:
{
  "simpleExplanation": "We choose technologies that let us build for both iPhone and Android from one codebase, saving time and keeping everything consistent.",
  "technologies": {
    "framework": {
      "name": "React Native",
      "why": "React Native lets you build real native apps for iOS and Android using JavaScript. One codebase works on both platforms, and it has a huge community and library ecosystem."
    },
    "language": {
      "name": "TypeScript",
      "why": "TypeScript adds type safety to JavaScript, catching errors early and making the codebase more maintainable."
    },
    "styling": {
      "name": "React Native StyleSheet",
      "why": "Built-in styling that's similar to CSS but optimized for mobile apps."
    },
    "database": {
      "name": "SQLite (local) + Firebase (cloud)",
      "why": "SQLite stores data locally on the phone for fast access offline. Firebase syncs data to the cloud and between devices."
    },
    "authentication": {
      "name": "Firebase Authentication",
      "why": "Firebase Auth handles user accounts, login, and password reset with minimal code. Works seamlessly with Firebase database."
    }
  }
}

Choose technologies appropriate for ${context.project.type}. Return ONLY valid JSON.`;

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
