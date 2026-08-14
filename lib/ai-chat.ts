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
  userId: string,
  requestId: string = 'legacy'
): Promise<ChatResponse> {
  const startTime = Date.now()
  console.log(`[AI-CHAT][${requestId}] Generating scan overview for user:`, userId)
  
  // Dynamic imports for server-only modules
  const { getUserPlan } = await import('./subscription')
  const { checkQuota } = await import('./usage-tracking')
  
  // Check quota
  const plan = await getUserPlan(userId)
  console.log(`[AI-CHAT][${requestId}] User plan:`, plan.id, 'Daily limit:', plan.dailyAIRequestLimit)
  
  const quotaCheck = await checkQuota(
    userId,
    plan.dailyAIRequestLimit,
    plan.monthlyAIRequestLimit
  )

  if (!quotaCheck.allowed) {
    console.log(`[AI-CHAT][${requestId}] Quota exceeded, using template fallback. Reason:`, quotaCheck.reason)
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
  console.log(`[AI-CHAT][${requestId}] Built overview prompt, calling AI...`)

  try {
    // Use AI Router (existing infrastructure)
    const response = await callAIChat(
      prompt,
      [],
      userId,
      'scan_overview',
      requestId
    )

    console.log(`[AI-CHAT][${requestId}] Overview generated successfully via`, response.provider, response.model)
    return {
      ...response,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    console.error(`[AI-CHAT][${requestId}] Scan overview generation failed:`, error)
    
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
  userId: string,
  requestId: string = 'legacy'
): Promise<ChatResponse> {
  const startTime = Date.now()
  console.log(`[AI-CHAT][${requestId}] Generating chat response for user:`, userId)
  console.log(`[AI-CHAT][${requestId}] User message:`, userMessage.substring(0, 100))
  console.log(`[AI-CHAT][${requestId}] Conversation history length:`, conversationHistory.length)

  // Dynamic imports for server-only modules
  const { getUserPlan } = await import('./subscription')
  const { checkQuota } = await import('./usage-tracking')

  // Check quota
  const plan = await getUserPlan(userId)
  console.log(`[AI-CHAT][${requestId}] User plan:`, plan.id, 'Daily limit:', plan.dailyAIRequestLimit)
  
  const quotaCheck = await checkQuota(
    userId,
    plan.dailyAIRequestLimit,
    plan.monthlyAIRequestLimit
  )

  if (!quotaCheck.allowed) {
    console.log(`[AI-CHAT][${requestId}] Quota exceeded. Reason:`, quotaCheck.reason)
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
  
  console.log(`[AI-CHAT][${requestId}] System prompt length:`, systemPrompt.length)
  console.log(`[AI-CHAT][${requestId}] Contextual prompt:`, contextualPrompt.substring(0, 150))

  try {
    const response = await callAIChat(
      contextualPrompt,
      [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Last 10 messages for context
      ],
      userId,
      'scan_chat',
      requestId
    )

    console.log(`[AI-CHAT][${requestId}] Chat response generated successfully via`, response.provider, response.model)
    console.log(`[AI-CHAT][${requestId}] Response length:`, response.message.length)
    
    return {
      ...response,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    console.error(`[AI-CHAT][${requestId}] Chat response generation failed:`, error)
    
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
  feature: string,
  requestId: string
): Promise<Omit<ChatResponse, 'duration'>> {
  console.log(`[AI-CHAT][${requestId}] callAIChat invoked for feature:`, feature)
  
  // Dynamic imports
  const { getUserPlan } = await import('./subscription')
  
  const plan = await getUserPlan(userId)

  // Build messages array for chat
  const chatMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  // Add user prompt as latest message
  chatMessages.push({
    role: 'user',
    content: userPrompt,
  })
  
  console.log(`[AI-CHAT][${requestId}] Total messages being sent to AI:`, chatMessages.length)
  console.log(`[AI-CHAT][${requestId}] Calling aiRouter.generateChat...`)

  try {
    const response = await aiRouter.generateChat(chatMessages, {
      userId,
      plan,
      feature,
      requestId, // Pass through requestId
    })

    console.log(`[AI-CHAT][${requestId}] AI Router response received`)
    console.log(`[AI-CHAT][${requestId}] Provider:`, response.provider, 'Model:', response.model)
    console.log(`[AI-CHAT][${requestId}] Message preview:`, response.message.substring(0, 100))
    
    return {
      message: response.message,
      source: 'ai',
      provider: response.provider,
      model: response.model,
    }
  } catch (error) {
    console.error(`[AI-CHAT][${requestId}] AI chat call failed:`, error)
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
