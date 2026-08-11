# VettCode Web Dashboard - Architecture

## Overview

VettCode Web uses a **subscription-aware AI routing system** with multiple providers for reliability and cost optimization.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VETTCODE WEB DASHBOARD                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     SUBSCRIPTION LAYER                       │
│  • Free (5 AI/day, free models only)                        │
│  • Pro (150 AI/month, paid models)                          │
│  • Pro+ (500 AI/month, best models, priority)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        AI ROUTER                             │
│  Priority: Cache → Template → AI (best available)           │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ↓                   ↓
          ┌──────────────────┐  ┌──────────────────┐
          │   OpenRouter     │  │      Grok        │
          │  (Primary)       │  │   (Secondary)    │
          └──────────────────┘  └──────────────────┘
                    │                   │
          ┌─────────┴─────────┬─────────┴─────────┐
          ↓                   ↓                   ↓
    ┌──────────┐        ┌──────────┐      ┌──────────┐
    │   Free   │        │   Paid   │      │   Fast   │
    │  Models  │        │  Models  │      │  Model   │
    └──────────┘        └──────────┘      └──────────┘
          │                   │                   │
          └─────────┬─────────┴─────────┬─────────┘
                    ↓                   ↓
          ┌──────────────────┐  ┌──────────────────┐
          │  Response        │  │   Usage          │
          │  Validation      │  │   Tracking       │
          └──────────────────┘  └──────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ↓
                    ┌──────────────────┐
                    │  User gets       │
                    │  Explanation     │
                    └──────────────────┘
```

## Key Components

### 1. Subscription System (`lib/subscription.ts`)

**Purpose**: Define what each plan can do WITHOUT payment logic

**Plans**:

- **Free**: 5 AI/day, free models only, basic features
- **Pro**: 150 AI/month, paid models, advanced features
- **Pro+**: 500 AI/month, best models, priority routing

**Features**:

```typescript
{
  basicExplanations: boolean;
  aiExplanations: boolean;
  aiChat: boolean;
  fixSuggestions: boolean;
  deepAnalysis: boolean;
  scanHistory: boolean;
  advancedReports: boolean;
  priorityAI: boolean;
}
```

### 2. AI Providers (`lib/ai-providers.ts`)

**OpenRouter Provider**:

- Primary provider
- Supports free models (Gemma, Llama) for Free plan
- Supports paid models (Claude, GPT) for Pro/Pro+
- Cost-effective routing

**Grok Provider**:

- Secondary provider (fallback)
- xAI's Grok model
- Used when OpenRouter fails or for priority users

**Provider Interface**:

```typescript
interface AIProvider {
  name: string;
  generateExplanation(finding, model, maxTokens): Promise<Explanation>;
  isAvailable(): boolean;
  estimateCost(inputTokens, outputTokens, model): number;
}
```

### 3. AI Router (`lib/ai-router.ts`)

**Intelligence**: Routes requests based on:

1. User's subscription plan
2. Provider availability
3. Cost optimization
4. Fallback strategy

**Routing Priority**:

```
1. Cache (instant, free)
   ↓
2. Template (instant, free)
   ↓
3. AI Provider (based on plan)
   - Free: OpenRouter free models only
   - Pro: OpenRouter paid + Grok
   - Pro+: Best models with priority
   ↓
4. Fallback to generic explanation
```

**Cost Optimization**:

- Free plan → Free models only
- Pro plan → Mix of free/paid models
- Pro+ plan → Best models available
- Automatic fallback if provider fails

### 4. Usage Tracking (`lib/usage-tracking.ts`)

**Tracks**:

- Every AI request
- Tokens used (input + output)
- Estimated cost
- Provider used
- Feature used

**Usage Record**:

```typescript
{
  userId: string;
  plan: string;
  provider: string;
  model: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  timestamp: Date;
}
```

**Quota Enforcement**:

- Daily limit check
- Monthly limit check
- Soft-fail to templates when quota exceeded

### 5. Response Validation

**Security Guardrails**:

- AI never returns arbitrary content
- Schema validation enforced
- Required fields checked
- Fallback if invalid

**Schema**:

```typescript
{
  title: string
  whatsWrong: string
  whyItMatters: string
  howToFix: string
  whatYouLearn: string
  fixExample?: string
  confidenceNote?: string
}
```

## Data Flow

### Finding → Explanation

```
1. User requests AI explanation
   ↓
2. Check subscription plan
   ↓
3. Check quota (daily/monthly)
   ↓
4. If quota OK:
     ↓
   4a. Check cache
     ↓
   4b. Try template match
     ↓
   4c. Route to AI provider
        - Select provider based on plan
        - Select model based on plan
        - Execute with max token limit
     ↓
   4d. Validate response
     ↓
   4e. Track usage
     ↓
   4f. Return explanation

5. If quota exceeded:
     ↓
   5a. Return template-only
     ↓
   5b. Show upgrade prompt
