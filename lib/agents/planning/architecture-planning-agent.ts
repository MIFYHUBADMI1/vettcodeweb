/**
 * Architecture Planning Agent
 * High-level system design (different from detailed ArchitectureAgent used later in build)
 */

import { BaseAgent } from '../base-agent';
import { BuildContext, AgentOutput, ValidationResult } from '../types';
import { AgentType } from '../../models/BuildTask';
import { PlanSection } from '../../models/BuildSession';

export class ArchitecturePlanningAgent extends BaseAgent {
  readonly type: AgentType = 'planner';
  readonly name = 'Architecture Planning Agent';
  readonly description = 'High-level system design overview';

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
        layers: Array<{
          name: string;
          purpose: string;
          responsibilities: string[];
        }>;
        dataFlow: string[];
        keyPatterns: string[];
        technicalDetails?: any;
      }>(response.content);

      const section: PlanSection = {
        id: 'architecture',
        name: 'Architecture Overview',
        status: 'completed',
        simpleExplanation: parsed.simpleExplanation,
        technicalDetails: parsed.technicalDetails,
        data: {
          layers: parsed.layers,
          dataFlow: parsed.dataFlow,
          keyPatterns: parsed.keyPatterns,
        },
        generatedAt: new Date(),
        dependencies: ['techStack', 'dataStructure'],
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
      console.error('[ArchitecturePlanningAgent] Failed:', error);
      throw error;
    }
  }

  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) return baseValidation;

    return { valid: true };
  }

  private buildPrompt(context: BuildContext): string {
    const techStack = context.session.artifacts?.segmentedPlan?.sectionsData?.techStack;
    const dataStructure = context.session.artifacts?.segmentedPlan?.sectionsData?.dataStructure;
    
    const systemPrompt = `You are explaining system architecture to a beginner.
Architecture is about how different parts of the app work together.

RULES:
1. Use simple analogies (like building blocks, layers of a cake)
2. Explain HOW data flows through the system
3. Focus on high-level organization, not implementation details
4. Make it visual and easy to understand
5. Return ONLY valid JSON`;

    const userPrompt = `Describe the high-level architecture:

PROJECT: ${context.project.description}
TYPE: ${context.project.type}
FRAMEWORK: ${techStack?.data?.framework?.name}
DATABASE: ${techStack?.data?.database?.name}

Return ONLY this JSON structure:
{
  "simpleExplanation": "What architecture means and why we organize the app this way (2-3 sentences)",
  "layers": [
    {
      "name": "Layer name (e.g., 'User Interface Layer')",
      "purpose": "What this layer does (1-2 sentences, beginner-friendly)",
      "responsibilities": ["Responsibility 1", "Responsibility 2"]
    }
  ],
  "dataFlow": [
    "Step 1: User action starts the flow",
    "Step 2: Data moves here",
    "Step 3: Result returned to user"
  ],
  "keyPatterns": [
    "Important architectural pattern 1",
    "Important architectural pattern 2"
  ],
  "technicalDetails": {
    "notes": "Optional technical details"
  }
}

Example for web app:
{
  "simpleExplanation": "Architecture is like the blueprint of your app. It shows how different parts connect and work together. We organize code into layers so each part has a clear job, making the app easier to build and maintain.",
  "layers": [
    {
      "name": "User Interface (Frontend)",
      "purpose": "What users see and interact with in their browser. This is the visual part of your app - pages, buttons, forms.",
      "responsibilities": [
        "Display pages and components",
        "Handle user clicks and inputs",
        "Show feedback and loading states",
        "Make the app look good and feel responsive"
      ]
    },
    {
      "name": "API Layer (Backend)",
      "purpose": "The middleman between the interface and the database. It processes requests, enforces rules, and keeps data secure.",
      "responsibilities": [
        "Receive requests from the frontend",
        "Validate and authenticate users",
        "Process business logic",
        "Talk to the database",
        "Send data back to the frontend"
      ]
    },
    {
      "name": "Database Layer",
      "purpose": "Where all the app's data lives permanently. It stores user accounts, expenses, and everything else that needs to be remembered.",
      "responsibilities": [
        "Store data securely",
        "Retrieve data when requested",
        "Keep data organized and connected",
        "Handle multiple requests simultaneously"
      ]
    }
  ],
  "dataFlow": [
    "User fills out 'Add Expense' form and clicks Save",
    "Frontend validates the input (amount, category, etc.)",
    "Frontend sends data to backend API endpoint",
    "Backend verifies user is logged in",
    "Backend saves expense to database",
    "Database confirms save was successful",
    "Backend sends success response to frontend",
    "Frontend shows confirmation and updates expense list"
  ],
  "keyPatterns": [
    "Separation of concerns: UI, logic, and data are separate",
    "API-first design: Frontend and backend communicate through clean API",
    "Authentication middleware: Every request checks if user is logged in",
    "Component-based UI: Reusable pieces that can be combined"
  ],
  "technicalDetails": {
    "notes": "Consider API Routes for serverless functions, React Server Components for performance, client-side caching with SWR or React Query"
  }
}

Example for mobile app:
{
  "simpleExplanation": "The app is organized into layers that handle different jobs. The interface shows what users see, the logic handles actions and rules, and storage keeps data on the phone and synced to the cloud.",
  "layers": [
    {
      "name": "User Interface Layer",
      "purpose": "The screens users see and interact with on their phone.",
      "responsibilities": ["Display screens", "Handle touches and gestures", "Show animations and feedback"]
    },
    {
      "name": "Application Logic Layer",
      "purpose": "Processes user actions and manages app state.",
      "responsibilities": ["Handle button presses", "Validate input", "Manage navigation", "Format data for display"]
    },
    {
      "name": "Local Storage Layer",
      "purpose": "Stores data on the phone for fast access and offline use.",
      "responsibilities": ["Save data locally", "Load data quickly", "Work offline"]
    },
    {
      "name": "Cloud Sync Layer",
      "purpose": "Keeps data backed up and synchronized across devices.",
      "responsibilities": ["Sync to cloud", "Handle conflicts", "Restore data"]
    }
  ],
  "dataFlow": [
    "User taps 'Add Expense' button",
    "App shows input screen",
    "User enters expense details",
    "App validates input",
    "App saves to local storage (fast, works offline)",
    "App syncs to cloud in background",
    "App updates expense list"
  ],
  "keyPatterns": [
    "Offline-first: App works without internet, syncs when connected",
    "Local-first storage: Data saved on device first for speed",
    "Background sync: Cloud sync happens silently",
    "Optimistic updates: UI updates immediately, sync happens in background"
  ]
}

Describe architecture appropriate for ${context.project.type}. Return ONLY valid JSON.`;

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
