/**
 * Pages Agent
 * Designs page and screen structure
 */

import { BaseAgent } from '../base-agent';
import { BuildContext, AgentOutput, ValidationResult } from '../types';
import { AgentType } from '../../models/BuildTask';
import { PlanSection } from '../../models/BuildSession';

export class PagesAgent extends BaseAgent {
  readonly type: AgentType = 'planner';
  readonly name = 'Pages Agent';
  readonly description = 'Designs page and screen structure';

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
        pages: Array<{
          id: string;
          name: string;
          route: string;
          purpose: string;
          mainSections: string[];
          keyElements: string[];
          requiresAuth?: boolean;
        }>;
        navigation: {
          type: string;
          mainItems: string[];
        };
      }>(response.content);

      const section: PlanSection = {
        id: 'pages',
        name: 'Pages / Screens',
        status: 'completed',
        simpleExplanation: parsed.simpleExplanation,
        data: {
          pages: parsed.pages,
          navigation: parsed.navigation,
        },
        generatedAt: new Date(),
        dependencies: ['coreFeatures', 'userExperience'],
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
      console.error('[PagesAgent] Failed:', error);
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
    const userFlows = context.session.artifacts?.segmentedPlan?.sectionsData?.userExperience;
    const projectType = context.project.type;
    
    // Determine terminology based on project type
    const pageTerminology = projectType === 'mobile' || projectType === 'game' ? 'screens' : 'pages';
    
    const systemPrompt = `You are designing ${pageTerminology} for a beginner.
${pageTerminology === 'screens' ? 'Screens' : 'Pages'} are the different views users see in the application.

RULES:
1. Use simple language to describe each ${pageTerminology === 'screens' ? 'screen' : 'page'}
2. Explain WHAT users see and do on each ${pageTerminology === 'screens' ? 'screen' : 'page'}
3. Keep the structure simple and logical
4. Group related content together
5. Return ONLY valid JSON`;

    const userPrompt = `Based on features and user flows, design the main ${pageTerminology}:

PROJECT: ${context.project.description}
TYPE: ${context.project.type}
FEATURES: ${JSON.stringify(features?.data?.features?.map((f: any) => f.name), null, 2)}

Return ONLY this JSON structure:
{
  "simpleExplanation": "What ${pageTerminology} are and why we organize the app this way (2-3 sentences)",
  "pages": [
    {
      "id": "page-1",
      "name": "${pageTerminology === 'screens' ? 'Screen' : 'Page'} name",
      "route": "${pageTerminology === 'screens' ? 'screen-name' : '/page-path'}",
      "purpose": "What users come here to do (1-2 sentences)",
      "mainSections": ["Section 1", "Section 2"],
      "keyElements": ["Element 1", "Element 2"],
      "requiresAuth": true | false
    }
  ],
  "navigation": {
    "type": "sidebar" | "top-nav" | "bottom-tabs" | "hamburger",
    "mainItems": ["Home", "Categories", "Budget"]
  }
}

Example for student expense tracker (web app):
{
  "simpleExplanation": "Pages are the different screens users navigate between. Each page has a specific purpose, like viewing expenses or managing budgets. We keep navigation simple so users always know where they are.",
  "pages": [
    {
      "id": "page-home",
      "name": "Home / Dashboard",
      "route": "/",
      "purpose": "The main page where students see their recent expenses and quick stats. This is where they land after signing in.",
      "mainSections": [
        "Recent expenses list",
        "Quick add expense button",
        "Monthly spending summary",
        "Budget status indicators"
      ],
      "keyElements": [
        "Add Expense button (prominent)",
        "Expense list with date, amount, category",
        "Total spent this month",
        "Navigation menu"
      ],
      "requiresAuth": true
    },
    {
      "id": "page-add-expense",
      "name": "Add Expense",
      "route": "/add-expense",
      "purpose": "A simple form where students quickly record a new expense.",
      "mainSections": [
        "Expense entry form",
        "Category selector",
        "Save/Cancel buttons"
      ],
      "keyElements": [
        "Amount input field",
        "Category dropdown",
        "Optional note textarea",
        "Date picker (defaults to today)",
        "Save button",
        "Cancel button"
      ],
      "requiresAuth": true
    },
    {
      "id": "page-categories",
      "name": "Categories",
      "route": "/categories",
      "purpose": "Shows spending broken down by category, helping students see where their money goes.",
      "mainSections": [
        "Category list with totals",
        "Visual breakdown (chart/graph)",
        "Ability to drill into each category"
      ],
      "keyElements": [
        "Category cards showing name, icon, total spent",
        "Pie chart or bar graph",
        "Click to view category details"
      ],
      "requiresAuth": true
    },
    {
      "id": "page-budget",
      "name": "Budget",
      "route": "/budget",
      "purpose": "Students set spending limits and see how they're tracking against their goals.",
      "mainSections": [
        "Budget overview",
        "Set/edit budget limits",
        "Progress indicators"
      ],
      "keyElements": [
        "Budget cards per category",
        "Progress bars showing spent vs budget",
        "Edit budget button",
        "Status indicators (on track, near limit, over budget)"
      ],
      "requiresAuth": true
    },
    {
      "id": "page-login",
      "name": "Login",
      "route": "/login",
      "purpose": "Where students sign in to access their personal expense data.",
      "mainSections": [
        "Login form",
        "Sign up link"
      ],
      "keyElements": [
        "Email input",
        "Password input",
        "Login button",
        "Sign up link",
        "Forgot password link"
      ],
      "requiresAuth": false
    },
    {
      "id": "page-signup",
      "name": "Sign Up",
      "route": "/signup",
      "purpose": "New students create their account to start tracking expenses.",
      "mainSections": [
        "Registration form",
        "Login link"
      ],
      "keyElements": [
        "Name input",
        "Email input",
        "Password input",
        "Confirm password input",
        "Sign up button",
        "Login link"
      ],
      "requiresAuth": false
    }
  ],
  "navigation": {
    "type": "sidebar",
    "mainItems": ["Dashboard", "Add Expense", "Categories", "Budget", "Settings"]
  }
}

Example for mobile app (use "screens" instead of "pages", routes like "HomeScreen" instead of "/"):
{
  "simpleExplanation": "Screens are what users see on their phone as they use the app. Each screen focuses on one main task, and users navigate between them using tabs or buttons.",
  "pages": [
    {
      "id": "screen-home",
      "name": "Home Screen",
      "route": "HomeScreen",
      "purpose": "The main screen showing recent expenses and quick actions.",
      "mainSections": ["Recent expenses", "Quick add button", "Spending summary"],
      "keyElements": ["Expense list", "Floating add button", "Monthly total"],
      "requiresAuth": true
    }
  ],
  "navigation": {
    "type": "bottom-tabs",
    "mainItems": ["Home", "Categories", "Budget", "Profile"]
  }
}

Design ${pageTerminology} appropriate for ${context.project.type}. Return ONLY valid JSON.`;

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
