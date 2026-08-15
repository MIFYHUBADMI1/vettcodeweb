/**
 * Summary Agent
 * Assembles complete plan overview from all sections
 */

import { BaseAgent } from '../base-agent';
import { BuildContext, AgentOutput, ValidationResult } from '../types';
import { AgentType } from '../../models/BuildTask';
import { PlanSection } from '../../models/BuildSession';

export class SummaryAgent extends BaseAgent {
  readonly type: AgentType = 'planner';
  readonly name = 'Summary Agent';
  readonly description = 'Creates complete plan overview';

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
        whatWerBuilding: string;
        mainFeatures: string[];
        techHighlights: string[];
        timeline: {
          complexity: 'simple' | 'moderate' | 'complex';
          estimatedDuration: string;
        };
        nextSteps: string[];
      }>(response.content);

      const section: PlanSection = {
        id: 'summary',
        name: 'Plan Summary',
        status: 'completed',
        simpleExplanation: parsed.simpleExplanation,
        data: parsed,
        generatedAt: new Date(),
        dependencies: ['projectGoals', 'coreFeatures', 'pages', 'techStack', 'architecture'],
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
      console.error('[SummaryAgent] Failed:', error);
      throw error;
    }
  }

  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];
    
    // Summary depends on multiple key sections
    const required = ['projectGoals', 'coreFeatures', 'pages', 'techStack'];
    const segmentedPlan = context.session.artifacts?.segmentedPlan;
    
    for (const section of required) {
      if (!segmentedPlan?.sectionsData[section as keyof typeof segmentedPlan.sectionsData]) {
        errors.push(`${section} section is required for summary`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private buildPrompt(context: BuildContext): string {
    const sections = context.session.artifacts?.segmentedPlan?.sectionsData;
    
    // Gather key information from all sections
    const understanding = sections?.projectUnderstanding;
    const goals = sections?.projectGoals;
    const features = sections?.coreFeatures;
    const pages = sections?.pages;
    const techStack = sections?.techStack;
    const dataStructure = sections?.dataStructure;
    const architecture = sections?.architecture;
    
    const systemPrompt = `You are summarizing the complete plan for a beginner.
The summary should make them excited and confident about what they're building.

RULES:
1. Write an inspiring, clear summary of the entire plan
2. Highlight the most important and impressive parts
3. Make it feel achievable and exciting
4. Use encouraging, positive language
5. Return ONLY valid JSON`;

    const userPrompt = `Create a summary of the complete build plan:

PROJECT: ${context.project.description}
UNDERSTANDING: ${understanding?.simpleExplanation}
GOALS: ${JSON.stringify(goals?.data?.goals?.slice(0, 3)?.map((g: any) => g.title), null, 2)}
FEATURES: ${JSON.stringify(features?.data?.features?.slice(0, 5)?.map((f: any) => f.name), null, 2)}
PAGES: ${JSON.stringify(pages?.data?.pages?.slice(0, 5)?.map((p: any) => p.name), null, 2)}
TECH: ${techStack?.data?.framework?.name}, ${techStack?.data?.database?.name}

Return ONLY this JSON structure:
{
  "simpleExplanation": "An inspiring overview of what we're building (3-4 sentences)",
  "whatWerBuilding": "One sentence description of the final product",
  "mainFeatures": [
    "Key feature 1",
    "Key feature 2",
    "Key feature 3"
  ],
  "techHighlights": [
    "Notable technology choice 1",
    "Notable technology choice 2"
  ],
  "timeline": {
    "complexity": "simple" | "moderate" | "complex",
    "estimatedDuration": "Natural language duration (e.g., '2-3 weeks')"
  },
  "nextSteps": [
    "What happens next, step 1",
    "What happens next, step 2",
    "What happens next, step 3"
  ]
}

Example for student expense tracker:
{
  "simpleExplanation": "We're building a clean, intuitive expense tracking app specifically designed for students. It will help them understand their spending, set budgets, and make better financial decisions. The app works on web browsers and focuses on simplicity - students can add expenses in seconds and see instant insights into where their money goes.",
  "whatWerBuilding": "A student-friendly expense tracker with category-based insights and budget tracking",
  "mainFeatures": [
    "Quick expense entry with categories",
    "Visual breakdown of spending by category",
    "Monthly budget tracking with progress indicators",
    "Clean, mobile-friendly interface",
    "Secure user accounts with private data"
  ],
  "techHighlights": [
    "Built with Next.js for fast, modern web experience",
    "PostgreSQL database for reliable data storage",
    "TypeScript for fewer bugs and better code quality",
    "Tailwind CSS for beautiful, responsive design",
    "Deployed on Vercel for instant, global access"
  ],
  "timeline": {
    "complexity": "moderate",
    "estimatedDuration": "2-3 weeks of focused development"
  },
  "nextSteps": [
    "You'll review this plan and can edit anything you want to change",
    "Once you approve, VettCode's AI Build Team will start creating the app",
    "The team works through architecture, design, and code generation",
    "You'll see live progress as files are created",
    "When complete, you'll have a working app ready to test and deploy"
  ]
}

Create an inspiring, clear summary. Return ONLY valid JSON.`;

    return `${systemPrompt}\n\n${userPrompt}`;
  }

  async estimateCost(context: BuildContext): Promise<{
    estimatedTokens: number;
    estimatedCost: number;
    estimatedDuration: number;
  }> {
    return {
      estimatedTokens: 2000,
      estimatedCost: 0.002,
      estimatedDuration: 15,
    };
  }
}
