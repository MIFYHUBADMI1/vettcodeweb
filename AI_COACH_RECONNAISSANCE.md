# VettCode AI Coach - Codebase Reconnaissance Report

## PHASE 1: WHAT EXISTS

### ✅ Authentication & Authorization

- **NextAuth** implementation in `/lib/auth.ts`
- Session management with MongoDB adapter
- CLI authentication via `/lib/cli-auth.ts`
- Server-side session checks in API routes

### ✅ Scan Architecture

**Data Model** (`/lib/models/Scan.ts`):

```typescript
interface Scan {
  _id: ObjectId;
  userId: string;
  scanPath: string;
  timestamp: Date;
  sensorsUsed: string[];
  sensorsSkipped: string[];
  totalFindings: number;
  criticalCount;
  highCount;
  mediumCount;
  lowCount;
  infoCount: number;
  scanData: ScanResult; // Full scan JSON
  imagekitUrl?: string;
  createdAt;
  updatedAt: Date;
}
```

**API Endpoints**:

- `GET /api/scans` - List user's scans
- `GET /api/scans/[scanId]` - Get single scan detail
- User ownership verification implemented server-side

**Data Fetching** (`/lib/hooks/useScans.ts`):

- Centralized TanStack Query hooks
- 5-minute caching strategy
- `useScans()` - List scans
- `useScan(scanId)` - Single scan
- `useRefreshScan()` - Manual refresh
- Query keys in `/lib/query-config.ts`

### ✅ Finding Schema (`/lib/types.ts`)

```typescript
interface Finding {
  id: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  category: "CODE" | "SECRET" | "DEPENDENCY" | "CONFIG";
  title: string;
  message: string;
  file: string;
  line: number;
  column?: number;
  confidence?: number;
  confidenceLabel?: string;
  fingerprint?: string;
  metadata: {
    ruleId?: string;
    cwe?: string[];
    owasp?: string[];
    references?: string[];
  };
}
```

### ✅ AI Provider Architecture (EXISTING - DO NOT REBUILD)

**AI Router** (`/lib/ai-router.ts`):

- Intelligent provider selection (OpenRouter + Groq)
- Model registry integration
- Template fallback when AI unavailable
- Caching layer
- Cost estimation
- Quota enforcement

**Providers** (`/lib/ai-providers.ts`):

- **OpenRouterProvider** - Multiple models including free ones
- **GroqProvider** - Ultra-fast inference
- Both support structured JSON responses
- Cost tracking per provider/model

**Model Registry** (`/lib/model-registry.ts`):

- 13 models across 4 tiers
- Tier 1: Free models (Gemma, Llama)
- Tier 2: Low-cost (Claude Haiku, GPT-4o Mini)
- Tier 3: Advanced (Llama 70B, Claude Sonnet)
- Tier 4: Premium (Claude Opus, GPT-4o)
- Capability tags: explanation, code_analysis, fix_generation, reasoning, security, multi_file, mentor

**Current AI Function** (`/lib/ai.ts`):

- `generateAIExplanation(finding, userId)` - For single finding explanations
- Subscription-aware routing
- Quota checking
- Returns: explanation, source (template|ai), provider, model, duration

**Quota System** (`/lib/usage-tracking.ts` + `/lib/subscription.ts`):

- Free: 5 AI requests/day
- Pro: 150 requests/month
- Pro+: 500 requests/month
- Daily and monthly limits enforced
- Cost tracking per user

**Secret Redaction** (`/lib/secret-redaction.ts`):

- ALREADY IMPLEMENTED
- Detects SECRET category findings
- Redacts AWS keys, GitHub tokens, API keys, passwords, JWT tokens, private keys
- Never sends actual secrets to AI

### ✅ Existing AI Implementation (Phase 2)

- `/api/explain` - AI explanation endpoint (single finding)
- FindingDetailModal - Modal with AI coach for individual findings
- AIExplanation component - Displays AI explanations
- Template-based fallbacks (13+ templates in `/lib/templates.ts`)

### ✅ UI Components & Branding

- Dark theme with purple/indigo accents
- VettCode brand identity
- Professional security-focused design
- Dashboard layout in `/components/dashboard/DashboardLayout.tsx`
- Security score calculator (`/lib/security-score.ts`)
- Grade system (A-F) with reasoning

### ✅ Current Pages

- `/dashboard` - Main dashboard
- `/dashboard/scans` - Scan list with filters/search
- `/dashboard/scans/[scanId]` - Individual scan report
  - Security score card
  - VettCode summary
  - Priority findings
  - Finding explorer (search, filter, pagination)
  - Finding detail modal with AI coach

---

## PHASE 2: WHAT NEEDS TO BE BUILT

### 🆕 VettCode Coach - Scan-Aware AI Overview

**Route**: `/dashboard/scans/[scanId]/ai`

**Purpose**: Scan-level AI security coach (NOT individual finding explanations)

**Key Differences from Existing AI**:
| Existing (Phase 2) | New (AI Coach) |
|---|---|
| Per-finding explanations | Scan-level overview |
| Modal popup | Full page |
| One-shot Q&A | Conversational chat |
| Template-first | AI-first with context |
| Static prompts | Dynamic quick actions |
| No conversation memory | Stateful conversation |
| Explains single finding | Understands entire scan |

