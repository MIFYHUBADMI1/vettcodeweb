/**
 * VettCode Web Dashboard Types
 */

// Re-export CLI types for consistency
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type FindingCategory = 'CODE' | 'DEPENDENCY' | 'SECRET' | 'INFRASTRUCTURE' | 'CONFIG';
export type SensorType = 'semgrep' | 'osv-scanner' | 'gitleaks' | 'trivy' | 'codeql';

// Normalized finding (matches CLI structure)
export interface NormalizedFinding {
  id: string;
  sensor: SensorType;
  category: FindingCategory;
  severity: Severity;
  title: string;
  message: string;
  filePath: string;
  lineNumber?: number;
  codeSnippet?: string;
  cwe?: string[];
  cve?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore?: number;
  references?: string[];
  metadata?: {
    ruleId?: string;
    packageName?: string;
    packageVersion?: string;
    secretType?: string;
    references?: string[];
    [key: string]: any;
  };
}

export interface ScanResult {
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
  findings: NormalizedFinding[]
}

// Legacy Finding type (for backward compatibility with existing code)
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
