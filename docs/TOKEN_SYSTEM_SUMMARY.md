# VettCode Token-Based Usage System

## Overview

VettCode uses a token-based system instead of request limits. This provides flexibility while ensuring fair usage.

---

## Token Allocation by Plan

### Free Plan

- **15,000 tokens/month**
- **500 tokens/day** (15,000 ÷ 30 days)
- Tokens **RESET** to 15,000 on the 1st of each month
- Daily limit enforced (except last day of month)
- Access to Tier 1 models only

### Pro Plan ($19/month)

- **100,000 tokens/month**
- **No daily limits**
- Tokens **TOP UP** monthly (accumulate, don't reset)
- Access to Tier 1-3 models

### Pro+ Plan ($49/month)

- **500,000 tokens/month**
- **No daily limits**
- Tokens **TOP UP** monthly (accumulate, don't reset)
- Access to all model tiers (1-4)

---

## Token Costs Per Request

These costs are **internal** and not shown to users (documented separately):

| Model Tier           | Tokens Per Request | Available To |
| -------------------- | ------------------ | ------------ |
| Tier 1 (Free models) | 50 tokens          | All users    |
| Tier 2 (Paid models) | 200 tokens         | Pro & Pro+   |
| Tier 3 (Advanced)    | 300 tokens         | Pro & Pro+   |
| Tier 4+ (Premium)    | 500 tokens         | Pro+ only    |

---

## Usage Examples

### Free User (15,000 tokens/month, 500/day)

- **Daily**: Up to 10 AI requests with Tier 1 models (50 × 10 = 500 tokens)
- **Monthly**: Up to 300 AI requests (if spread evenly)
- **Last day exception**: Can use ALL remaining tokens on last day of month

### Pro User (100,000 tokens/month)

- **~500 requests** with Tier 2 models (200 × 500 = 100,000)
- **~1,000 requests** with Tier 1 models (50 × 2,000)
- **~333 requests** with Tier 3 models (300 × 333)
- No daily limits, tokens accumulate monthly

### Pro+ User (500,000 tokens/month)

- **~1,000 requests** with Tier 4 models (500 × 1,000)
- **~10,000 requests** with Tier 1 models (50 × 10,000)
- Mix and match as needed
- No daily limits, tokens accumulate monthly

---

## Key Behaviors

### Free Users

1. **Daily Limit Enforcement**
   - Maximum 500 tokens per day
   - Prevents burning through monthly allocation too quickly
   - Resets at midnight

2. **Last Day Exception**
   - On the last day of the month, daily limit is waived
   - Can use all remaining tokens that day

3. **Monthly Reset**
   - Tokens reset to 15,000 on the 1st of each month
   - Unused tokens do NOT carry over

### Paid Users (Pro & Pro+)

1. **No Daily Limits**
   - Use tokens freely throughout the month

2. **Monthly Top-Up**
   - Tokens ADD to existing balance (don't reset)
   - Unused tokens accumulate
   - Example: Pro user with 20,000 remaining gets 100,000 added = 120,000 total

3. **Rollover Benefit**
   - Save tokens for bigger projects
   - Build up reserves over time

---

## Token Deduction Flow

```typescript
// Before AI request
1. Check if new month → Reset/Top-up tokens
2. For free users: Check if new day → Reset daily usage
3. For free users: Check daily limit (unless last day of month)
4. Check overall token balance
5. Deduct tokens if all checks pass

// After AI request
6. Update token balance
7. For free users: Update daily usage counter
8. Track AI usage in analytics
```

---

## User Experience

### Dashboard Display

- Current balance prominently shown
- Progress bar with color coding:
  - Green: 0-50% used
  - Yellow: 51-80% used
  - Red: 81-100% used

### Free Users See:

- Monthly allocation & balance
- Daily limit indicator
- Daily remaining tokens
- "Last day" notification when applicable
- Upgrade prompts when low

### Paid Users See:

- Monthly allocation & balance
- "Tokens top up next month" indicator
- No daily limit warnings
- Accumulation benefits highlighted

---

## Error Messages

### Insufficient Daily Tokens (Free)

```
Daily limit reached (500 tokens/day).
Resets tomorrow or upgrade for unlimited daily usage.
```

### Insufficient Monthly Tokens

```
Insufficient tokens. Upgrade your plan for more tokens.
```

### Upgrade Prompts

```
⚠️ You're running low on tokens.
Upgrade to Pro for 100,000 tokens/month with no daily limits.
```

---

## Implementation Files

### Models

- `lib/models/User.ts` - Token balance, daily usage tracking
- `lib/models/AIUsage.ts` - Usage analytics

### Services

- `lib/subscription.ts` - Plan definitions, token costs
- `lib/ai-router.ts` - Token deduction during AI requests

### API Endpoints

- `app/api/usage/tokens/route.ts` - Fetch token balance

### UI Components

- `app/dashboard/usage/page.tsx` - Usage & Plans page
- `components/dashboard/usage/UsageOverview.tsx` - Token balance display
- `components/dashboard/usage/PlanComparison.tsx` - Plan comparison
- `components/dashboard/EcosystemQuickAccess.tsx` - Quick access cards

---

## Future Enhancements

1. **Token purchase** - Buy additional tokens without upgrading
2. **Usage analytics** - Detailed breakdown by feature/model
3. **Token gifting** - Share tokens with team members
4. **Usage alerts** - Email notifications at 80%, 90%, 95%
5. **Historical charts** - Visualize token usage over time
6. **Recommendations** - Suggest plan based on usage patterns

---

## Notes for Documentation

User-facing documentation should:

- Emphasize **simplicity** ("tokens let you use AI features")
- Show **examples** ("~10 AI chats per day on free plan")
- Highlight **flexibility** ("use tokens when you need them")
- Avoid technical details about token costs per tier
- Focus on **value** ("never waste unused tokens" for paid users)