**New Components Needed**:

1. Scan AI page (`/app/dashboard/scans/[scanId]/ai/page.tsx`)
2. Conversation API (`/app/api/scans/[scanId]/chat/route.ts`)
3. AI Coach prompt system (scan-aware)
4. Quick action generator (dynamic based on scan)
5. Conversation state management
6. Chat UI components
7. Teaching mode system
8. Remediation plan generator

**DO NOT DUPLICATE**:

- ❌ AI provider architecture (USE EXISTING)
- ❌ Model registry (USE EXISTING)
- ❌ Quota system (USE EXISTING)
- ❌ Secret redaction (USE EXISTING)
- ❌ Scan data fetching (USE EXISTING `useScan()`)
- ❌ Authentication (USE EXISTING)
- ❌ Finding schema (USE EXISTING)

**EXTEND**:

- ✅ New AI function: `generateScanOverview(scan, userId)`
- ✅ New AI function: `generateChatResponse(scan, conversation, message, userId)`
- ✅ New API endpoint: `/api/scans/[scanId]/chat`
- ✅ New route: `/dashboard/scans/[scanId]/ai`
- ✅ New components for conversational UI

---

## PHASE 3: ARCHITECTURE PLAN

### Context Management Strategy

```typescript
interface ConversationContext {
  scanId: string;
  scanSummary: {
    totalFindings: number;
    criticalCount;
    highCount;
    mediumCount;
    lowCount;
    infoCount: number;
    categories: string[];
    score: number;
    grade: string;
  };
  priorityFindings: Finding[]; // Top 5-10 findings
  conversationHistory: Message[];
  currentFocus?: Finding; // If discussing specific finding
}
```

### Message Flow

1. User opens `/dashboard/scans/[scanId]/ai`
2. Page loads scan via existing `useScan()` hook
3. Display immediate scan summary (NO AI call)
4. Show dynamic quick actions based on scan content
5. User clicks quick action OR types custom message
6. POST to `/api/scans/[scanId]/chat` with:
   - message
   - conversation history (last 5-10 messages)
   - scanId (for context lookup)
7. Server constructs context:
   - If first message: include scan summary
   - If follow-up: include relevant context based on message
   - If about specific finding: include finding details
8. Call AI provider via existing `AIRouter`
9. Return streaming or complete response
10. Update conversation state

### Quick Action Generation

Dynamic based on scan content:

```typescript
function generateQuickActions(scan: ScanDetail): string[] {
  const actions = ["What should I fix first?"];

  if (scan.criticalCount > 0) {
    actions.push("Explain my critical issues");
  }

  // Check categories
  const hasSecrets = scan.scanData.findings.some(
    (f) => f.category === "SECRET",
  );
  const hasSQLi = scan.scanData.findings.some(
    (f) =>
      f.title.toLowerCase().includes("sql") ||
      f.metadata.ruleId?.includes("sql"),
  );

  if (hasSecrets) {
    actions.push("Teach me about exposed secrets");
  }
  if (hasSQLi) {
    actions.push("Explain SQL injection risks");
  }

  actions.push("Create a fix plan for me");
  actions.push("Help me learn from this scan");

  return actions;
}
```

### Cost Control

- **ONE** scan overview on page load (optional, can be skipped)
- User-initiated chat only (NO automatic AI for all findings)
- Conversation context kept minimal (5-10 messages max)
- Quota enforcement via existing system
- Cache common questions per scan

---

## PHASE 4: IMPLEMENTATION CHECKLIST

### Server-Side

- [ ] Create `/app/api/scans/[scanId]/chat/route.ts`
- [ ] Implement scan-aware context builder
- [ ] Create conversation prompt system
- [ ] Add conversation history management
- [ ] Extend AI router for chat completion
- [ ] Add scan ownership verification
- [ ] Implement streaming response (optional)

### Client-Side

- [ ] Create `/app/dashboard/scans/[scanId]/ai/page.tsx`
- [ ] Build chat UI components
- [ ] Implement conversation state
- [ ] Create quick action buttons
- [ ] Add teaching mode interface
- [ ] Build remediation plan display
- [ ] Add loading/error states
- [ ] Implement scroll management
- [ ] Add "AI Overview" button to scan detail page

### AI Prompts

- [ ] Scan overview system prompt
- [ ] Chat conversation system prompt
- [ ] Teaching mode prompts
- [ ] Remediation plan prompts
- [ ] Context injection templates

### Testing

- [ ] 0 findings scan
- [ ] 1 finding scan
- [ ] 50+ findings scan
- [ ] Critical findings
- [ ] Secret findings
- [ ] Mixed categories
- [ ] Conversation follow-up
- [ ] Custom questions
- [ ] False positive discussion
- [ ] Quota exceeded
- [ ] AI provider failure
- [ ] Unauthorized access

---

## READY TO PROCEED

**CONFIRMED**:
✅ Existing AI architecture discovered and understood
✅ Scan data model documented
✅ Finding schema documented
✅ Authentication system verified
✅ No duplicates will be created
✅ Extension points identified
✅ Cost controls understood
✅ Secret redaction already implemented

**NEXT STEP**: Begin implementation of VettCode AI Coach
