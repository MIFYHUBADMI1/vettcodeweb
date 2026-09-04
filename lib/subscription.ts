/**
 * Subscription & Entitlement System with Model Tiers
 * 
 * Plans define WHAT users can access (tiers, features)
 * Model Registry defines HOW it's implemented (models, costs)
 * 
 * This separation allows changing models without touching subscription logic
 */

import { ModelTier, ModelCapability } from './model-registry'

export type PlanTier = 'free' | 'pro' | 'pro_plus'

export interface SubscriptionPlan {
  id: PlanTier
  name: string
  displayName: string
  
  // Model Access (by tier, not by specific models)
  allowedModelTiers: ModelTier[]
  
  // Capability Access (what features user can use)
  allowedCapabilities: ModelCapability[]
  
  // Token-based AI Usage (NEW - replaces request limits)
  monthlyTokenAllocation: number // Total tokens per month
  
  // Feature Flags
  features: {
    basicExplanations: boolean
    aiExplanations: boolean
    aiChat: boolean
    fixSuggestions: boolean
    deepAnalysis: boolean
    multiFileAnalysis: boolean
    securityMentor: boolean
    scanHistory: boolean
    advancedReports: boolean
    priorityAI: boolean
  }
  
  // Priority (higher = better routing)
  priority: number
}

/**
 * Plan Definitions
 * 
 * Token-based system:
 * - Users get monthly token allocation
 * - Each AI request deducts tokens based on model tier
 * - Token costs are internal (not shown to users, documented separately)
 */
export const SUBSCRIPTION_PLANS: Record<PlanTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'VettCode Free',
    displayName: 'Free',
    
    // Model Access: Tier 1 only (free models)
    allowedModelTiers: [1],
    
    // Capability Access: Basic only
    allowedCapabilities: ['explanation'],
    
    // Token Allocation: 15,000 tokens/month (~300 AI requests with Tier 1 models)
    monthlyTokenAllocation: 15000,
    
    // Features
    features: {
      basicExplanations: true,
      aiExplanations: true,
      aiChat: false,
      fixSuggestions: false,
      deepAnalysis: false,
      multiFileAnalysis: false,
      securityMentor: false,
      scanHistory: false,
      advancedReports: false,
      priorityAI: false,
    },
    
    priority: 1,
  },
  
  pro: {
    id: 'pro',
    name: 'VettCode Pro',
    displayName: 'Pro',
    
    // Model Access: Tier 1-3 (free + paid models)
    allowedModelTiers: [1, 2, 3],
    
    // Capability Access: Most features
    allowedCapabilities: [
      'explanation',
      'code_analysis',
      'fix_generation',
      'reasoning',
      'security',
    ],
    
    // Token Allocation: 100,000 tokens/month
    monthlyTokenAllocation: 100000,
    
    // Features
    features: {
      basicExplanations: true,
      aiExplanations: true,
      aiChat: true,
      fixSuggestions: true,
      deepAnalysis: true,
      multiFileAnalysis: false,
      securityMentor: false,
      scanHistory: true,
      advancedReports: true,
      priorityAI: false,
    },
    
    priority: 2,
  },
  
  pro_plus: {
    id: 'pro_plus',
    name: 'VettCode Pro+',
    displayName: 'Pro+',
    
    // Model Access: All tiers (best models available)
    allowedModelTiers: [1, 2, 3, 4],
    
    // Capability Access: Everything
    allowedCapabilities: [
      'explanation',
      'code_analysis',
      'fix_generation',
      'reasoning',
      'security',
      'multi_file',
      'mentor',
    ],
    
    // Token Allocation: 500,000 tokens/month
    monthlyTokenAllocation: 500000,
    
    // Features
    features: {
      basicExplanations: true,
      aiExplanations: true,
      aiChat: true,
      fixSuggestions: true,
      deepAnalysis: true,
      multiFileAnalysis: true,
      securityMentor: true,
      scanHistory: true,
      advancedReports: true,
      priorityAI: true,
    },
    
    priority: 3,
  },
}

/**
 * Token costs per model tier (internal, not exposed to users)
 * These are fixed costs per AI request based on model tier
 */
export const TOKEN_COSTS_BY_TIER: Record<ModelTier, number> = {
  1: 50,    // Tier 1 (free models): 50 tokens per request (~10 requests/day for free users)
  2: 200,   // Tier 2 (paid models): 200 tokens per request
  3: 300,   // Tier 3 (advanced models): 300 tokens per request
  4: 500,   // Tier 4+ (premium models): 500 tokens per request
}

/**
 * Get plan for a user
 * Queries MongoDB for user's actual plan
 */
export async function getUserPlan(userId?: string): Promise<SubscriptionPlan> {
  if (!userId || userId === 'anonymous') {
    return SUBSCRIPTION_PLANS.free
  }

  // Validate ObjectId format before querying MongoDB
  // MongoDB ObjectId must be a 24-character hex string
  const objectIdRegex = /^[0-9a-fA-F]{24}$/
  if (!objectIdRegex.test(userId)) {
    console.warn(`[SUBSCRIPTION] Invalid ObjectId format: ${userId}. Falling back to free plan.`)
    return SUBSCRIPTION_PLANS.free
  }

  // Import dynamically to avoid circular dependency
  const { UserModel } = await import('./models/User')
  
  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      console.warn(`[SUBSCRIPTION] User not found: ${userId}. Falling back to free plan.`)
      return SUBSCRIPTION_PLANS.free
    }
    
    return SUBSCRIPTION_PLANS[user.plan] || SUBSCRIPTION_PLANS.free
  } catch (error) {
    console.error('[SUBSCRIPTION] Failed to get user plan:', error)
    return SUBSCRIPTION_PLANS.free
  }
}

