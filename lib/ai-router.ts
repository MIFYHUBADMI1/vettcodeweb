/**
 * AI Router
 * 
 * Intelligently routes AI requests based on:
 * - User's subscription plan
 * - Provider availability
 * - Cost optimization
 * - Fallback strategy
 */

import { Finding, Explanation } from './types'
import { SubscriptionPlan } from './subscription'
import { AIProviderRegistry, AIProvider } from './ai-providers'
import { getTemplate, getTemplateByContext } from './templates'
import { trackAIUsage } from './usage-tracking'
import { AIModel } from './model-registry'

export interface AIRouterOptions {
  userId: string
  plan: SubscriptionPlan
  feature: string
  requestId?: string // Optional correlation ID for logging
}

export interface AIRouterResult {
  explanation: Explanation
  source: 'template' | 'ai'
  provider?: string
  model?: string
  duration: number
  tokensUsed?: number
  estimatedCost?: number
}

export class AIRouter {
  private registry: AIProviderRegistry
  private cache: Map<string, Explanation>

  constructor() {
    this.registry = new AIProviderRegistry()
    this.cache = new Map()
  }

  /**
   * Main routing function
   * Priority: Cache → Template → AI (best available)
   */
  async generateExplanation(
    finding: Finding,
    options: AIRouterOptions
  ): Promise<AIRouterResult> {
    const startTime = Date.now()

    // 1. Check cache first
    const cacheKey = this.getCacheKey(finding)
    if (this.cache.has(cacheKey)) {
      return {
        explanation: this.addConfidenceNote(this.cache.get(cacheKey)!, finding.confidence),
        source: 'template',
        duration: Date.now() - startTime,
      }
    }

    // 2. Try template match (instant, free)
    const templateExplanation = this.getTemplateExplanation(finding)
    if (templateExplanation) {
      const explanation = this.addConfidenceNote(templateExplanation, finding.confidence)
      this.cache.set(cacheKey, explanation)
      
      return {
        explanation,
        source: 'template',
        duration: Date.now() - startTime,
      }
    }

    // 3. Try AI (based on plan)
    try {
      const aiResult = await this.routeToAI(finding, options)
      
      // Cache successful AI result
      this.cache.set(cacheKey, aiResult.explanation)
      
      return {
        ...aiResult,
        explanation: this.addConfidenceNote(aiResult.explanation, finding.confidence),
        duration: Date.now() - startTime,
      }
    } catch (error) {
      console.error('AI routing failed:', error)
      
      // 4. Fallback to generic explanation
      const fallbackExplanation = this.getGenericExplanation(finding)
      return {
        explanation: this.addConfidenceNote(fallbackExplanation, finding.confidence),
        source: 'template',
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Route to best available AI provider
   */
  private async routeToAI(
    finding: Finding,
    options: AIRouterOptions
  ): Promise<Omit<AIRouterResult, 'duration'>> {
    const { plan } = options

    // Get allowed providers for this plan
    const availableProviders = this.getAvailableProviders(plan)

    if (availableProviders.length === 0) {
      throw new Error('No AI providers available')
    }

    // Try providers in priority order
    let lastError: Error | null = null

    for (const { provider, model } of availableProviders) {
      try {
        const explanation = await provider.generateExplanation(
          finding,
          model,
          plan.maxTokensPerRequest
        )

        // Estimate cost and track usage
        const inputTokens = this.estimateInputTokens(finding)
        const outputTokens = this.estimateOutputTokens(explanation)
        const estimatedCost = provider.estimateCost(inputTokens, outputTokens, model)

        // Track usage
        await trackAIUsage({
          userId: options.userId,
          plan: plan.id,
          provider: provider.name,
          model,
          feature: options.feature,
          inputTokens,
          outputTokens,
          estimatedCost,
        })

        return {
          explanation,
          source: 'ai',
          provider: provider.name,
          model,
          tokensUsed: inputTokens + outputTokens,
          estimatedCost,
        }
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error)
        lastError = error as Error
        // Continue to next provider (fallback)
      }
    }

    // All providers failed
    throw lastError || new Error('All AI providers failed')
  }

  /**
   * Get available providers sorted by priority
   * NEW: Uses Model Registry for intelligent selection
   */
  private getAvailableProviders(
    plan: SubscriptionPlan
  ): Array<{ provider: AIProvider; model: string }> {
    // Dynamic import for model registry
    const modelRegistry = require('./model-registry')
    const { getModelsForPlan, findBestModel } = modelRegistry
    
    // Get all models allowed for this plan (by tier)
    const allowedModels = getModelsForPlan(plan.allowedModelTiers)
    
    if (allowedModels.length === 0) {
      console.warn('[AI-ROUTER] No models available for plan:', plan.id)
      return []
    }
    
    // Find best model for 'explanation' capability
    // (This is the primary capability for finding explanations)
    const bestModel = findBestModel(allowedModels, 'explanation', plan.priority >= 3)
    
    if (!bestModel) {
      console.warn('[AI-ROUTER] No model found with explanation capability')
      return []
    }
    
    const result: Array<{ provider: AIProvider; model: string; priority: number }> = []
    
    // Add primary model (best for this plan)
    const primaryProvider = this.registry.getProvider(bestModel.provider)
    if (primaryProvider) {
      result.push({
        provider: primaryProvider,
        model: bestModel.id,
        priority: 100, // Highest priority
      })
    }
    
    // Add fallback models (other capable models from allowed tiers)
    const fallbackModels = allowedModels
      .filter((m: any) => m.id !== bestModel.id && m.capabilities.includes('explanation'))
      .sort((a: any, b: any) => {
        // Sort by tier (descending) then cost (ascending)
        if (b.tier !== a.tier) return b.tier - a.tier
        const aCost = a.costPerInputToken + a.costPerOutputToken
        const bCost = b.costPerInputToken + b.costPerOutputToken
        return aCost - bCost
      })
      .slice(0, 3) // Max 3 fallbacks
    
    fallbackModels.forEach((model: any, index: number) => {
      const provider = this.registry.getProvider(model.provider)
      if (provider) {
        result.push({
          provider,
          model: model.id,
          priority: 50 - index, // Decreasing priority
        })
      }
    })
    
    // Sort by priority (highest first)
    result.sort((a, b) => b.priority - a.priority)
    
    return result.map(({ provider, model }) => ({ provider, model }))
  }

  /**
   * Get template explanation (fast, offline)
   */
  private getTemplateExplanation(finding: Finding): Explanation | null {
    const ruleId = (finding.metadata.ruleId || finding.title).toLowerCase()

    // Try exact template match
    let template = getTemplate(ruleId)
    if (template) return { ...template }

    // Try context-based match
    template = getTemplateByContext(ruleId, finding.message, finding.category)
    if (template) return { ...template }

    return null
  }

  /**
   * Generic fallback explanation
   */
  private getGenericExplanation(finding: Finding): Explanation {
    const categoryExplanations: Record<string, Explanation> = {
      CODE: {
        title: 'Code Security Issue',
        whatsWrong:
          finding.message || 'A potential vulnerability was detected in your code.',
        whyItMatters:
          'Code vulnerabilities can allow attackers to exploit your application, steal data, or compromise user security.',
        howToFix:
          'Review the code carefully. Look for user input handling, database queries, or authentication logic. Follow secure coding practices.',
        whatYouLearn:
          'Secure coding means thinking about how an attacker might abuse your code. Always validate input and escape output.',
      },
      SECRET: {
        title: 'Exposed Secret',
        whatsWrong: 'A credential, API key, password, or token is exposed in your code.',
        whyItMatters:
          'If this code is in version control or shared, the secret is compromised. Attackers can use it to access your services.',
        howToFix:
          'Immediately revoke/rotate this credential. Remove it from all files and git history. Use environment variables or a secrets manager.',
        whatYouLearn:
          'Secrets in code are like leaving your keys in the door. Always use environment variables or secure vaults.',
      },
      DEPENDENCY: {
        title: 'Vulnerable Dependency',
        whatsWrong: 'One of your project dependencies has a known security vulnerability.',
        whyItMatters:
          'Even if your code is secure, vulnerabilities in dependencies can compromise your entire application.',
        howToFix:
          'Update the vulnerable package to a patched version. Check the package documentation for update instructions.',
        whatYouLearn:
          'Your app is only as secure as its weakest dependency. Keep packages updated and monitor for vulnerabilities.',
      },
      CONFIG: {
        title: 'Security Misconfiguration',
        whatsWrong:
          finding.message || 'A configuration setting may expose your application to security risks.',
        whyItMatters:
          'Misconfigurations can disable security features, expose sensitive data, or allow unauthorized access.',
        howToFix:
          'Review the configuration and ensure it follows security best practices. Enable security headers and proper access controls.',
        whatYouLearn:
          'Default configurations are rarely secure. Always review and harden your security settings.',
      },
    }

    return (
      categoryExplanations[finding.category] || {
        title: 'Security Issue',
        whatsWrong: finding.message,
        whyItMatters: 'This could be exploited by attackers.',
        howToFix: 'Review and fix the issue following security best practices.',
        whatYouLearn: 'Security requires constant vigilance and learning.',
      }
    )
  }

  /**
   * Add confidence-aware note to explanation
   */
  private addConfidenceNote(explanation: Explanation, confidence?: number): Explanation {
    if (confidence === undefined) return explanation

    let note: string | undefined

    if (confidence < 0.6) {
      note = '⚠️ This might be a false positive, but it\'s worth checking to be safe.'
    } else if (confidence >= 0.85) {
      note = '🎯 This issue is very likely real and should be fixed as soon as possible.'
    }

    return {
      ...explanation,
      confidenceNote: note,
    }
  }

  /**
   * Generate cache key for deduplication
   */
  private getCacheKey(finding: Finding): string {
    const ruleId = finding.metadata.ruleId || finding.title
    return `${ruleId}:${finding.category}`.toLowerCase()
  }

  /**
   * Estimate input tokens (rough approximation)
   */
  private estimateInputTokens(finding: Finding): number {
    const text = `${finding.title} ${finding.message} ${finding.file}`
    return Math.ceil(text.length / 4) + 300 // +300 for system prompt
  }

  /**
   * Estimate output tokens (rough approximation)
   */
  private estimateOutputTokens(explanation: Explanation): number {
    const text = Object.values(explanation).join(' ')
    return Math.ceil(text.length / 4)
  }

  /**
   * Clear cache (for testing/admin)
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Generate chat response (conversational)
   */
  async generateChat(
    messages: Array<{ role: string; content: string }>,
    options: AIRouterOptions
  ): Promise<AIRouterResult & { message: string }> {
    const startTime = Date.now()
    const { plan, requestId = 'unknown' } = options
    
    console.log(`[AI-ROUTER][${requestId}] generateChat called for user:`, options.userId)
    console.log(`[AI-ROUTER][${requestId}] Feature:`, options.feature, 'Plan:', plan.id)

    // Get available providers
    const availableProviders = this.getAvailableProviders(plan)
    
    console.log(`[AI-ROUTER][${requestId}] Available providers:`, availableProviders.length)
    availableProviders.forEach(({ provider, model }) => {
      console.log(`[AI-ROUTER][${requestId}]   -`, provider.name, '/', model)
    })

    if (availableProviders.length === 0) {
      console.error(`[AI-ROUTER][${requestId}] No AI providers available!`)
      throw new Error('No AI providers available')
    }

    // Try providers in priority order
    let lastError: Error | null = null
    let attempt = 0

    for (const { provider, model } of availableProviders) {
      attempt++
      try {
        console.log(`[AI-ROUTER][${requestId}] Attempt ${attempt}: Trying provider:`, provider.name, 'with model:', model)
        const message = await provider.generateChat(messages, model, plan.maxTokensPerRequest)

        console.log(`[AI-ROUTER][${requestId}] Success! Response received from`, provider.name)
        console.log(`[AI-ROUTER][${requestId}] Response length:`, message.length, 'characters')

        // Estimate cost and track usage
        const inputTokens = this.estimateChatInputTokens(messages)
        const outputTokens = this.estimateChatOutputTokens(message)
        const estimatedCost = provider.estimateCost(inputTokens, outputTokens, model)

        console.log(`[AI-ROUTER][${requestId}] Tokens - Input:`, inputTokens, 'Output:', outputTokens, 'Cost: $' + estimatedCost.toFixed(6))

        // Track usage
        await trackAIUsage({
          userId: options.userId,
          plan: plan.id,
          provider: provider.name,
          model,
          feature: options.feature,
          inputTokens,
          outputTokens,
          estimatedCost,
        })

        return {
          message,
          explanation: {} as Explanation, // Not used for chat
          source: 'ai',
          provider: provider.name,
          model,
          duration: Date.now() - startTime,
          tokensUsed: inputTokens + outputTokens,
          estimatedCost,
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`[AI-ROUTER][${requestId}] Attempt ${attempt} - Provider ${provider.name} chat failed:`, errorMessage)
        
        // Classify error type
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
          console.log(`[AI-ROUTER][${requestId}] RATE_LIMITED - Moving to next provider`)
        } else if (errorMessage.includes('AI_PROVIDER_INVALID_RESPONSE')) {
          console.log(`[AI-ROUTER][${requestId}] INVALID_RESPONSE - Moving to next provider`)
        } else if (errorMessage.includes('404') || errorMessage.toLowerCase().includes('not found')) {
          console.log(`[AI-ROUTER][${requestId}] MODEL_UNAVAILABLE - Moving to next provider`)
        } else {
          console.log(`[AI-ROUTER][${requestId}] PROVIDER_ERROR - Moving to next provider`)
        }
        
        lastError = error as Error
        // Continue to next provider (no retry on same model)
      }
    }

    // All providers failed
    console.error(`[AI-ROUTER][${requestId}] All ${attempt} provider attempts failed!`)
    throw lastError || new Error('All AI providers failed')
  }

  /**
   * Estimate chat input tokens
   */
  private estimateChatInputTokens(messages: Array<{ role: string; content: string }>): number {
    const totalText = messages.map((m) => m.content).join(' ')
    return Math.ceil(totalText.length / 4)
  }

  /**
   * Estimate chat output tokens
   */
  private estimateChatOutputTokens(message: string): number {
    return Math.ceil(message.length / 4)
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; providers: string[] } {
    return {
      size: this.cache.size,
      providers: this.registry.getAvailableProviders().map((p) => p.name),
    }
  }
}
