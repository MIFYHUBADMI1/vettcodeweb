/**
 * Finding Prioritizer
 * Intelligent prioritization of security findings
 */

import { Finding } from './types'

export interface PrioritizedFinding extends Finding {
  priorityScore: number
}

export interface FindingGroup {
  category: string
  title: string
  count: number
  highestSeverity: Finding['severity']
  findings: Finding[]
  emoji: string
}

/**
 * Calculate priority score for a finding
 * Higher score = more urgent
 */
export function calculatePriority(finding: Finding): number {
  let priority = 0

  // Base severity weight
  const severityWeight = {
    CRITICAL: 100,
    HIGH: 50,
    MEDIUM: 20,
    LOW: 5,
    INFO: 1,
  }
  priority += severityWeight[finding.severity]

  // Confidence boost
  if (finding.confidence) {
    if (finding.confidence >= 0.85) {
      priority *= 1.5 // High confidence
    } else if (finding.confidence < 0.6) {
      priority *= 0.7 // Low confidence (possible false positive)
    }
  }

  // Category urgency
  if (finding.category === 'SECRET') {
    priority *= 2 // Exposed secrets are URGENT
  } else if (finding.category === 'CODE') {
    priority *= 1.2 // Code vulnerabilities are important
  }

  return Math.round(priority)
}

/**
 * Prioritize findings array
 */
export function prioritizeFindings(findings: Finding[]): PrioritizedFinding[] {
  return findings
    .map((finding) => ({
      ...finding,
      priorityScore: calculatePriority(finding),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
}

/**
 * Group findings by category and rule
 */
export function groupFindings(findings: Finding[]): FindingGroup[] {
  const groups = new Map<string, FindingGroup>()

  findings.forEach((finding) => {
    // Create group key from category and rule/title
    const ruleId = finding.metadata.ruleId || finding.title
    const groupKey = `${finding.category}:${ruleId}`

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        category: finding.category,
        title: getGroupTitle(finding),
        count: 0,
        highestSeverity: finding.severity,
        findings: [],
        emoji: getCategoryEmoji(finding.category),
      })
    }

    const group = groups.get(groupKey)!
    group.count++
    group.findings.push(finding)

    // Update highest severity
    if (getSeverityLevel(finding.severity) > getSeverityLevel(group.highestSeverity)) {
      group.highestSeverity = finding.severity
    }
  })

  // Convert to array and sort by severity + count
  return Array.from(groups.values()).sort((a, b) => {
    const severityDiff = getSeverityLevel(b.highestSeverity) - getSeverityLevel(a.highestSeverity)
    if (severityDiff !== 0) return severityDiff
    return b.count - a.count
  })
}

/**
 * Get priority findings (top issues to fix first)
 */
export function getPriorityFindings(
  findings: Finding[],
  limit: number = 5
): FindingGroup[] {
  const groups = groupFindings(findings)
  return groups.slice(0, limit)
}

/**
 * Helper: Get group title from finding
 */
function getGroupTitle(finding: Finding): string {
  // Use rule ID if available, otherwise use title
  if (finding.metadata.ruleId) {
    return formatRuleId(finding.metadata.ruleId)
  }
  return finding.title
}

/**
 * Helper: Format rule ID for display
 */
function formatRuleId(ruleId: string): string {
  return ruleId
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Helper: Get category emoji
 */
function getCategoryEmoji(category: Finding['category']): string {
  const emojis = {
    CODE: '🐛',
    SECRET: '🔑',
    DEPENDENCY: '📦',
    CONFIG: '⚙️',
  }
  return emojis[category] || '📋'
}

/**
 * Helper: Convert severity to numeric level for comparison
 */
function getSeverityLevel(severity: Finding['severity']): number {
  const levels = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    INFO: 1,
  }
  return levels[severity]
}

/**
 * Get severity emoji
 */
export function getSeverityEmoji(severity: Finding['severity']): string {
  const emojis = {
    CRITICAL: '🔴',
    HIGH: '🟠',
    MEDIUM: '🟡',
    LOW: '🔵',
    INFO: '⚪',
  }
  return emojis[severity]
}
