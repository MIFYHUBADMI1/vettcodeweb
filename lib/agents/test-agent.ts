/**
 * Test Agent
 * Generates test files (optional, if enabled)
 */

import { BaseAgent } from './base-agent';
import { BuildContext, AgentOutput, ValidationResult } from './types';
import { AgentType } from '../models/BuildTask';

export interface TestOutput {
  testFiles: Array<{
    path: string;
    content: string;
    testsCount: number;
    coverage: string[];
  }>;
  testConfig?: {
    path: string;
    content: string;
  };
}

export class TestAgent extends BaseAgent {
  readonly type: AgentType = 'test';
  readonly name = 'Test Agent';
  readonly description = 'Generates test files';

  async execute(context: BuildContext): Promise<AgentOutput> {
    const validation = this.validateInput(context);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join(', ')}`);
    }

    // For MVP, skip test generation
    // In full implementation, would generate Jest/Vitest tests

    return {
      success: true,
      data: {
        testFiles: [],
        message: 'Test generation skipped (feature not fully implemented yet)',
      },
      warnings: ['Test generation is optional and not yet implemented'],
      aiUsage: {
        provider: 'internal',
        model: 'skipped',
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      },
    };
  }

  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) return baseValidation;

    return { valid: true };
  }

  async estimateCost(context: BuildContext): Promise<{
    estimatedTokens: number;
    estimatedCost: number;
    estimatedDuration: number;
  }> {
    return {
      estimatedTokens: 0,
      estimatedCost: 0,
      estimatedDuration: 1,
    };
  }
}
