/**
 * AI Chat Utilities - Client-Safe
 * Functions that can be used in both client and server
 */

import type { Finding } from './types'

export interface ScanContext {
  scanId: string
  scanPath: string
  totalFindings: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  infoCount: number
  score: number
  grade: string
  categories: string[]
  priorityFindings: Finding[]
}

/**
 * Generate dynamic quick actions based on scan
 * Client-safe - no server dependencies
 */
export function generateQuickActions(context: ScanContext): string[] {
  const actions: string[] = []

  // Always include these
  actions.push('What should I fix first?')

  if (context.criticalCount > 0) {
    actions.push('Explain my critical issues')
  }

  // Check for specific categories
  const hasSecrets = context.categories.includes('SECRET')
  const hasCode = context.categories.includes('CODE')
  const hasDependency = context.categories.includes('DEPENDENCY')

  if (hasSecrets) {
    actions.push('Teach me about exposed secrets')
  }

  // Check for SQL injection in priority findings
  const hasSQLi = context.priorityFindings.some(
    (f) =>
      f.title.toLowerCase().includes('sql') ||
      f.message.toLowerCase().includes('sql') ||
      f.metadata.ruleId?.toLowerCase().includes('sql')
  )

  if (hasSQLi) {
    actions.push('Explain SQL injection to me')
  }

  if (hasCode && context.highCount > 0) {
    actions.push('Why are these code issues dangerous?')
  }

  if (hasDependency) {
    actions.push('Help me understand dependency risks')
  }

  // Always offer these
  actions.push('Create a fix plan for me')
  actions.push('What can I learn from this scan?')

  return actions.slice(0, 6) // Max 6 quick actions
}
