/**
 * AI Model Registry
 * 
 * Central definition of all available AI models with their capabilities
 * This allows adding/removing models without rewriting application logic
 */

export type ModelTier = 1 | 2 | 3 | 4

export type ModelCapability = 
  | 'explanation'           // Simple security explanations
  | 'code_analysis'         // Analyze code context
  | 'fix_generation'        // Generate code fixes
  | 'reasoning'             // Complex reasoning
  | 'security'              // Security-specific knowledge
  | 'multi_file'            // Multi-file understanding
  | 'mentor'                // AI security mentor

export type CostClass = 'free' | 'low' | 'medium' | 'high'

export interface AIModel {
  id: string
  name: string
  provider: 'openrouter' | 'groq'
  tier: ModelTier
  capabilities: ModelCapability[]
  costClass: CostClass
  
  // Technical details
  maxTokens: number
  contextWindow: number
  
  // Routing hints
  latency: 'fast' | 'medium' | 'slow'
  reliability: 'high' | 'medium' | 'low'
  
  // Cost (per 1M tokens)
  costPerInputToken: number
  costPerOutputToken: number
  
  // Availability
  enabled: boolean
}

/**
 * Model Registry
 * 
 * Tier 1 (Basic): Free models for simple explanations
 * Tier 2 (Developer): Paid models for code analysis
 * Tier 3 (Advanced): Strong models for complex reasoning
 * Tier 4 (Premium): Best models for deep analysis
 */
