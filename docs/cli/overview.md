---
title: CLI Overview
description: Introduction to VettCode CLI - security scanning tool
order: 1
---

# VettCode CLI Overview

VettCode CLI is a powerful security scanning tool that helps you identify vulnerabilities, secrets, and security issues in your codebase.

## What is VettCode CLI?

VettCode CLI scans your projects for:

- **Security Vulnerabilities** - Static analysis using Semgrep
- **Exposed Secrets** - Detect hardcoded API keys, passwords, tokens
- **Dependency Vulnerabilities** - Check for known CVEs in dependencies
- **Code Quality Issues** - Find common security anti-patterns

## Key Features

### Zero Setup

No configuration required. Just install and scan.

```bash
npm install -g vettcode-cli
vettcode scan .
```

### Multiple Sensors

- **Semgrep** - Industry-standard static analysis
- **OSV Scanner** - Dependency vulnerability detection
- **GitLeaks** - Secret detection
- **Custom Rules** - Extensible rule system

### AI-Powered Explanations

Upload scan results to VettCode Web to get:

- Plain-language explanations
- Step-by-step fix guidance
- Learning resources
- Example code fixes

### Fast & Efficient

- Parallel scanning
- Smart caching
- Incremental analysis
- Minimal false positives

## How It Works

```
1. Run VettCode CLI on your project
   ↓
2. Scan completes and generates findings
   ↓
3. Export results as JSON
   ↓
4. Upload to VettCode Web (optional)
   ↓
5. Get AI explanations and insights
```

## Supported Languages

VettCode CLI supports:

- JavaScript / TypeScript
- Python
- Java
- Go
- Ruby
- PHP
- C / C++
- C#
- And many more...

## Use Cases

### Pre-Commit Scanning

Catch security issues before they reach your repository.

### CI/CD Integration

Integrate into your build pipeline for continuous security monitoring.

### Code Reviews

Enhance code reviews with automated security checks.

### Security Audits

Comprehensive security analysis for compliance and auditing.

### Learning Tool

Understand security best practices through AI explanations.

## Next Steps

- [Installation](./installation) - Install VettCode CLI
- [Commands](./commands) - Learn CLI commands
- [Configuration](./configuration) - Configure scanning options
