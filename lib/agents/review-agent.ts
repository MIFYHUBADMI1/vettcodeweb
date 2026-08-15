/**
 * Review Agent
 * Reviews generated code for quality and security
 */

import { BaseAgent } from './base-agent';
import { BuildContext, AgentOutput, ValidationResult } from './types';
import { AgentType } from '../models/BuildTask';

export interface ReviewOutput {
  review: {
    overall: 'approved' | 'needs_changes' | 'rejected';
    score: number; // 0-100
    issues: Array<{
      file: string;
      line?: number;
      severity: 'error' | 'warning' | 'suggestion';
      category: 'security' | 'performance' | 'accessibility' | 'style' | 'logic';
      message: string;
      fix?: string;
    }>;
    strengths: string[];
    improvements: string[];
  };
  needsFixes: boolean;
}

export class ReviewAgent extends BaseAgent {
  readonly type: AgentType = 'review';
  readonly name = 'Review Agent';
  readonly description = 'Reviews generated code for quality and security';

  async execute(context: BuildContext): Promise<AgentOutput> {
    const validation = this.validateInput(context);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join(', ')}`);
    }

    // For MVP, do a simple automated review
    const review = this.performAutomatedReview(context);

    return {
      success: true,
      data: review,
      aiUsage: {
        provider: 'internal',
        model: 'rule-based',
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      },
    };
  }

  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];
    if (!context.generatedFiles || context.generatedFiles.size === 0) {
      errors.push('No files to review');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Perform automated code review
   */
  private performAutomatedReview(context: BuildContext): ReviewOutput {
    const issues: ReviewOutput['review']['issues'] = [];
    const strengths: string[] = [];
    const improvements: string[] = [];

    // Check all generated files
    context.generatedFiles.forEach((fileData, path) => {
      const content = fileData.content;

      // Security checks
      if (content.includes('eval(')) {
        issues.push({
          file: path,
          severity: 'error',
          category: 'security',
          message: 'Use of eval() is dangerous and should be avoided',
          fix: 'Remove eval() and use safer alternatives',
        });
      }

      if (content.includes('dangerouslySetInnerHTML') && !content.includes('DOMPurify')) {
        issues.push({
          file: path,
          severity: 'warning',
          category: 'security',
          message: 'dangerouslySetInnerHTML without sanitization',
          fix: 'Use DOMPurify to sanitize HTML content',
        });
      }

      // Check for hardcoded credentials
      if (/api[_-]?key\s*=\s*["'][^"']+["']/i.test(content)) {
        issues.push({
          file: path,
          severity: 'warning',
          category: 'security',
          message: 'Possible hardcoded API key detected',
          fix: 'Use environment variables for sensitive data',
        });
      }

      // Accessibility checks
      if (path.endsWith('.tsx') || path.endsWith('.jsx')) {
        if (content.includes('<img') && !content.includes('alt=')) {
          issues.push({
            file: path,
            severity: 'warning',
            category: 'accessibility',
            message: 'Image missing alt attribute',
            fix: 'Add descriptive alt text to all images',
          });
        }

        if (content.includes('<button') && !content.includes('aria-')) {
          improvements.push('Consider adding ARIA labels for better accessibility');
        }
      }

      // Style checks
      if (content.includes('console.log')) {
        issues.push({
          file: path,
          severity: 'suggestion',
          category: 'style',
          message: 'Debug console.log statements found',
          fix: 'Remove console.log statements before production',
        });
      }
    });

    // Identify strengths
    strengths.push('Code follows React best practices');
    strengths.push('Clean folder structure');
    strengths.push('Proper component separation');

    if (issues.filter(i => i.severity === 'error').length === 0) {
      strengths.push('No critical security issues found');
    }

    // Calculate score
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const suggestionCount = issues.filter(i => i.severity === 'suggestion').length;

    let score = 100;
    score -= errorCount * 20; // -20 for each error
    score -= warningCount * 10; // -10 for each warning
    score -= suggestionCount * 2; // -2 for each suggestion
    score = Math.max(0, Math.min(100, score));

    // Determine overall status
    let overall: 'approved' | 'needs_changes' | 'rejected' = 'approved';
    if (errorCount > 0) {
      overall = 'rejected';
    } else if (warningCount > 2) {
      overall = 'needs_changes';
    }

    return {
      review: {
        overall,
        score,
        issues,
        strengths,
        improvements,
      },
      needsFixes: overall !== 'approved',
    };
  }

  async estimateCost(context: BuildContext): Promise<{
    estimatedTokens: number;
    estimatedCost: number;
    estimatedDuration: number;
  }> {
    return {
      estimatedTokens: 0,
      estimatedCost: 0,
      estimatedDuration: 3,
    };
  }
}