```

## Subscription Comparison

| Feature                | Free         | Pro               | Pro+              |
| ---------------------- | ------------ | ----------------- | ----------------- |
| **Scanning**           | ✅ Unlimited | ✅ Unlimited      | ✅ Unlimited      |
| **Basic Explanations** | ✅ Yes       | ✅ Yes            | ✅ Yes            |
| **AI Explanations**    | 5/day        | 150/month         | 500/month         |
| **AI Models**          | Free only    | Free + Paid       | All models        |
| **Providers**          | OpenRouter   | OpenRouter + Grok | OpenRouter + Grok |
| **Max Tokens**         | 500          | 1000              | 2000              |
| **AI Chat**            | ❌           | ✅                | ✅                |
| **Fix Suggestions**    | ❌           | ✅                | ✅                |
| **Deep Analysis**      | ❌           | ✅                | ✅                |
| **Scan History**       | ❌           | ✅                | ✅                |
| **Advanced Reports**   | ❌           | ✅                | ✅                |
| **Priority AI**        | ❌           | ❌                | ✅                |
| **AI Budget**          | $0           | $5/mo             | $20/mo            |

## Cost Optimization Strategies

### 1. Template-First Architecture

- 90% of requests use templates (free)
- Only 10% need AI (when no template exists)

### 2. Caching

- AI responses cached by finding type
- Prevents duplicate API calls
- Reduces costs significantly

### 3. Intelligent Model Selection

- Free users → Free models
- Pro users → Mix (cost-effective)
- Pro+ users → Best models

### 4. Provider Fallback

- If OpenRouter fails → Try Grok
- If all fail → Use template/generic

### 5. Token Limits

- Free: 500 tokens max
- Pro: 1000 tokens max
- Pro+: 2000 tokens max

### 6. Quota Enforcement

- Hard limits per plan
- Soft-fail to templates (not hard error)
- User sees explanation either way

## Extensibility

### Adding New Providers

1. Implement `AIProvider` interface:

```typescript
class NewProvider implements AIProvider {
  name = 'new-provider'
  generateExplanation(...) { ... }
  isAvailable() { ... }
  estimateCost(...) { ... }
}
```

2. Register in `AIProviderRegistry`:

```typescript
const provider = new NewProvider();
if (provider.isAvailable()) {
  this.providers.set("new-provider", provider);
}
```

3. Update subscription plans:

```typescript
allowedProviders: ["openrouter", "groq", "new-provider"];
```

### Adding New Plans

1. Define plan in `subscription.ts`:

```typescript
enterprise: {
  id: 'enterprise',
  name: 'VettCode Enterprise',
  dailyAIRequestLimit: 1000,
  monthlyAIRequestLimit: 10000,
  // ... features
}
```

2. Update UI to show new plan

### Adding New Features

1. Add feature flag to `SubscriptionPlan`:

```typescript
features: {
  // existing features...
  newFeature: boolean;
}
```

2. Check feature in code:

```typescript
if (hasFeature(plan, "newFeature")) {
  // Enable feature
}
```

## Monitoring

### Key Metrics

1. **AI Usage**:
   - Requests per plan
   - Tokens per request
   - Cost per user
   - Cost per plan

2. **Provider Health**:
   - Success rate
   - Latency
   - Error rate
   - Fallback frequency

3. **Cache Performance**:
   - Hit rate
   - Miss rate
   - Cache size

4. **User Behavior**:
   - Quota hit rate
   - Upgrade conversion
   - Feature adoption

### API Endpoints

```
GET /api/usage?userId=X
  → User's usage analytics

GET /api/admin/analytics
  → System-wide analytics (admin only)

POST /api/explain
  → Generate AI explanation

POST /api/upload
  → Upload scan result to ImageKit
```

## Security

### API Keys

- All keys server-side only
- Never exposed to client
- Managed via environment variables

### Rate Limiting

- Per-user quotas enforced
- Prevent abuse
- Soft-fail gracefully

### Response Validation

- AI outputs validated
- Schema enforcement
- Fallback if invalid

### Usage Tracking

- All AI requests logged
- Cost tracking
- Audit trail

## Future Enhancements

1. **Database Integration**:
   - Replace in-memory usage store
   - PostgreSQL or MongoDB
   - Persistent usage history

2. **Payment Integration**:
   - Stripe for subscriptions
   - Automatic plan upgrades
   - Usage-based billing

3. **Team Features**:
   - Organization accounts
   - Shared quotas
   - Team analytics

4. **Self-Hosted Models**:
   - Ollama integration
   - Zero-cost AI option
   - Privacy-first option

5. **Advanced Analytics**:
   - Historical trends
   - Project comparisons
   - Security scoring

6. **Multi-Language**:
   - i18n support
   - Localized explanations
   - Regional AI models

## Development

### Environment Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

### Testing AI Providers

```bash
# Test with free models (no API key needed)
OPENROUTER_API_KEY=test npm run dev

# Test with real providers
OPENROUTER_API_KEY=sk-or-... npm run dev
GROQ_API_KEY=gsk_... npm run dev
```

### Monitoring Costs

```bash
# View usage in console logs
# Check /api/usage endpoint
# Monitor provider dashboards
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Key Points**:

1. Set all environment variables in Vercel
2. Enable Redis for caching (optional)
3. Set up database for usage tracking
4. Configure monitoring/alerts
5. Set up payment processing (Stripe)

## Summary

VettCode Web Dashboard uses a **sophisticated AI routing architecture** that:

✅ **Optimizes costs** - Templates first, AI when valuable  
✅ **Ensures reliability** - Multiple providers with fallback  
✅ **Enforces quotas** - Fair usage per plan tier  
✅ **Tracks everything** - Usage, costs, performance  
✅ **Validates responses** - Safe, structured AI outputs  
✅ **Scales infinitely** - Architecture supports any user volume

The user **never needs to know** which provider was used. They just get great security explanations! 🎯
