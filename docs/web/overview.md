---
title: Web Dashboard Overview
description: Introduction to VettCode Web - AI-powered security analysis dashboard
order: 1
---

# VettCode Web Dashboard Overview

VettCode Web is an AI-powered security analysis dashboard that transforms raw scan results into actionable insights with intelligent explanations.

## What is VettCode Web?

VettCode Web helps you:

- **Understand Security Issues** - AI explains vulnerabilities in plain language
- **Learn Security Best Practices** - Educational explanations for every finding
- **Prioritize Fixes** - Intelligent severity scoring and risk assessment
- **Track Progress** - Scan history and trend analysis
- **Collaborate** - Share findings with your team

## Key Features

### AI-Powered Explanations

Get intelligent explanations for security findings:

- **What's Wrong** - Clear description of the issue
- **Why It Matters** - Real-world impact and risk
- **How to Fix** - Step-by-step remediation guide
- **Code Examples** - Working fix examples
- **Learn More** - Educational resources

### Multiple AI Models

VettCode Web uses multiple AI providers for reliability:

- **OpenRouter** - Access to 50+ AI models
- **Grok** - xAI's fast, efficient model
- **Intelligent Routing** - Best model for each task
- **Fallback Support** - Automatic failover

### Subscription Tiers

#### Free Tier

- 5 AI explanations per day
- Free AI models only
- Unlimited scanning
- Basic explanations

#### Pro Tier ($5/month)

- 150 AI explanations per month
- Access to paid models (Claude, GPT-4)
- AI chat feature
- Fix suggestions
- Scan history

#### Pro+ Tier ($20/month)

- 500 AI explanations per month
- Best AI models
- Priority routing
- Deep analysis
- Advanced reports
- Priority support

### Visual Dashboard

Intuitive interface showing:

- **Severity Breakdown** - Critical, High, Medium, Low
- **Finding Categories** - Secrets, vulnerabilities, code quality
- **Security Score** - Overall project health
- **Trends** - Improvement over time
- **Hotspots** - Most vulnerable files

### Upload Methods

Multiple ways to import scan results:

1. **Drag & Drop** - Drop JSON files directly
2. **File Browser** - Select files from your system
3. **CLI Integration** - Automatic upload after scan
4. **API** - Programmatic integration

## How It Works

```
1. Scan your project with VettCode CLI
   ↓
2. Upload results.json to VettCode Web
   ↓
3. Dashboard shows visual summary
   ↓
4. Click "Get AI Explanation" on findings
   ↓
5. AI analyzes and explains the issue
   ↓
6. Follow fix guidance to resolve
```

## Architecture

VettCode Web uses a sophisticated AI routing system:

```
User Request
  ↓
Subscription Check
  ↓
Quota Validation
  ↓
Cache Check (instant if cached)
  ↓
Template Match (instant if available)
  ↓
AI Router
  ├→ OpenRouter (primary)
  └→ Grok (fallback)
  ↓
Response Validation
  ↓
Usage Tracking
  ↓
Explanation Delivered
```

### Cost Optimization

VettCode Web optimizes AI costs through:

1. **Template-First** - 90% of requests use free templates
2. **Caching** - Avoid duplicate API calls
3. **Model Selection** - Right model for the task
4. **Quota Limits** - Fair usage per tier
5. **Fallback Strategy** - Graceful degradation

## Use Cases

### Solo Developers

Learn security best practices while building your projects.

### Development Teams

Share security knowledge across your team with AI explanations.

### Security Teams

Triage and prioritize vulnerabilities efficiently.

### Educational Use

Teach security concepts with real examples and AI tutoring.

### Compliance & Auditing

Document security analysis for compliance requirements.

## Data Privacy

Your security is our priority:

- **No Code Storage** - We don't store your source code
- **Encrypted Transit** - All data encrypted in transit
- **Minimal Retention** - Scan results retained per your settings
- **No Training Data** - Your code never used to train AI models
- **Compliance** - GDPR and SOC 2 compliant

## Browser Requirements

VettCode Web works on:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Next Steps

- [Getting Started](./getting-started) - Create your first scan
- [AI Explanations](./ai-explanations) - Understanding AI features
- [Scan Management](./scans) - Managing your security scans
- [Subscription Plans](./plans) - Choose the right plan
