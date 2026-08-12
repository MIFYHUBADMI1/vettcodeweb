/**
 * Security Score Calculator
 * Calculates a beginner-friendly security score from scan results
 */

interface ScanSummary {
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  infoCount: number
  totalFindings: number
}

export type SecurityStatus = 
  | 'SECURE' 
  | 'GOOD' 
  | 'NEEDS_ATTENTION' 
  | 'HIGH_RISK' 
  | 'CRITICAL_RISK'

export type SecurityGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface SecurityScore {
  score: number // 5-100 (never 0 to avoid confusion)
  grade: SecurityGrade
  status: SecurityStatus
  description: string
  emoji: string
  reason: string // Why this score?
}

/**
 * Calculate security score based on finding severity distribution
 */
export function calculateSecurityScore(scan: ScanSummary): SecurityScore {
  let score = 100

  // Deduct points by severity (less harsh than before)
  score -= scan.criticalCount * 12
  score -= scan.highCount * 6
  score -= scan.mediumCount * 2
  score -= scan.lowCount * 0.5
  score -= scan.infoCount * 0.2

  // Ensure score is between 5-100 (never 0 to avoid looking like an error)
  score = Math.max(5, Math.min(100, Math.round(score)))

  // Calculate grade
  let grade: SecurityGrade
  if (score >= 90) grade = 'A'
  else if (score >= 75) grade = 'B'
  else if (score >= 60) grade = 'C'
  else if (score >= 40) grade = 'D'
  else grade = 'F'

  // Determine status and reason based on findings
  let status: SecurityStatus
  let description: string
  let emoji: string
  let reason: string

  if (scan.criticalCount > 0) {
    status = 'CRITICAL_RISK'
    emoji = '🔴'
    description = 'Critical security issues detected. Address these immediately to protect your application.'
    reason = `Score reduced due to ${scan.criticalCount} critical ${scan.criticalCount === 1 ? 'issue' : 'issues'} (-12 pts each)${scan.highCount > 0 ? ` and ${scan.highCount} high severity ${scan.highCount === 1 ? 'issue' : 'issues'} (-6 pts each)` : ''}.`
  } else if (scan.highCount > 5) {
    status = 'HIGH_RISK'
    emoji = '🟠'
    description = 'Multiple high-severity issues found. These should be fixed as soon as possible.'
    reason = `Score reduced due to ${scan.highCount} high severity issues (-6 pts each)${scan.mediumCount > 0 ? ` and ${scan.mediumCount} medium severity issues (-2 pts each)` : ''}.`
  } else if (scan.highCount > 0 || scan.mediumCount > 5) {
    status = 'NEEDS_ATTENTION'
    emoji = '🟡'
    description = 'Some security issues need attention. Review and fix these to improve your security.'
    reason = `Score reduced due to ${scan.highCount > 0 ? `${scan.highCount} high severity` : ''} ${scan.mediumCount > 0 ? `${scan.mediumCount} medium severity` : ''} issues found.`
  } else if (scan.mediumCount > 0 || scan.lowCount > 0) {
    status = 'GOOD'
    emoji = '🟢'
    description = 'Your code is relatively secure. A few minor issues to address when you have time.'
    reason = `Minor issues detected: ${scan.mediumCount} medium (-2 pts each), ${scan.lowCount} low (-0.5 pts each). Good overall security posture.`
  } else if (scan.infoCount > 0) {
    status = 'SECURE'
    emoji = '✅'
    description = 'Excellent! No significant security issues detected in your code.'
    reason = `Only ${scan.infoCount} informational ${scan.infoCount === 1 ? 'note' : 'notes'} found (-0.2 pts each). Strong security!`
  } else {
    status = 'SECURE'
    emoji = '✅'
    description = 'Perfect! No security issues found in this scan.'
    reason = 'Zero security issues detected. Your code is secure!'
  }

  return {
    score,
    grade,
    status,
    description,
    emoji,
    reason,
  }
}

/**
 * Get status color classes for UI
 */
export function getStatusColor(status: SecurityStatus): {
  bg: string
  border: string
  text: string
} {
  const colors = {
    CRITICAL_RISK: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/50',
      text: 'text-red-400',
    },
    HIGH_RISK: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/50',
      text: 'text-orange-400',
    },
    NEEDS_ATTENTION: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
    },
    GOOD: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/50',
      text: 'text-green-400',
    },
    SECURE: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
    },
  }

  return colors[status]
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: SecurityStatus): string {
  const labels = {
    CRITICAL_RISK: 'Critical Risk',
    HIGH_RISK: 'High Risk',
    NEEDS_ATTENTION: 'Needs Attention',
    GOOD: 'Good',
    SECURE: 'Secure',
  }

  return labels[status]
}
