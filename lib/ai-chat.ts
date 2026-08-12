/**
 * AI Chat System - Scan-Aware Conversational AI
 * Extends existing AI system for multi-turn conversations
 * SERVER-SIDE ONLY - Do not import in client components
 */

import { AIRouter } from './ai-router'
import type { Finding } from './types'
import type { ScanContext } from './ai-chat-utils'

const aiRouter = new AIRouter()

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

export interface ChatResponse {
  message: string
  source: 'ai' | 'template' | 'error'
  provider?: string
  model?: string
  duration: number
  quotaExceeded?: boolean
  quotaReason?: string
}

/**
 * Generate initial scan overview
 */
export async function generateScanOverview(
  scanContext: ScanContext,
  userId: string
): Promise<ChatResponse> {
  const startTime = Date.now()
  
  // Dynamic imports for server-only modules
  const { getUserPlan } = await import('./subscription')
  const { checkQuota, trackAIUsage } = await import('./usage-tracking')
  
  // Check quota
  const plan = await getUserPlan(userId)
  const quotaCheck = await checkQuota(
    userId,
    plan.dailyAIRequestLimit,
    plan.monthlyAIRequestLimit
  )

  if (!quotaCheck.allowed) {
    return {
      message: generateTemplateOverview(scanContext),
      source: 'template',
      duration: Date.now() - startTime,
      quotaExceeded: true,
      quotaReason: quotaCheck.reason,
    }
  }

  // Build prompt
  const prompt = buildScanOverviewPrompt(scanContext)

  try {
    // Use AI Router (existing infrastructure)
    const response = await callAIChat(
      prompt,
      [],
      userId,
      'scan_overview'
    )

    return {
      ...response,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    console.error('Scan overview generation failed:', error)
    
    // Fallback to template
    return {
      message: generateTemplateOverview(scanContext),
      source: 'template',
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Generate chat response with conversation context
 */
export async function generateChatResponse(
  userMessage: string,
  scanContext: ScanContext,
  conversationHistory: ChatMessage[],
  userId: string
): Promise<ChatResponse> {
  const startTime = Date.now()

  // Dynamic imports for server-only modules
  const { getUserPlan } = await import('./subscription')
  const { checkQuota } = await import('./usage-tracking')

  // Check quota
  const plan = await getUserPlan(userId)
  const quotaCheck = await checkQuota(
    userId,
    plan.dailyAIRequestLimit,
    plan.monthlyAIRequestLimit
  )

  if (!quotaCheck.allowed) {
    return {
      message: "You've reached your daily AI limit. Your quota resets tomorrow, or upgrade for more requests!",
      source: 'error',
      duration: Date.now() - startTime,
      quotaExceeded: true,
      quotaReason: quotaCheck.reason,
    }
  }

  // Build context-aware prompt
  const systemPrompt = buildChatSystemPrompt(scanContext)
  const contextualPrompt = buildContextualPrompt(userMessage, scanContext)

  try {
    const response = await callAIChat(
      contextualPrompt,
      [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Last 10 messages for context
      ],
      userId,
      'scan_chat'
    )

    return {
      ...response,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    console.error('Chat response generation failed:', error)
    
    return {
      message: "I'm having trouble responding right now. Please try again in a moment.",
      source: 'error',
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Call AI provider via existing router
 */
async function callAIChat(
  userPrompt: string,
  messages: ChatMessage[],
  userId: string,
  feature: string
): Promise<Omit<ChatResponse, 'duration'>> {
  // Dynamic imports
  const { getUserPlan } = await import('./subscription')
  const { trackAIUsage } = await import('./usage-tracking')
  const { getModelsForPlan, findBestModel } = await import('./model-registry')
  const { AIProviderRegistry } = await import('./ai-providers')
  
  const plan = await getUserPlan(userId)
  
  // Get best model for chat
  const allowedModels = getModelsForPlan(plan.allowedModelTiers)
  const bestModel = findBestModel(allowedModels, 'explanation', plan.priority >= 3)

  if (!bestModel) {
    throw new Error('No AI model available')
  }

  // Get provider
  const registry = new AIProviderRegistry()
  const provider = registry.getProvider(bestModel.provider)

  if (!provider) {
    throw new Error('Provider not available')
  }

  // Build a simple finding object to use the explanation system
  // This is a workaround until we have proper chat endpoints
  const chatFinding = {
    id: 0,
    title: 'Security Scan Chat',
    message: userPrompt,
    severity: 'INFO' as const,
    category: 'CODE' as const,
    file: 'chat',
    line: 0,
    metadata: {
      chatContext: JSON.stringify(messages.slice(-3)), // Last 3 messages for context
    },
  }

  try {
    const response = await provider.generateExplanation(
      chatFinding,
      bestModel.id,
      plan.maxTokensPerRequest
    )

    // Track usage
    const inputTokens = estimateTokens(userPrompt + JSON.stringify(messages))
    const outputTokens = estimateTokens(response.whatsWrong + response.whyItMatters + response.howToFix)
    const cost = (inputTokens * bestModel.costPerInputToken + outputTokens * bestModel.costPerOutputToken) / 1000000

    await trackAIUsage({
      userId,
      plan: plan.id,
      provider: bestModel.provider,
      model: bestModel.id,
      feature,
      inputTokens,
      outputTokens,
      estimatedCost: cost,
    })

    // Convert explanation format to conversational chat message
    let message = ''
    
    if (response.whatsWrong) {
      message += response.whatsWrong
    }
    
    if (response.whyItMatters && response.whyItMatters !== response.whatsWrong) {
      message += '\n\n' + response.whyItMatters
    }
    
    if (response.howToFix && response.howToFix.length > 10) {
      message += '\n\n### How to fix\n\n' + response.howToFix
    }
    
    if (response.whatToLearn && response.whatToLearn.length > 10) {
      message += '\n\n### What you'll learn\n\n' + response.whatToLearn
    }

    return {
      message: message.trim() || 'I can help you understand this scan. What would you like to know?',
      source: 'ai',
      provider: bestModel.provider,
      model: bestModel.id,
    }
  } catch (error) {
    console.error('AI provider call failed:', error)
    throw error
  }
}

/**
 * Build scan overview prompt
 */
function buildScanOverviewPrompt(context: ScanContext): string {
  const topIssues = context.priorityFindings
    .slice(0, 5)
    .map((f) => `- ${f.severity}: ${f.title} in ${f.file}`)
    .join('\n')

  return `Analyze this security scan and provide a beginner-friendly overview:

Project: ${context.scanPath}
Total Findings: ${context.totalFindings}
Security Score: ${context.score}/100 (Grade ${context.grade})

Severity Breakdown:
- Critical: ${context.criticalCount}
- High: ${context.highCount}
- Medium: ${context.mediumCount}
- Low: ${context.lowCount}
- Info: ${context.infoCount}

Categories: ${context.categories.join(', ')}

Top Issues:
${topIssues}

As VettCode Coach, provide:
1. What was found (2-3 sentences)
2. What matters most (priority guidance)
3. Where to start (actionable first step)
4. Learning opportunity (what they'll learn)

Use simple, encouraging language for beginner developers. Keep it under 200 words.`
}

/**
 * Build chat system prompt
 */
function buildChatSystemPrompt(context: ScanContext): string {
  return `You are VettCode Coach, an AI security mentor for beginner developers.

CURRENT SCAN CONTEXT:
- Project: ${context.scanPath}
- Total Findings: ${context.totalFindings}
- Security Score: ${context.score}/100 (Grade ${context.grade})
- Critical: ${context.criticalCount}, High: ${context.highCount}, Medium: ${context.mediumCount}
- Categories: ${context.categories.join(', ')}

YOUR ROLE:
- Help users understand their security scan
- Explain vulnerabilities in simple terms
- Prioritize what to fix
- Teach security concepts progressively
- Be encouraging and supportive
- Use beginner-friendly language (10th grade level)

RULES:
- Use the scan context to give specific, relevant answers
- Never invent findings that don't exist
- If unsure, say so clearly
- Suggest rescanning after fixes
- Focus on learning, not just fixing
- Keep responses concise (under 250 words unless teaching mode)
- Use examples from the actual scan when possible`
}

/**
 * Build contextual prompt based on user message
 */
function buildContextualPrompt(userMessage: string, context: ScanContext): string {
  const lowerMessage = userMessage.toLowerCase()

  // Detect if asking about specific finding type
  if (lowerMessage.includes('sql')) {
    const sqlFindings = context.priorityFindings.filter((f) =>
      f.title.toLowerCase().includes('sql') || f.message.toLowerCase().includes('sql')
    )
    if (sqlFindings.length > 0) {
      return `${userMessage}\n\nContext: The scan found ${sqlFindings.length} SQL-related issue(s):\n${sqlFindings
        .map((f) => `- ${f.title} in ${f.file}:${f.line}`)
        .join('\n')}`
    }
  }

  if (lowerMessage.includes('secret') || lowerMessage.includes('key') || lowerMessage.includes('credential')) {
    const secretCount = context.priorityFindings.filter((f) => f.category === 'SECRET').length
    if (secretCount > 0) {
      return `${userMessage}\n\nContext: The scan found ${secretCount} exposed secret(s) in your code.`
    }
  }

  if (lowerMessage.includes('critical') || lowerMessage.includes('most important') || lowerMessage.includes('first')) {
    const critical = context.priorityFindings.filter((f) => f.severity === 'CRITICAL').slice(0, 3)
    if (critical.length > 0) {
      return `${userMessage}\n\nYour most critical issues:\n${critical
        .map((f) => `- ${f.title} (${f.category}) in ${f.file}:${f.line}`)
        .join('\n')}`
    }
  }

  return userMessage
}

/**
 * Generate template-based overview (fallback)
 */
function generateTemplateOverview(context: ScanContext): string {
  if (context.totalFindings === 0) {
    return `Great news! Your scan of **${context.scanPath}** came back clean. No security issues detected! Keep up the good security practices. 🎉`
  }

  let overview = `I analyzed your scan of **${context.scanPath}** and found **${context.totalFindings} security ${
    context.totalFindings === 1 ? 'issue' : 'issues'
  }**.\n\n`

  if (context.criticalCount > 0) {
    overview += `⚠️ **Priority**: You have ${context.criticalCount} critical ${
      context.criticalCount === 1 ? 'issue' : 'issues'
    } that need immediate attention. Start here first.\n\n`
  } else if (context.highCount > 0) {
    overview += `🟠 You have ${context.highCount} high-severity ${
      context.highCount === 1 ? 'issue' : 'issues'
    } that should be fixed soon.\n\n`
  }

  overview += `**What to do**: Review the priority findings below. You don't need to fix everything at once—start with the highest-risk issues and work your way down.\n\n`

  overview += `**What you'll learn**: Each issue you fix teaches you how to write more secure code. Focus on understanding why these patterns are risky.`

  return overview
}

/**
 * Estimate tokens (rough approximation)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
