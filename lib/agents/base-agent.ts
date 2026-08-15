/**
 * Base Agent
 * Abstract base class that all agents extend
 */

import { AIRouter } from '../ai-router';
import { AgentType } from '../models/BuildTask';
import {
  IBuildAgent,
  BuildContext,
  AgentOutput,
  ValidationResult,
  CostEstimate,
} from './types';

export abstract class BaseAgent implements IBuildAgent {
  abstract readonly type: AgentType;
  abstract readonly name: string;
  abstract readonly description: string;

  constructor(protected aiRouter: AIRouter) {}

  /**
   * Execute agent task (must be implemented by subclass)
   */
  abstract execute(context: BuildContext): Promise<AgentOutput>;

  /**
   * Validate input context (can be overridden)
   */
  validateInput(context: BuildContext): ValidationResult {
    const errors: string[] = [];

    if (!context.session) {
      errors.push('Build session is required');
    }

    if (!context.project) {
      errors.push('Project is required');
    }

    if (!context.user) {
      errors.push('User is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Validate output (can be overridden)
   */
  validateOutput(output: AgentOutput): ValidationResult {
    const errors: string[] = [];

    if (!output.data) {
      errors.push('Agent output data is required');
    }

    if (!output.aiUsage) {
      errors.push('AI usage tracking is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Estimate cost (can be overridden)
   */
  async estimateCost(context: BuildContext): Promise<CostEstimate> {
    // Default estimation
    return {
      estimatedTokens: 2000, // ~2K tokens
      estimatedCost: 0.002,  // ~$0.002
      estimatedDuration: 10, // ~10 seconds
    };
  }

  /**
   * Call AI with proper error handling and usage tracking
   */
  protected async callAI(
    userId: string,
    feature: string,
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      responseFormat?: 'json' | 'text';
    }
  ): Promise<{
    content: string;
    provider: string;
    model: string;
    usage: {
      inputTokens: number;
      outputTokens: number;
      cost: number;
    };
  }> {
    try {
      // Get user plan
      const { getUserPlan } = await import('../subscription');
      const plan = await getUserPlan(userId);
      
      const response = await this.aiRouter.generateChat(
        [{ role: 'user', content: prompt }],
        {
          userId,
          feature,
          plan,
          requestId: `${feature}-${Date.now()}`,
        }
      );

      // AIRouter returns:
      // - message (not content)
      // - tokensUsed (total)
      // - estimatedCost
      // We need to estimate input/output split
      const totalTokens = response.tokensUsed || 0;
      const outputTokens = Math.ceil(response.message.length / 4);
      const inputTokens = totalTokens - outputTokens;

      return {
        content: response.message, // AIRouter uses 'message', not 'content'
        provider: response.provider,
        model: response.model,
        usage: {
          inputTokens: Math.max(0, inputTokens),
          outputTokens,
          cost: response.estimatedCost,
        },
      };
    } catch (error) {
      console.error(`[${this.type}] AI call failed:`, error);
      throw new Error(
        `AI call failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse JSON response from AI with multiple fallback strategies
   */
  protected parseJSONResponse<T>(content: string): T {
    console.log(`[${this.type}] ========== JSON PARSING START ==========`);
    console.log(`[${this.type}] Response length: ${content.length} chars`);
    console.log(`[${this.type}] First 300 chars:`, content.substring(0, 300));
    console.log(`[${this.type}] Last 300 chars:`, content.substring(Math.max(0, content.length - 300)));
    
    // Strategy 1: Look for JSON in markdown code blocks
    const codeBlockPatterns = [
      { name: '```json block', regex: /```json\s*([\s\S]*?)```/i },
      { name: '```javascript block', regex: /```(?:javascript|js)\s*([\s\S]*?)```/i },
      { name: '``` generic block', regex: /```\s*([\s\S]*?)```/ },
    ];

    for (const { name, regex } of codeBlockPatterns) {
      const match = content.match(regex);
      if (match && match[1]) {
        try {
          const jsonStr = match[1].trim();
          console.log(`[${this.type}] Strategy 1: Found ${name}, trying to parse...`);
          const parsed = JSON.parse(jsonStr);
          console.log(`[${this.type}] ✅ SUCCESS via ${name}`);
          return parsed;
        } catch (error) {
          console.warn(`[${this.type}] ❌ Failed ${name}:`, error instanceof Error ? error.message : 'Unknown');
        }
      }
    }

    // Strategy 2: Find FIRST opening brace and LAST closing brace
    // This handles cases where there's text before/after JSON
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const potentialJSON = content.substring(firstBrace, lastBrace + 1);
      try {
        console.log(`[${this.type}] Strategy 2: Trying first-to-last brace extraction (${potentialJSON.length} chars)...`);
        const parsed = JSON.parse(potentialJSON);
        console.log(`[${this.type}] ✅ SUCCESS via brace extraction`);
        return parsed;
      } catch (error) {
        console.warn(`[${this.type}] ❌ Failed brace extraction:`, error instanceof Error ? error.message : 'Unknown');
        
        // If JSON is incomplete, try to fix common issues
        if (error instanceof SyntaxError) {
          const fixed = this.attemptJSONRepair(potentialJSON);
          if (fixed) {
            try {
              const parsed = JSON.parse(fixed);
              console.log(`[${this.type}] ✅ SUCCESS via JSON repair`);
              return parsed;
            } catch {
              console.warn(`[${this.type}] ❌ JSON repair failed`);
            }
          }
        }
      }
    }

    // Strategy 3: Try to parse entire content (clean JSON response)
    try {
      console.log(`[${this.type}] Strategy 3: Trying to parse entire content as JSON...`);
      const parsed = JSON.parse(content.trim());
      console.log(`[${this.type}] ✅ SUCCESS parsing entire content`);
      return parsed;
    } catch (error) {
      console.warn(`[${this.type}] ❌ Failed entire content:`, error instanceof Error ? error.message : 'Unknown');
    }

    // All strategies failed
    console.error(`[${this.type}] ========== ALL PARSING STRATEGIES FAILED ==========`);
    console.error(`[${this.type}] Full response (first 2000 chars):`);
    console.error(content.substring(0, 2000));
    console.error(`[${this.type}] ========================================`);
    
    throw new Error(
      `Failed to parse JSON response from AI. The response may be incomplete, malformed, or truncated. ` +
      `Response length: ${content.length} chars. ` +
      `Check logs for full response content.`
    );
  }

  /**
   * Attempt to repair truncated/malformed JSON
   */
  private attemptJSONRepair(json: string): string | null {
    try {
      // Check if JSON is truncated (ends mid-string, mid-array, or mid-object)
      const trimmed = json.trim();
      
      // Count braces and brackets
      const openBraces = (trimmed.match(/\{/g) || []).length;
      const closeBraces = (trimmed.match(/\}/g) || []).length;
      const openBrackets = (trimmed.match(/\[/g) || []).length;
      const closeBrackets = (trimmed.match(/\]/g) || []).length;
      
      console.log(`[${this.type}] JSON structure: {${openBraces}/${closeBraces} [${openBrackets}/${closeBrackets}`);
      
      let repaired = trimmed;
      
      // Count quotes to detect unterminated strings
      let quoteCount = 0;
      let lastQuotePos = -1;
      let inEscape = false;
      
      for (let i = 0; i < repaired.length; i++) {
        if (repaired[i] === '\\' && !inEscape) {
          inEscape = true;
          continue;
        }
        if (repaired[i] === '"' && !inEscape) {
          quoteCount++;
          lastQuotePos = i;
        }
        inEscape = false;
      }
      
      // If odd number of quotes, we have an unterminated string
      if (quoteCount % 2 === 1) {
        console.log(`[${this.type}] Detected unterminated string at position ${lastQuotePos}`);
        
        // Find what comes after the last quote
        const afterLastQuote = repaired.substring(lastQuotePos + 1);
        
        // Check if it's a property name (followed by colon) or a value
        const colonIndex = afterLastQuote.indexOf(':');
        const hasValidTerminator = /^[^"]*?[",:}\]]/.test(afterLastQuote);
        
        if (!hasValidTerminator) {
          // Truncated in the middle of a string value, close it
          console.log(`[${this.type}] Closing unterminated string`);
          repaired = repaired.substring(0, lastQuotePos + 1) + 
                     afterLastQuote.replace(/[^a-zA-Z0-9\s\-_.,!?']/g, '') + 
                     '"';
          
          // If this was in an array or object, need to check for proper closure
          const afterClosedQuote = repaired.substring(lastQuotePos + 1);
          if (!afterClosedQuote.match(/[,}\]]/)) {
            // Need to add proper separator/closure
            const inArray = openBrackets > closeBrackets;
            const inObject = openBraces > closeBraces;
            
            if (inArray || inObject) {
              // Don't add comma, will be handled by bracket/brace closure
            }
          }
        }
      }
      
      // Remove incomplete last element if ends with comma
      if (repaired.endsWith(',')) {
        repaired = repaired.slice(0, -1);
      }
      
      // Remove trailing incomplete content after last valid structure character
      const lastStructureChar = Math.max(
        repaired.lastIndexOf('}'),
        repaired.lastIndexOf(']'),
        repaired.lastIndexOf('"')
      );
      
      if (lastStructureChar > 0) {
        const afterStructure = repaired.substring(lastStructureChar + 1).trim();
        // If there's incomplete content after (not just whitespace or valid separators)
        if (afterStructure && !afterStructure.match(/^[,\s]*$/)) {
          console.log(`[${this.type}] Removing incomplete trailing content`);
          repaired = repaired.substring(0, lastStructureChar + 1);
        }
      }
      
      // Close open arrays
      for (let i = 0; i < (openBrackets - closeBrackets); i++) {
        repaired += ']';
      }
      
      // Close open objects
      for (let i = 0; i < (openBraces - closeBraces); i++) {
        repaired += '}';
      }
      
      console.log(`[${this.type}] Repaired JSON (last 200 chars):`, repaired.substring(Math.max(0, repaired.length - 200)));
      
      return repaired;
    } catch (error) {
      console.error(`[${this.type}] JSON repair error:`, error);
      return null;
    }
  }

  /**
   * Build prompt with common structure
   */
  protected buildPrompt(
    systemPrompt: string,
    userPrompt: string,
    context?: Record<string, any>
  ): string {
    let prompt = `${systemPrompt}\n\n`;

    if (context) {
      prompt += `CONTEXT:\n${JSON.stringify(context, null, 2)}\n\n`;
    }

    prompt += `REQUEST:\n${userPrompt}\n\n`;
    prompt += `Respond with valid JSON only. No explanations outside the JSON.`;

    return prompt;
  }
}
