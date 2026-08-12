/**
 * Secret Redaction Utility
 * NEVER send actual secrets to AI providers
 */

import { Finding } from './types'

/**
 * Redact sensitive values from findings before sending to AI
 */
export function redactSecrets(finding: Finding): Finding {
  // Only redact if it's a SECRET category
  if (finding.category !== 'SECRET') {
    return finding
  }

  // Clone the finding to avoid mutation
  const redacted = { ...finding }

  // Redact the message (contains the actual secret)
  redacted.message = redactSecretValue(finding.message)

  // Redact metadata if it contains sensitive values
  if (redacted.metadata) {
    redacted.metadata = {
      ...redacted.metadata,
      secret: undefined, // Remove if present
      value: undefined, // Remove if present
    }
  }

  return redacted
}

/**
 * Redact secret values from text
 * Keeps first few characters for context, masks the rest
 */
function redactSecretValue(text: string): string {
  // Common secret patterns
  const patterns = [
    // AWS Access Key
    { regex: /(AKIA[0-9A-Z]{16})/g, replace: (match: string) => `${match.slice(0, 8)}••••••••••••••••` },
    
    // AWS Secret Key (base64-like)
    { regex: /([A-Za-z0-9+/]{40})/g, replace: (match: string) => `${match.slice(0, 6)}••••••••••••••••••••••••••••••••••••` },
    
    // GitHub Token
    { regex: /(ghp_[a-zA-Z0-9]{36})/g, replace: () => 'ghp_••••••••••••••••••••••••••••••••••••' },
    { regex: /(gho_[a-zA-Z0-9]{36})/g, replace: () => 'gho_••••••••••••••••••••••••••••••••••••' },
    { regex: /(ghu_[a-zA-Z0-9]{36})/g, replace: () => 'ghu_••••••••••••••••••••••••••••••••••••' },
    { regex: /(ghs_[a-zA-Z0-9]{36})/g, replace: () => 'ghs_••••••••••••••••••••••••••••••••••••' },
    { regex: /(ghr_[a-zA-Z0-9]{36})/g, replace: () => 'ghr_••••••••••••••••••••••••••••••••••••' },
    
    // Generic API Keys (sk_, pk_, etc.)
    { regex: /(sk_[a-zA-Z0-9]{32,})/g, replace: (match: string) => `${match.slice(0, 6)}••••••••••••••••••••••••••••••` },
    { regex: /(pk_[a-zA-Z0-9]{32,})/g, replace: (match: string) => `${match.slice(0, 6)}••••••••••••••••••••••••••••••` },
    { regex: /(api_[a-zA-Z0-9]{32,})/g, replace: (match: string) => `${match.slice(0, 7)}••••••••••••••••••••••••••••••` },
    
    // JWT Tokens
    { regex: /(eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})/g, replace: () => 'eyJ••••••••••••.••••••••••••.••••••••••••' },
    
    // Private Keys (PEM format)
    { regex: /(-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----[\s\S]+?-----END (RSA |EC |DSA )?PRIVATE KEY-----)/g, replace: () => '-----BEGIN PRIVATE KEY-----\n[REDACTED]\n-----END PRIVATE KEY-----' },
    
    // Passwords in connection strings
    { regex: /(password=)([^\s&;"']+)/gi, replace: (_, prefix) => `${prefix}••••••••` },
    { regex: /(pwd=)([^\s&;"']+)/gi, replace: (_, prefix) => `${prefix}••••••••` },
    
    // Generic long alphanumeric strings (likely secrets)
    { regex: /\b([a-zA-Z0-9]{40,})\b/g, replace: (match: string) => `${match.slice(0, 8)}••••••••••••••••••••••••••••••••` },
  ]

  let redactedText = text

  patterns.forEach(({ regex, replace }) => {
    redactedText = redactedText.replace(regex, replace as any)
  })

  return redactedText
}

/**
 * Check if a finding contains secrets that should be redacted
 */
export function containsSecrets(finding: Finding): boolean {
  return finding.category === 'SECRET'
}

/**
 * Get a safe description of the secret type without exposing the value
 */
export function getSecretTypeDescription(finding: Finding): string {
  const message = finding.message.toLowerCase()
  const title = finding.title.toLowerCase()
  const combined = `${title} ${message}`

  if (combined.includes('aws')) return 'AWS credential'
  if (combined.includes('github')) return 'GitHub token'
  if (combined.includes('api key') || combined.includes('api_key')) return 'API key'
  if (combined.includes('private key')) return 'Private key'
  if (combined.includes('password')) return 'Password'
  if (combined.includes('token')) return 'Authentication token'
  if (combined.includes('secret')) return 'Secret value'
  
  return 'Credential or secret'
}
