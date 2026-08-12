/**
 * AI Provider Implementations
 * OpenRouter + Groq with fallback support
 */

import { Explanation, Finding } from './types'
import { SubscriptionPlan } from './subscription'

export interface AIProvider {
  name: string
  generateExplanation(
    finding: Finding,
    model: string,
    maxTokens: number
  ): Promise<Explanation>
  generateChat(
    messages: Array<{ role: string; content: string }>,
    model: string,
    maxTokens: number
  ): Promise<string>
  isAvailable(): boolean
  estimateCost(inputTokens: number, outputTokens: number, model: string): number
}

/**
 * OpenRouter Provider
 * Supports multiple models including free ones
 */
export class OpenRouterProvider implements AIProvider {
  name = 'openrouter'
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ''
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async generateExplanation(
    finding: Finding,
    model: string,
    maxTokens: number
  ): Promise<Explanation> {
    const prompt = this.buildPrompt(finding)

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://vettcode.dev',
        'X-Title': 'VettCode Security Analysis',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a security mentor for beginner developers. Explain security issues in simple, encouraging terms. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    return this.parseResponse(content)
  }

  async generateChat(
    messages: Array<{ role: string; content: string }>,
    model: string,
    maxTokens: number
  ): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://vettcode.dev',
        'X-Title': 'VettCode AI Coach',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private buildPrompt(finding: Finding): string {
    return `Explain this security issue for a beginner developer with NO security background:

Type: ${finding.metadata.ruleId || finding.title}
File: ${finding.file}:${finding.line}
Severity: ${finding.severity}
Category: ${finding.category}
Description: ${finding.message}

Return ONLY valid JSON with these exact fields:
{
  "title": "Short, clear title (max 100 chars)",
  "whatsWrong": "What the problem is in simple terms (max 200 words)",
  "whyItMatters": "Real-world impact and dangers (max 200 words)",
  "howToFix": "Step-by-step fix instructions (max 200 words)",
  "whatYouLearn": "Key security lesson to remember (max 100 words)",
  "fixExample": "Before/after code example (optional, max 400 chars)"
}

Rules:
1. Use simple language (10th grade reading level)
2. Be encouraging, not scary
3. Focus on learning, not just fixing
4. Keep it concise
5. Return ONLY valid JSON, no markdown or explanations`
  }

  private parseResponse(content: string): Explanation {
    try {
      // Remove markdown code blocks if present
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(cleaned)

      // Validate required fields
      if (
        !parsed.title ||
        !parsed.whatsWrong ||
        !parsed.whyItMatters ||
        !parsed.howToFix ||
        !parsed.whatYouLearn
      ) {
        throw new Error('Missing required fields in AI response')
      }

      return {
        title: parsed.title,
        whatsWrong: parsed.whatsWrong,
        whyItMatters: parsed.whyItMatters,
        howToFix: parsed.howToFix,
        whatYouLearn: parsed.whatYouLearn,
        fixExample: parsed.fixExample,
      }
    } catch (error) {
      console.error('Failed to parse OpenRouter response:', error)
      throw new Error('Invalid AI response format')
    }
  }

  estimateCost(inputTokens: number, outputTokens: number, model: string): number {
    // Rough estimates (OpenRouter pricing varies by model)
    const pricing: Record<string, { input: number; output: number }> = {
      'google/gemma-2-9b-it:free': { input: 0, output: 0 },
      'meta-llama/llama-3-8b-instruct:free': { input: 0, output: 0 },
      'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 }, // per 1M tokens
      'anthropic/claude-3.5-sonnet': { input: 3.0, output: 15.0 },
      'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
      'openai/gpt-4o': { input: 5.0, output: 15.0 },
    }

    const rates = pricing[model] || { input: 1.0, output: 3.0 }
    return (inputTokens * rates.input + outputTokens * rates.output) / 1000000
  }
}

/**
 * Groq Provider (Ultra-fast inference)
 */
export class GroqProvider implements AIProvider {
  name = 'groq'
  private apiKey: string
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions'

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || ''
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async generateExplanation(
    finding: Finding,
    model: string,
    maxTokens: number
  ): Promise<Explanation> {
    const prompt = this.buildPrompt(finding)

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a security mentor for beginner developers. Explain security issues in simple, encouraging terms. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Groq error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    return this.parseResponse(content)
  }

  async generateChat(
    messages: Array<{ role: string; content: string }>,
    model: string,
    maxTokens: number
  ): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Groq error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private buildPrompt(finding: Finding): string {
    // Same prompt as OpenRouter for consistency
    return `Explain this security issue for a beginner developer with NO security background:

Type: ${finding.metadata.ruleId || finding.title}
File: ${finding.file}:${finding.line}
Severity: ${finding.severity}
Category: ${finding.category}
Description: ${finding.message}

Return ONLY valid JSON with these exact fields:
{
  "title": "Short, clear title (max 100 chars)",
  "whatsWrong": "What the problem is in simple terms (max 200 words)",
  "whyItMatters": "Real-world impact and dangers (max 200 words)",
  "howToFix": "Step-by-step fix instructions (max 200 words)",
  "whatYouLearn": "Key security lesson to remember (max 100 words)",
  "fixExample": "Before/after code example (optional, max 400 chars)"
}

Rules:
1. Use simple language (10th grade reading level)
2. Be encouraging, not scary
3. Focus on learning
4. Keep it concise
5. Return ONLY valid JSON`
  }

  private parseResponse(content: string): Explanation {
    try {
      // Groq might wrap in markdown
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(cleaned)

      if (
        !parsed.title ||
        !parsed.whatsWrong ||
        !parsed.whyItMatters ||
        !parsed.howToFix ||
        !parsed.whatYouLearn
      ) {
        throw new Error('Missing required fields')
      } 

      return {
        title: parsed.title,
        whatsWrong: parsed.whatsWrong,
        whyItMatters: parsed.whyItMatters,
        howToFix: parsed.howToFix,
        whatYouLearn: parsed.whatYouLearn,
        fixExample: parsed.fixExample,
      }
    } catch (error) {
      console.error('Failed to parse Groq response:', error)
      throw new Error('Invalid AI response format')
    }
  }

  estimateCost(inputTokens: number, outputTokens: number, model: string): number {
    // Groq pricing (per 1M tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'llama-3.1-70b-versatile': { input: 0.59, output: 0.79 },
      'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
      'mixtral-8x7b-32768': { input: 0.24, output: 0.24 },
      'gemma2-9b-it': { input: 0.20, output: 0.20 },
    }

    const rates = pricing[model] || { input: 0.50, output: 0.70 }
    return (inputTokens * rates.input + outputTokens * rates.output) / 1000000
  }
}

/**
 * Provider Registry
 */
export class AIProviderRegistry {
  private providers: Map<string, AIProvider>

  constructor() {
    this.providers = new Map()
    this.registerProviders()
  }

  private registerProviders() {
    const openrouter = new OpenRouterProvider()
    const groq = new GroqProvider()

    if (openrouter.isAvailable()) {
      this.providers.set('openrouter', openrouter)
    }

    if (groq.isAvailable()) {
      this.providers.set('groq', groq)
    }
  }

  getProvider(name: string): AIProvider | null {
    return this.providers.get(name) || null
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.values())
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name)
  }
}
