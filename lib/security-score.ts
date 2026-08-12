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

export interface SecurityScore {
  score: number // 0-100
  status: SecurityStatus
  description: string
  emoji: string
}

/**
 * Calculate security score based on finding severity distribution
 */
export function calculateSecurityScore(scan: ScanSummary): SecurityScore {
  let score = 100

  // Deduct points by severity
  score -= scan.criticalCount * 15
  score -= scan.highCount * 8
  score -= scan.mediumCount * 3
  score -= scan.lowCount * 1
  score -= scan.infoCount * 0.5

  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, Math.round(score)))

  // Determine status based on findings
  let status: SecurityStatus
  let description: string
  let emoji: string

  if (scan.criticalCount > 0) {
    status = 'CRITICAL_RISK'
    emoji = '🔴'
    description = 'Critical security issues detected. Address these immediately to protect your application.'
  } else if (scan.highCount > 5) {
    status = 'HIGH_RISK'
    emoji = '🟠'
    description = 'Multiple high-severity issues found. These should be fixed as soon as possible.'
  } else if (scan.highCount > 0 || scan.mediumCount > 5) {
    status = 'NEEDS_ATTENTION'
    emoji = '🟡'
    description = 'Some security issues need attention. Review and fix these to improve your security.'
  } else if (scan.mediumCount > 0 || scan.lowCount > 0) {
    status = 'GOOD'
    emoji = '🟢'
    description = 'Your code is relatively secure. A few minor issues to address when you have time.'
  } else {
    status = 'SECURE'
    emoji = '✅'
    description = 'Excellent! No significant security issues detected in your code.'
  }

  return {
    score,
    status,
    description,
    emoji,
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
