/**
 * Testing Strategy Agent
 * Plans how to verify the application works
 */

import { BaseAgent } from '../base-agent';
import { BuildContext, AgentOutput, ValidationResult } from '../types';
import { AgentType } from '../../models/BuildTask';
import { PlanSection } from '../../models/BuildSession';

export class TestingStrategyAgent extends BaseAgent {
  readonly type: AgentType = 'planner';
  readonly name = 'Testing Strategy Agent';
  readonly description = 'Plans how to verify the application works';

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
        testingApproaches: Array<{
          type: string;
          purpose: string;
          whatWeTtest: string[];
          example: string;
        }>;
        buildStrategy: {
          codeQuality: string[];
          deployment: string;
        };
        technicalDetails?: any;
      }>(response.content);

      const section: PlanSection = {
        id: 'testing',
        name: 'Build & Testing Strategy',
        status: 'completed',
        simpleExplanation: parsed.simpleExplanation,
        technicalDetails: parsed.technicalDetails,
        data: {
          testingApproaches: parsed.testingApproaches,
          buildStrategy: parsed.buildStrategy,
        },
        generatedAt: new Date(),
        dependencies: ['architecture'],
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
      console.error('[TestingStrategyAgent] Failed:', error);
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
    const architecture = context.session.artifacts?.segmentedPlan?.sectionsData?.architecture;
    
    const systemPrompt = `You are explaining testing to a beginner.
Testing is about making sure the app actually works correctly.

RULES:
1. Explain testing like checking your work (did the math correctly?)
2. Use everyday examples (testing a toaster, checking a recipe)
3. Focus on WHAT we test and WHY
4. Keep it practical and understandable
5. Return ONLY valid JSON`;

    const userPrompt = `Define the testing and build strategy:

PROJECT: ${context.project.description}
TYPE: ${context.project.type}
FEATURES: ${JSON.stringify(features?.data?.features?.slice(0, 5)?.map((f: any) => f.name), null, 2)}

Return ONLY this JSON structure:
{
  "simpleExplanation": "What testing means and why we do it (2-3 sentences)",
  "testingApproaches": [
    {
      "type": "Type of testing (e.g., 'Manual Testing', 'Automated Checks')",
      "purpose": "What this testing approach does (beginner-friendly, 1-2 sentences)",
      "whatWeTest": ["Thing 1", "Thing 2", "Thing 3"],
      "example": "Concrete example of this testing (1-2 sentences)"
    }
  ],
  "buildStrategy": {
    "codeQuality": [
      "Quality check 1",
      "Quality check 2"
    ],
    "deployment": "How the app gets deployed (beginner-friendly)"
  },
  "technicalDetails": {
    "tools": ["Testing tool or framework"]
  }
}

Example for web app:
{
  "simpleExplanation": "Testing is like proofreading your essay or double-checking your math. We verify that features work as expected, buttons do what they should, and data is saved correctly. This helps catch bugs before users see them.",
  "testingApproaches": [
    {
      "type": "Manual Testing",
      "purpose": "A real person clicks through the app to make sure everything works. This catches issues that automated tests might miss, like confusing layouts or unclear messages.",
      "whatWeTest": [
        "Can users sign up and log in successfully",
        "Does adding an expense work correctly",
        "Are expenses displayed properly",
        "Do category totals calculate correctly",
        "Does the app work on mobile and desktop"
      ],
      "example": "A tester logs in, adds several expenses, checks that they appear in the list, verifies the category totals are correct, and tries it on different screen sizes."
    },
    {
      "type": "Automated Checks",
      "purpose": "Computer programs automatically test parts of the code. These run every time code changes, catching problems immediately without manual work.",
      "whatWeTest": [
        "Functions calculate totals correctly",
        "Data validation works (rejects invalid input)",
        "Database operations save and retrieve correctly",
        "API endpoints return expected data"
      ],
      "example": "Automated tests verify that if you add three $10 expenses, the total is $30, not $31 or $29."
    },
    {
      "type": "Code Quality Checks",
      "purpose": "Tools that scan the code for common mistakes, style issues, and potential bugs. Like spell-check for code.",
      "whatWeTest": [
        "Code follows style guidelines",
        "No unused variables or functions",
        "TypeScript types are correct",
        "No obvious security issues"
      ],
      "example": "The linter catches a typo in a variable name or warns about a missing type definition."
    },
    {
      "type": "User Testing",
      "purpose": "Real users (or test users) try the app and give feedback. This reveals what's confusing or difficult to use.",
      "whatWeTest": [
        "Is the app easy to understand",
        "Can users accomplish their goals",
        "Are there any confusing parts",
        "Does it feel intuitive"
      ],
      "example": "A student tries adding their first expense and gives feedback: 'I wasn't sure which category to pick' - this helps improve the design."
    }
  ],
  "buildStrategy": {
    "codeQuality": [
      "TypeScript catches type errors before running code",
      "ESLint checks code style and common mistakes",
      "Prettier automatically formats code consistently",
      "Git commit hooks run checks before code is saved"
    ],
    "deployment": "The app is deployed automatically when changes are pushed to the main branch. Vercel (or similar platform) builds the app, runs tests, and deploys it live. If tests fail, deployment is cancelled."
  },
  "technicalDetails": {
    "tools": [
      "Jest or Vitest for unit testing",
      "React Testing Library for component testing",
      "Playwright or Cypress for end-to-end testing",
      "ESLint + Prettier for code quality",
      "GitHub Actions or Vercel for CI/CD"
    ]
  }
}

Example for mobile app:
{
  "simpleExplanation": "Testing ensures the app works correctly on different devices and doesn't crash. We test on both iOS and Android, in different screen sizes, and with different data.",
  "testingApproaches": [
    {
      "type": "Device Testing",
      "purpose": "Test on actual phones and tablets to make sure everything looks and works right on different screen sizes and operating systems.",
      "whatWeTest": ["Works on iOS and Android", "Looks good on different screen sizes", "Touch gestures work correctly", "Offline functionality works"],
      "example": "Test adding an expense on an iPhone 12, Android Samsung phone, and iPad to ensure it works on all of them."
    },
    {
      "type": "Automated Tests",
      "purpose": "Computer tests that verify functions work correctly.",
      "whatWeTest": ["Data calculations", "Storage operations", "API calls", "State management"],
      "example": "Automated test verifies that expense totals calculate correctly across different categories."
    },
    {
      "type": "Beta Testing",
      "purpose": "Give the app to real users before official launch to find bugs and get feedback.",
      "whatWeTest": ["Real-world usage patterns", "Performance on user devices", "User feedback", "Crash reports"],
      "example": "10 students use the app for a week and report any issues they encounter."
    }
  ],
  "buildStrategy": {
    "codeQuality": [
      "TypeScript for type safety",
      "ESLint for code quality",
      "React Native Testing Library for component tests"
    ],
    "deployment": "Use Expo or React Native CLI for builds. Test builds are distributed via TestFlight (iOS) or Google Play Internal Testing (Android) for beta testers."
  }
}

Define testing strategy appropriate for ${context.project.type}. Return ONLY valid JSON.`;

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
