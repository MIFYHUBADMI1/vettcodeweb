# 📘 VettCode Usage Guide

## Quick Start

### 1. Install Semgrep (One-time setup)

VettCode requires Semgrep to be installed on your system.

**On Windows:**

```bash
pip install semgrep
```

**On macOS:**

```bash
brew install semgrep
```

**On Linux:**

```bash
pip install semgrep
```

### 2. Build VettCode

```bash
cd VETTCODE
npm install
npm run build
```

### 3. Run Your First Scan

```bash
# Test with the included sample
node dist/index.js scan test-sample.js

# Or scan your own project
node dist/index.js scan /path/to/your/project
```

## Understanding the Output

### Report Structure

```
VettCode Scan Report
├── Total issues found: X
├── Top 3 critical issues:
│   ├── [1] Issue Title
│   │   ├── What's wrong: Simple explanation
│   │   ├── Why it matters: Security impact
│   │   └── How to fix: Actionable solution
│   ├── [2] Issue Title
│   └── [3] Issue Title
└── Tip: Additional guidance
```

### Severity Levels

- 🔥 **CRITICAL** (Red): High-risk vulnerabilities that need immediate attention
- ⚠️ **WARNING** (Yellow): Medium-risk issues that should be addressed soon

## Common Security Issues

### 1. SQL Injection

**What you'll see:**

```
🔥 CRITICAL: SQL Injection Vulnerability
```

**Example vulnerable code:**

```javascript
const query = `SELECT * FROM users WHERE id = ${userId}`;
```

**Fixed code:**

```javascript
const query = "SELECT * FROM users WHERE id = ?";
connection.query(query, [userId], callback);
```

### 2. Cross-Site Scripting (XSS)

**What you'll see:**

```
🔥 CRITICAL: Cross-Site Scripting (XSS)
```

**Example vulnerable code:**

```javascript
res.send(`<h1>Hello ${username}</h1>`);
```

**Fixed code:**

```javascript
// Use templating with auto-escaping
res.render("page", { username });
// Or escape manually
const escaped = escapeHtml(username);
res.send(`<h1>Hello ${escaped}</h1>`);
```

### 3. Hardcoded Secrets

**What you'll see:**

```
⚠️ WARNING: Hardcoded Secret
```

**Example vulnerable code:**

```javascript
const apiKey = "sk_live_abc123xyz";
```

**Fixed code:**

```javascript
const apiKey = process.env.API_KEY;
```

### 4. Command Injection

**What you'll see:**

```
🔥 CRITICAL: Command Injection
```

**Example vulnerable code:**

```javascript
exec(`ping ${userInput}`);
```

**Fixed code:**

```javascript
// Use array syntax or validation
execFile("ping", [userInput]);
```

## Tips for Best Results

### 1. Scan Early, Scan Often

Run VettCode:

- Before committing code
- After adding new features
- When working with user input
- Before deploying

### 2. Fix in Order

Always address issues in the order shown. VettCode prioritizes by severity and impact.

### 3. Learn the Patterns

After fixing a few issues, you'll start recognizing these patterns in your code before they become problems.

### 4. Use with CI/CD

Add VettCode to your build pipeline:

```yaml
# Example GitHub Actions
- name: Security Scan
  run: |
    npm install -g vettcode
    vettcode scan .
```

## Troubleshooting

### "Semgrep is not installed"

**Solution:** Install Semgrep using one of the methods above.

### "Path does not exist"

**Solution:** Check that the path is correct:

```bash
# Use absolute path
vettcode scan C:\projects\myapp

# Or relative path
vettcode scan ./src
```

### "No critical issues found"

**Great news!** This means VettCode didn't find any high-priority security issues. Your code passed the scan.

### Scan Takes Too Long

**Solution:** Scan specific directories instead of entire projects:

```bash
# Instead of scanning everything
vettcode scan .

# Scan just your source code
vettcode scan ./src
```

## Advanced Usage

### Integrating with Pre-commit Hooks

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
vettcode scan . || exit 1
```

### Scanning Specific File Types

Semgrep automatically detects languages. Just point VettCode at the directory:

```bash
# Scans all supported files in src/
vettcode scan ./src
```

### Understanding Semgrep Rules

VettCode uses Semgrep's "auto" config, which includes:

- OWASP Top 10 vulnerabilities
- Common security anti-patterns
- Language-specific security rules

## When to NOT Use VettCode

VettCode is designed for:

- ✅ Finding common security bugs
- ✅ Learning secure coding patterns
- ✅ Quick security checks

It's NOT designed for:

- ❌ Comprehensive security audits
- ❌ Compliance requirements (use full Semgrep)
- ❌ Performance optimization
- ❌ Code quality issues

## Next Steps

1. **Fix the top 3 issues** shown in your scan
2. **Run the scan again** to verify fixes
3. **Learn the patterns** so you avoid them in new code
4. **Share with your team** to improve code quality together

## Getting Help

- Check [Semgrep docs](https://semgrep.dev/docs/) for rule details
- Review [OWASP Top 10](https://owasp.org/Top10/) for vulnerability explanations
- Read the VettCode README for technical details

---

Remember: Security is a journey, not a destination. Every issue you fix makes your application safer! 🛡️
