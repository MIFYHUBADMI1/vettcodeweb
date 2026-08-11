/**
 * Template-Based Explanations for Web Dashboard
 * Copied from CLI for consistency
 */

import { Explanation } from './types'

export const templates: Record<string, Explanation> = {
  'sql-injection': {
    title: 'SQL Injection Vulnerability',
    whatsWrong:
      'User input is directly included in a database query without validation or escaping. This allows attackers to inject malicious SQL commands.',
    whyItMatters:
      'Attackers can manipulate queries to access, modify, or delete sensitive data. They could steal user passwords, credit cards, or entire databases.',
    howToFix:
      'Use parameterized queries (prepared statements) instead of string concatenation. Parameterized queries separate SQL code from data, preventing injection.',
    whatYouLearn:
      'Never trust user input. Always treat user data as potentially malicious and separate it from SQL code.',
    fixExample: `❌ Bad:
const query = "SELECT * FROM users WHERE id = " + userId;
db.query(query);

✅ Good:
const query = "SELECT * FROM users WHERE id = ?";
db.execute(query, [userId]);`,
  },

  'command-injection': {
    title: 'Command Injection Vulnerability',
    whatsWrong:
      'User input is directly included in a system command. Attackers can inject additional commands using special characters like ; or | or &&.',
    whyItMatters:
      'Attackers can execute ANY command on your server - delete files, steal data, or take complete control of your system.',
    howToFix:
      'Avoid running shell commands with user input. If necessary, use safe APIs (like fs for file operations) and strictly validate/sanitize input with allowlists.',
    whatYouLearn:
      'Running shell commands with user input is extremely dangerous. Always use safer alternatives like built-in APIs.',
    fixExample: `❌ Bad:
exec(\`ping \${host}\`);

✅ Good:
const allowedHosts = ['localhost'];
if (allowedHosts.includes(host)) exec('ping ' + host);`,
  },

  'hardcoded-secret': {
    title: 'Hardcoded Secret',
    whatsWrong:
      'API keys, passwords, or tokens are written directly in your source code. Anyone who can see the code can see these credentials.',
    whyItMatters:
      'If this code is in version control (Git), pushed to GitHub, or shared, the secret is permanently compromised. Attackers can use it to access your services.',
    howToFix:
      'Store secrets in environment variables or a secrets manager. Load them at runtime, never commit them to code.',
    whatYouLearn:
      'Secrets in code are like leaving your house keys under the doormat. Use environment variables or secure vaults instead.',
    fixExample: `❌ Bad:
const API_KEY = "sk_live_51HqB2eLqZqK...";

✅ Good:
const API_KEY = process.env.STRIPE_API_KEY;`,
  },

  xss: {
    title: 'Cross-Site Scripting (XSS)',
    whatsWrong:
      'User input is displayed on a webpage without proper escaping or sanitization. Attackers can inject malicious JavaScript code.',
    whyItMatters:
      'Attackers can steal user sessions, redirect users to phishing sites, modify page content, or steal sensitive data like passwords.',
    howToFix:
      'Always escape user input before displaying it. Use framework features (like React JSX auto-escaping) or HTML escape functions.',
    whatYouLearn:
      'Never trust user input for display. Treat all user data as potentially malicious HTML/JavaScript.',
    fixExample: `❌ Bad:
res.send(\`<h1>Hello \${username}</h1>\`);

✅ Good:
// React auto-escapes:
<h1>Hello {username}</h1>`,
  },

  'path-traversal': {
    title: 'Path Traversal Vulnerability',
    whatsWrong:
      'User input is used to build file paths without validation. Attackers can use ../ to access files outside the intended directory.',
    whyItMatters:
      'Attackers can read sensitive files like /etc/passwd, configuration files with passwords, or your application source code.',
    howToFix:
      'Validate and sanitize file paths. Use path.resolve() and check that the result is within allowed directories.',
    whatYouLearn:
      'File paths from users are dangerous. Always validate and restrict to specific directories.',
  },

  'weak-hash': {
    title: 'Weak Cryptographic Hash',
    whatsWrong:
      'The code uses outdated hash functions like MD5 or SHA1. These are no longer secure and can be broken easily.',
    whyItMatters:
      'Attackers can reverse weak hashes to get original passwords. MD5 hashes can be cracked in seconds.',
    howToFix:
      'Use modern password hashing algorithms like bcrypt, scrypt, or Argon2. For general hashing, use SHA-256 or better.',
    whatYouLearn: 'Old crypto is broken crypto. Always use current security standards.',
    fixExample: `❌ Bad:
const hash = crypto.createHash('md5').update(password).digest('hex');

✅ Good:
const hash = await bcrypt.hash(password, 10);`,
  },

  'insecure-random': {
    title: 'Insecure Random Number Generation',
    whatsWrong:
      'The code uses Math.random() for security-sensitive operations. Math.random() is NOT cryptographically secure and predictable.',
    whyItMatters:
      'Attackers can predict "random" tokens, session IDs, or passwords, allowing them to hijack accounts or bypass security.',
    howToFix:
      'Use crypto.randomBytes() or crypto.randomUUID() for security-sensitive randomness.',
    whatYouLearn: 'Not all random is created equal. Use crypto-secure random for security features.',
    fixExample: `❌ Bad:
const token = Math.random().toString(36);

✅ Good:
const token = crypto.randomBytes(32).toString('hex');`,
  },

  'eval-injection': {
    title: 'Code Injection via eval()',
    whatsWrong:
      'The code uses eval() with user input. eval() executes any JavaScript code, including malicious code from attackers.',
    whyItMatters:
      'Attackers get complete control - they can steal data, modify your app, or compromise the entire server.',
    howToFix:
      'Never use eval() with user input. Find safer alternatives like JSON.parse() for data or purpose-built parsers.',
    whatYouLearn: 'eval() is evil with user input. There are always safer alternatives.',
  },

  'aws-secret': {
    title: 'Exposed AWS Credentials',
    whatsWrong:
      'AWS access keys or secret keys are hardcoded in your source code. These give access to your AWS account.',
    whyItMatters:
      'Attackers can use these credentials to access your AWS resources, potentially racking up massive bills, stealing data, or destroying infrastructure.',
    howToFix:
      'IMMEDIATELY revoke these credentials in AWS IAM. Then use AWS credentials file, environment variables, or IAM roles for EC2/Lambda.',
    whatYouLearn: 'AWS credentials are the keys to your cloud kingdom. Never put them in code.',
  },

  'api-key': {
    title: 'Exposed API Key',
    whatsWrong:
      'An API key is hardcoded in your source code. This key can be used by anyone who sees the code.',
    whyItMatters:
      'Attackers can abuse your API quota, rack up charges, access your data, or get your API access revoked.',
    howToFix:
      'Revoke this key immediately with your API provider. Store keys in environment variables and never commit them to version control.',
    whatYouLearn: 'API keys are like passwords. Keep them secret, keep them safe.',
  },

  'github-token': {
    title: 'Exposed GitHub Token',
    whatsWrong:
      'A GitHub personal access token is in your source code. This gives access to your GitHub repositories.',
    whyItMatters:
      'Attackers can read your private repos, steal code, modify repositories, or access organization secrets.',
    howToFix:
      'Revoke this token on GitHub immediately (Settings → Developer Settings → Tokens). Create a new one and store it securely.',
    whatYouLearn: 'GitHub tokens are powerful. Treat them like passwords - never commit them.',
  },

  'private-key': {
    title: 'Exposed Private Key',
    whatsWrong:
      'A private key (SSH, SSL, or other) is in your source code. Private keys should NEVER be shared.',
    whyItMatters:
      'Anyone with your private key can impersonate you, access your servers, decrypt your data, or sign malicious code.',
    howToFix:
      'Revoke/regenerate this key immediately. Store private keys in secure locations with proper file permissions (chmod 600).',
    whatYouLearn:
      'Private keys are the most sensitive credentials. They should be guarded carefully.',
  },

  'vulnerable-dependency': {
    title: 'Vulnerable Dependency',
    whatsWrong:
      'One of your project dependencies has a known security vulnerability (CVE). The vulnerable package could be exploited.',
    whyItMatters:
      'Even if your own code is secure, vulnerabilities in dependencies can compromise your entire application.',
    howToFix:
      'Update the package to a patched version. Run npm update or npm audit fix. If no fix exists, find an alternative package.',
    whatYouLearn: 'Your app is only as secure as its dependencies. Keep them updated.',
    fixExample: `❌ Current:
"lodash": "4.17.19"  // Has CVE

✅ Update:
npm update lodash
npm audit fix`,
  },

  'deprecated-package': {
    title: 'Deprecated Package',
    whatsWrong:
      "You're using a package that is no longer maintained. It won't receive security updates.",
    whyItMatters:
      "Unmaintained packages accumulate vulnerabilities over time. New exploits won't be patched.",
    howToFix:
      'Find an actively maintained alternative. Check npm for recommended replacements or modern equivalents.',
    whatYouLearn: 'Dead packages are security risks. Stick with actively maintained libraries.',
  },
}

