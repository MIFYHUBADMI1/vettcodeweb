/**
 * VettCode Web Dashboard Types
 */

export interface ScanResult {
  version: string
  scan: {
    path: string
    timestamp: string
    sensorsUsed: string[]
    sensorsSkipped: string[]
  }
  summary: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  findings: Finding[]
}

export interface Finding {
  id: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  category: 'CODE' | 'SECRET' | 'DEPENDENCY' | 'CONFIG'
  title: string
  message: string
  file: string
  line: number
  column?: number
  confidence?: number
  confidenceLabel?: string
  fingerprint?: string  // Made optional
  metadata: {
    ruleId?: string
    cwe?: string[]
    owasp?: string[]
    references?: string[]
    [key: string]: any
  }
}

export interface Explanation {
  title: string
  whatsWrong: string
  whyItMatters: string
  howToFix: string
  whatYouLearn: string
  fixExample?: string
  confidenceNote?: string
}

export interface AIExplanationRequest {
  finding: Finding
}

export interface AIExplanationResponse {
  explanation: Explanation
  source: 'template' | 'ai' | 'fallback'
  duration: number
}