/**
 * Check if user can make AI request (token-based)
 */
export async function canMakeAIRequest(
  userId: string,
  plan: SubscriptionPlan,
  modelTier: ModelTier
): Promise<{ allowed: boolean; reason?: string; tokensRequired?: number; tokensRemaining?: number }> {
  // Import dynamically
  const { UserModel } = await import('./models/User')
  
  try {
    // Calculate tokens required for this request
    const tokensRequired = TOKEN_COSTS_BY_TIER[modelTier] || TOKEN_COSTS_BY_TIER[1]
    
    // Check user's token balance
    const balance = await UserModel.getTokenBalance(userId)
    
    if (!balance) {
      return {
        allowed: false,
        reason: 'Unable to check token balance',
      }
    }
    
    if (balance.currentBalance < tokensRequired) {
      return {
        allowed: false,
        reason: `Insufficient tokens. Required: ${tokensRequired.toLocaleString()}, Available: ${balance.currentBalance.toLocaleString()}`,
        tokensRequired,
        tokensRemaining: balance.currentBalance,
      }
    }
    
    return { 
      allowed: true,
      tokensRequired,
      tokensRemaining: balance.currentBalance,
    }
  } catch (error) {
    console.error('Failed to check AI request:', error)
    // Allow request if check fails (fail open)
    return { allowed: true }
  }
}

/**
 * Deduct tokens after successful AI request
 */
export async function deductAITokens(
  userId: string,
  modelTier: ModelTier
): Promise<{ success: boolean; newBalance: number; tokensDeducted: number; reason?: string }> {
  const { UserModel } = await import('./models/User')
  
  const tokensDeducted = TOKEN_COSTS_BY_TIER[modelTier] || TOKEN_COSTS_BY_TIER[1]
  
  const result = await UserModel.deductTokens(userId, tokensDeducted)
  
  return {
    success: result.success,
    newBalance: result.newBalance,
    tokensDeducted,
    reason: result.reason,
  }
}

/**
 * Check if user has capability access
 */
export function hasCapability(
  plan: SubscriptionPlan,
  capability: ModelCapability
): boolean {
  return plan.allowedCapabilities.includes(capability)
}

/**
 * Check if user has feature access
 */
export function hasFeature(
  plan: SubscriptionPlan,
  feature: keyof SubscriptionPlan['features']
): boolean {
  return plan.features[feature]
}

/**
 * Get upgrade message for capability
 */
export function getUpgradeMessage(capability: ModelCapability): string {
  const messages: Record<ModelCapability, string> = {
    explanation: 'Available on all plans',
    code_analysis: 'Upgrade to Pro for code analysis!',
    fix_generation: 'Upgrade to Pro for AI-generated fixes!',
    reasoning: 'Upgrade to Pro for advanced reasoning!',
    security: 'Upgrade to Pro for security-specific analysis!',
    multi_file: 'Upgrade to Pro+ for multi-file analysis!',
    mentor: 'Upgrade to Pro+ for AI security mentoring!',
  }
  
  return messages[capability] || 'Upgrade for more features!'
}

/**
 * Get upgrade message for feature
 */
export function getFeatureUpgradeMessage(feature: string): string {
  const messages: Record<string, string> = {
    aiChat: 'Upgrade to Pro to chat with AI about your security findings!',
    fixSuggestions: 'Upgrade to Pro to get AI-powered fix suggestions!',
    deepAnalysis: 'Upgrade to Pro for deep project security analysis!',
    multiFileAnalysis: 'Upgrade to Pro+ for multi-file security analysis!',
    securityMentor: 'Upgrade to Pro+ for AI security mentoring!',
    scanHistory: 'Upgrade to Pro to save and compare scan history!',
    advancedReports: 'Upgrade to Pro for advanced PDF/HTML reports!',
    priorityAI: 'Upgrade to Pro+ for fastest AI responses with best models!',
  }
  
  return messages[feature] || 'Upgrade for more features!'
}

/**
 * Get plan comparison matrix
 */
export function getPlanComparison(): Array<{
  feature: string
  free: boolean | string
  pro: boolean | string
  pro_plus: boolean | string
}> {
  return [
    {
      feature: 'Unlimited Scans',
      free: true,
      pro: true,
      pro_plus: true,
    },
    {
      feature: 'Monthly Tokens',
      free: '15,000',
      pro: '100,000',
      pro_plus: '500,000',
    },
    {
      feature: 'Model Access',
      free: 'Tier 1 (Standard)',
      pro: 'Tier 1-3 (Advanced)',
      pro_plus: 'Tier 1-4 (Premium)',
    },
    {
      feature: 'AI Chat',
      free: false,
      pro: true,
      pro_plus: true,
    },
    {
      feature: 'Code Analysis',
      free: false,
      pro: true,
      pro_plus: true,
    },
    {
      feature: 'Fix Generation',
      free: false,
      pro: true,
      pro_plus: true,
    },
    {
      feature: 'Multi-File Analysis',
      free: false,
      pro: false,
      pro_plus: true,
    },
    {
      feature: 'AI Security Mentor',
      free: false,
      pro: false,
      pro_plus: true,
    },
    {
      feature: 'Scan History',
      free: false,
      pro: true,
      pro_plus: true,
    },
    {
      feature: 'Advanced Reports',
      free: false,
      pro: true,
      pro_plus: true,
    },
    {
      feature: 'Priority AI',
      free: false,
      pro: false,
      pro_plus: true,
    },
  ]
}