/**
 * Get template by exact rule ID match
 */
export function getTemplate(ruleId: string): Explanation | null {
  const normalized = ruleId.toLowerCase().replace(/[_-]/g, '-')
  return templates[normalized] || null
}

/**
 * Get template by context/pattern matching
 */
export function getTemplateByContext(
  ruleId: string,
  message: string,
  category: string
): Explanation | null {
  const searchText = `${ruleId} ${message}`.toLowerCase()

  // SQL Injection patterns
  if (
    searchText.includes('sql') &&
    (searchText.includes('injection') || searchText.includes('query'))
  ) {
    return templates['sql-injection']
  }

  // Command Injection patterns
  if (
    searchText.includes('command') &&
    (searchText.includes('injection') || searchText.includes('exec'))
  ) {
    return templates['command-injection']
  }

  // XSS patterns
  if (
    searchText.includes('xss') ||
    (searchText.includes('cross') && searchText.includes('site')) ||
    searchText.includes('script')
  ) {
    return templates['xss']
  }

  // Secret patterns
  if (category === 'SECRET' || searchText.includes('secret') || searchText.includes('credential')) {
    if (searchText.includes('aws')) return templates['aws-secret']
    if (searchText.includes('github')) return templates['github-token']
    if (searchText.includes('key')) return templates['api-key']
    if (searchText.includes('private')) return templates['private-key']
    return templates['hardcoded-secret']
  }

  // Path Traversal
  if (searchText.includes('path') && searchText.includes('traversal')) {
    return templates['path-traversal']
  }

  // Weak Crypto
  if (
    (searchText.includes('md5') || searchText.includes('sha1')) &&
    searchText.includes('hash')
  ) {
    return templates['weak-hash']
  }

  // Insecure Random
  if (searchText.includes('random') && searchText.includes('math')) {
    return templates['insecure-random']
  }

  // eval injection
  if (searchText.includes('eval')) {
    return templates['eval-injection']
  }

  // Dependency issues
  if (category === 'DEPENDENCY') {
    if (searchText.includes('deprecated')) return templates['deprecated-package']
    return templates['vulnerable-dependency']
  }

  return null
}

/**
 * Get all available template IDs
 */
export function getTemplateIds(): string[] {
  return Object.keys(templates)
}

/**
 * Check if a template exists
 */
export function hasTemplate(ruleId: string): boolean {
  return getTemplate(ruleId) !== null
}