export const MODEL_REGISTRY: AIModel[] = [
  // ============================================================================
  // TIER 1: BASIC (Free models - VettCode branded)
  // ============================================================================
  
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    name: 'VettCode Ultra',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['explanation', 'code_analysis', 'reasoning', 'security'],
    costClass: 'free',
    maxTokens: 8192,
    contextWindow: 131072,
    latency: 'medium',
    reliability: 'high',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'VettCode Pro',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['explanation', 'code_analysis', 'reasoning'],
    costClass: 'free',
    maxTokens: 8192,
    contextWindow: 131072,
    latency: 'fast',
    reliability: 'high',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'VettCode Standard',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['explanation', 'code_analysis'],
    costClass: 'free',
    maxTokens: 8192,
    contextWindow: 131072,
    latency: 'fast',
    reliability: 'high',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  {
    id: 'nvidia/nemotron-3-super-120b-a12b:free',
    name: 'VettCode Power',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['explanation', 'code_analysis', 'reasoning'],
    costClass: 'free',
    maxTokens: 8192,
    contextWindow: 65536,
    latency: 'medium',
    reliability: 'high',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  {
    id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    name: 'VettCode Reasoner',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['explanation', 'reasoning', 'security'],
    costClass: 'free',
    maxTokens: 4096,
    contextWindow: 32768,
    latency: 'fast',
    reliability: 'high',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  {
    id: 'nvidia/nemotron-3-nano-30b-a3b:free',
    name: 'VettCode Nano',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['explanation', 'code_analysis'],
    costClass: 'free',
    maxTokens: 4096,
    contextWindow: 32768,
    latency: 'fast',
    reliability: 'high',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'VettCode Lightning',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['explanation'],
    costClass: 'free',
    maxTokens: 4096,
    contextWindow: 32768,
    latency: 'fast',
    reliability: 'high',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  {
    id: 'nvidia/nemotron-3.5-content-safety:free',
    name: 'VettCode Safety Guard',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['security'],
    costClass: 'free',
    maxTokens: 4096,
    contextWindow: 16384,
    latency: 'fast',
    reliability: 'high',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  {
    id: 'cohere/north-mini-code:free',
    name: 'VettCode Mentor',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['code_analysis', 'fix_generation'],
    costClass: 'free',
    maxTokens: 4096,
    contextWindow: 16384,
    latency: 'fast',
    reliability: 'medium',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'VettCode Classic',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['explanation', 'reasoning'],
    costClass: 'free',
    maxTokens: 4096,
    contextWindow: 8192,
    latency: 'medium',
    reliability: 'medium',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  {
    id: 'poolside/laguna-s-2.1:free',
    name: 'VettCode Compact',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['explanation', 'code_analysis'],
    costClass: 'free',
    maxTokens: 2048,
    contextWindow: 8192,
    latency: 'fast',
    reliability: 'medium',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  {
    id: 'poolside/laguna-xs-2.1:free',
    name: 'VettCode Mini',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['explanation'],
    costClass: 'free',
    maxTokens: 2048,
    contextWindow: 8192,
    latency: 'fast',
    reliability: 'medium',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  {
    id: 'liquid/lfm-2.5-2.6b:free',
    name: 'VettCode Lite',
    provider: 'openrouter',
    tier: 1,
    capabilities: ['explanation'],
    costClass: 'free',
    maxTokens: 2048,
    contextWindow: 8192,
    latency: 'fast',
    reliability: 'low',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    enabled: true,
  },
  
  // ============================================================================
  // TIER 2: DEVELOPER (Low-cost paid models)
  // ============================================================================
  
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'openrouter',
    tier: 2,
    capabilities: ['explanation', 'code_analysis', 'fix_generation'],
    costClass: 'low',
    maxTokens: 4096,
    contextWindow: 200000,
    latency: 'fast',
    reliability: 'high',
    costPerInputToken: 0.25,
    costPerOutputToken: 1.25,
    enabled: true,
  },
  
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openrouter',
    tier: 2,
    capabilities: ['explanation', 'code_analysis', 'fix_generation', 'reasoning'],
    costClass: 'low',
    maxTokens: 16384,
    contextWindow: 128000,
    latency: 'fast',
    reliability: 'high',
    costPerInputToken: 0.15,
    costPerOutputToken: 0.6,
    enabled: true,
  },
  
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'openrouter',
    tier: 2,
    capabilities: ['code_analysis', 'fix_generation'],
    costClass: 'low',
    maxTokens: 4096,
    contextWindow: 16384,
    latency: 'fast',
    reliability: 'medium',
    costPerInputToken: 0.14,
    costPerOutputToken: 0.28,
    enabled: true,
  },
  
  // ============================================================================
  // TIER 3: ADVANCED (Mid-cost strong models)
  // ============================================================================
  
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B',
    provider: 'groq',
    tier: 3,
    capabilities: ['explanation', 'code_analysis', 'reasoning', 'security', 'fix_generation'],
    costClass: 'low',
    maxTokens: 8192,
    contextWindow: 131072,
    latency: 'fast',
    reliability: 'high',
    costPerInputToken: 0.59,
    costPerOutputToken: 0.79,
    enabled: true,
  },
  
  {
    id: 'mixtral-8x7b-groq',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    tier: 3,
    capabilities: ['explanation', 'code_analysis', 'reasoning', 'fix_generation'],
    costClass: 'low',
    maxTokens: 32768,
    contextWindow: 32768,
    latency: 'fast',
    reliability: 'high',
    costPerInputToken: 0.24,
    costPerOutputToken: 0.24,
    enabled: true,
  },
  
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    tier: 3,
    capabilities: ['explanation', 'code_analysis', 'reasoning', 'security', 'fix_generation', 'multi_file'],
    costClass: 'medium',
    maxTokens: 8192,
    contextWindow: 200000,
    latency: 'medium',
    reliability: 'high',
    costPerInputToken: 3.0,
    costPerOutputToken: 15.0,
    enabled: true,
  },
  
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openrouter',
    tier: 3,
    capabilities: ['explanation', 'code_analysis', 'reasoning', 'fix_generation', 'multi_file'],
    costClass: 'medium',
    maxTokens: 4096,
    contextWindow: 128000,
    latency: 'medium',
    reliability: 'high',
    costPerInputToken: 10.0,
    costPerOutputToken: 30.0,
    enabled: true,
  },
  
  // ============================================================================
  // TIER 4: PREMIUM (High-cost best models)
  // ============================================================================
  
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'openrouter',
    tier: 4,
    capabilities: ['explanation', 'code_analysis', 'reasoning', 'security', 'fix_generation', 'multi_file', 'mentor'],
    costClass: 'high',
    maxTokens: 4096,
    contextWindow: 200000,
    latency: 'slow',
    reliability: 'high',
    costPerInputToken: 15.0,
    costPerOutputToken: 75.0,
    enabled: true,
  },
  
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openrouter',
    tier: 4,
    capabilities: ['explanation', 'code_analysis', 'reasoning', 'security', 'fix_generation', 'multi_file', 'mentor'],
    costClass: 'high',
    maxTokens: 16384,
    contextWindow: 128000,
    latency: 'medium',
    reliability: 'high',
    costPerInputToken: 5.0,
    costPerOutputToken: 15.0,
    enabled: true,
  },
]

