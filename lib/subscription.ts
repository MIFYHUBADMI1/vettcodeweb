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
  
  // AI Usage Limits
  dailyAIRequestLimit: number
  monthlyAIRequestLimit: number
  maxTokensPerRequest: number
  
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
  
  // Cost Management
  monthlyAISpendLimit: number // in USD
  
  // Priority (higher = better routing)
  priority: number
}

/**
 * Plan Definitions
 * 
 * Note: Plans are defined by TIERS and CAPABILITIES
 * The actual models are selected dynamically from Model Registry
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
    
    // AI Limits
    dailyAIRequestLimit: parseInt(process.env.FREE_DAILY_AI_LIMIT || '5'),
    monthlyAIRequestLimit: 0, // No monthly limit, only daily
    maxTokensPerRequest: 500,
    
    // Features
    features: {
      basicExplanations: true,
      aiExplanations: true, // Limited by quota
      aiChat: false,
      fixSuggestions: false,
      deepAnalysis: false,
      multiFileAnalysis: false,
      securityMentor: false,
      scanHistory: false,
      advancedReports: false,
      priorityAI: false,
    },
    
    monthlyAISpendLimit: 0, // Free tier has no spend
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
    
    // AI Limits
    dailyAIRequestLimit: 50,
    monthlyAIRequestLimit: parseInt(process.env.PRO_MONTHLY_AI_LIMIT || '150'),
    maxTokensPerRequest: 1000,
    
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
    
    monthlyAISpendLimit: 5.0, // $5/month AI budget
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
    
    // AI Limits
    dailyAIRequestLimit: 200,
    monthlyAIRequestLimit: parseInt(process.env.PRO_PLUS_MONTHLY_AI_LIMIT || '500'),
    maxTokensPerRequest: 2000,
    
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
    
    monthlyAISpendLimit: 20.0, // $20/month AI budget
    priority: 3,
  },
}

/**
 * Get plan for a user
 * Queries MongoDB for user's actual plan
 */
export async function getUserPlan(userId?: string): Promise<SubscriptionPlan> {
  if (!userId || userId === 'anonymous') {
    return SUBSCRIPTION_PLANS.free
  }

  // Import dynamically to avoid circular dependency
  const { UserModel } = await import('./models/User')
  
  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      return SUBSCRIPTION_PLANS.free
    }
    
    return SUBSCRIPTION_PLANS[user.plan] || SUBSCRIPTION_PLANS.free
  } catch (error) {
    console.error('Failed to get user plan:', error)
    return SUBSCRIPTION_PLANS.free
  }
}

/**
 * Check if user can make AI request
 */
export async function canMakeAIRequest(
  userId: string,
  plan: SubscriptionPlan
): Promise<{ allowed: boolean; reason?: string }> {
  // Import dynamically
  const { AIUsageModel } = await import('./models/AIUsage')
  
  try {
    // Check daily limit
    const dailyUsage = await AIUsageModel.getDailyCount(userId)
    if (dailyUsage >= plan.dailyAIRequestLimit) {
      return {
        allowed: false,
        reason: `Daily AI limit reached (${plan.dailyAIRequestLimit} requests). Upgrade to ${plan.id === 'free' ? 'Pro' : 'Pro+'} for more!`,
      }
    }
    
    // Check monthly limit (if applicable)
    if (plan.monthlyAIRequestLimit > 0) {
      const monthlyUsage = await AIUsageModel.getMonthlyCount(userId)
      if (monthlyUsage >= plan.monthlyAIRequestLimit) {
        return {
          allowed: false,
          reason: `Monthly AI limit reached (${plan.monthlyAIRequestLimit} requests). Reset next month or upgrade!`,
        }
      }
    }
    
    return { allowed: true }
  } catch (error) {
    console.error('Failed to check AI request:', error)
    // Allow request if check fails (fail open)
    return { allowed: true }
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
      feature: 'AI Explanations',
      free: '5/day',
      pro: '150/month',
      pro_plus: '500/month',
    },
    {
      feature: 'Model Access',
      free: 'Tier 1 (Standard)',
      pro: 'Tier 1-3 (Advanced)',
      pro_plus: 'Tier 1-4 (Premium)',
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