/**
 * Get models by tier
 */
export function getModelsByTier(tier: ModelTier): AIModel[] {
  return MODEL_REGISTRY.filter((m) => m.tier === tier && m.enabled)
}

/**
 * Get models by capability
 */
export function getModelsByCapability(capability: ModelCapability): AIModel[] {
  return MODEL_REGISTRY.filter(
    (m) => m.capabilities.includes(capability) && m.enabled
  )
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: 'openrouter' | 'groq'): AIModel[] {
  return MODEL_REGISTRY.filter((m) => m.provider === provider && m.enabled)
}

/**
 * Get model by ID
 */
export function getModelById(id: string): AIModel | null {
  return MODEL_REGISTRY.find((m) => m.id === id && m.enabled) || null
}

/**
 * Get models for a plan (filters by allowed tiers)
 */
export function getModelsForPlan(allowedTiers: ModelTier[]): AIModel[] {
  return MODEL_REGISTRY.filter(
    (m) => allowedTiers.includes(m.tier) && m.enabled
  )
}

/**
 * Find best model for task
 * Filters by capability, then selects by:
 * 1. Tier (higher is better)
 * 2. Cost (lower is better within tier)
 * 3. Latency (faster is better)
 */
export function findBestModel(
  allowedModels: AIModel[],
  requiredCapability: ModelCapability,
  preferHighTier: boolean = true
): AIModel | null {
  // Filter by capability
  const capable = allowedModels.filter((m) =>
    m.capabilities.includes(requiredCapability)
  )

  if (capable.length === 0) return null

  // Sort by tier (high to low), then cost (low to high)
  const sorted = capable.sort((a, b) => {
    if (preferHighTier) {
      // Prefer higher tier
      if (b.tier !== a.tier) return b.tier - a.tier
    } else {
      // Prefer lower tier (cheaper)
      if (a.tier !== b.tier) return a.tier - b.tier
    }

    // Within same tier, prefer lower cost
    const aCost = a.costPerInputToken + a.costPerOutputToken
    const bCost = b.costPerInputToken + b.costPerOutputToken
    return aCost - bCost
  })

  return sorted[0]
}

/**
 * Estimate cost for a model
 */
export function estimateCost(
  model: AIModel,
  inputTokens: number,
  outputTokens: number
): number {
  return (
    (inputTokens * model.costPerInputToken + outputTokens * model.costPerOutputToken) /
    1000000
  )
}

/**
 * Get model display name (user-friendly)
 */
export function getModelDisplayName(model: AIModel): string {
  const tierLabels: Record<ModelTier, string> = {
    1: 'Standard',
    2: 'Enhanced',
    3: 'Advanced',
    4: 'Premium',
  }

  return `AI Analysis — ${tierLabels[model.tier]}`
}

/**
 * Get tier description
 */
export function getTierDescription(tier: ModelTier): string {
  const descriptions: Record<ModelTier, string> = {
    1: 'Fast, efficient models for basic security explanations',
    2: 'Enhanced models with code analysis and fix generation',
    3: 'Advanced models for complex reasoning and multi-file analysis',
    4: 'Premium models with deep security expertise and AI mentoring',
  }

  return descriptions[tier]
}
