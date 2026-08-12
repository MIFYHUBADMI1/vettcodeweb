# VettCode Web - Scan Detail Page Upgrade Audit

## Date: August 12, 2026

## Status: PHASE 0 COMPLETE - AUDIT FINISHED

---

## 1. EXISTING ARCHITECTURE DISCOVERED

### ✅ AI Implementation EXISTS

- **AI Router:** `lib/ai-router.ts` - Intelligent provider selection with fallback
- **AI Providers:** `lib/ai-providers.ts` - OpenRouter + Groq implementations
- **Model Registry:** `lib/model-registry.ts` - 13 models across 4 tiers
- **Templates:** `lib/templates.ts` - Offline explanation templates
- **Usage Tracking:** `lib/usage-tracking.ts` - Cost tracking and quota enforcement

### ✅ Provider Abstraction EXISTS

```
AIRouter
  ├── Cache (deduplication)
  ├── Template matching (instant, free)
  └── AI Providers
      ├── OpenRouter (13 models)
      └── Groq (ultra-fast inference)
```

### ✅ Subscription/Quota System EXISTS

- Free tier: Tier 1 models (free), 10 daily requests
- Pro tier: Tier 1-2 models, 50 daily requests
- Pro Plus tier: Tier 1-3 models, 200 daily/monthly requests

### ✅ Current Scan Detail Page

**File:** `app/dashboard/scans/[scanId]/page.tsx`

**Current Features:**

- Fetches scan via `useScan(scanId)` hook
- Displays header with back button
- Shows severity summary (5 cards: Critical/High/Medium/Low/Info)
- Lists ALL findings (no pagination)
- Basic finding cards with severity/category badges
- Expandable metadata details

**Current Problems:**

- ❌ Renders ALL findings at once (can be 46+)
- ❌ No pagination
- ❌ No search/filter
- ❌ No priority section
- ❌ No security score
- ❌ No AI explanations
- ❌ No grouping by type
- ❌ No confidence display
- ❌ Overwhelming for beginners

---

## 2. REPORT DATA STRUCTURE

### Available Fields:

```typescript
interface ScanDetail {
  id: string;
  scanPath: string;
  timestamp: string;
  sensorsUsed: string[];
  sensorsSkipped: string[];
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  scanData: {
    findings: Finding[];
  };
  createdAt: string;
}

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
    [key: string]: any;
  };
}
```

### Fields NOT Available:

- ❌ Security score (0-100) - needs to be calculated
- ❌ Scan duration
- ❌ Files scanned count
- ❌ Verification status
- ❌ Deduplication groups

---

## 3. AI COACH INTEGRATION PLAN

### API Endpoint (NEW)

**Create:** `app/api/explain/route.ts`

**Request:**

```typescript
POST /api/explain
{
  finding: Finding,
  scanId?: string
}
```

**Response:**

```typescript
{
  explanation: Explanation,
  source: 'template' | 'ai',
  provider?: string,
  model?: string,
  quotaInfo?: {
    allowed: boolean,
    remaining?: number,
    reason?: string
  }
}
```

### Secret Redaction (CRITICAL)

**Create:** `lib/secret-redaction.ts`

**Rules:**

- Redact actual secret values before sending to AI
- Keep: secret type, file, line, category
- Remove: actual credential/token/password
- Example: `AKIA••••••••••••••`

### Caching Strategy

1. Template match (instant, free) - priority
2. Check cache for identical findings
3. AI request (user-initiated only)
4. Cache successful AI responses
5. Fall back to generic explanation on error

---

## 4. SECURITY SCORE CALCULATION

### Algorithm (NEW)

**Create:** `lib/security-score.ts`

```typescript
function calculateSecurityScore(scan: ScanDetail): {
  score: number; // 0-100
  status: "SECURE" | "GOOD" | "NEEDS_ATTENTION" | "HIGH_RISK" | "CRITICAL_RISK";
  description: string;
} {
  let score = 100;

  // Deduct points by severity
  score -= scan.criticalCount * 15;
  score -= scan.highCount * 8;
  score -= scan.mediumCount * 3;
  score -= scan.lowCount * 1;
  score -= scan.infoCount * 0.5;

  score = Math.max(0, Math.min(100, score));

  // Determine status
  let status;
  if (scan.criticalCount > 0) status = "CRITICAL_RISK";
  else if (scan.highCount > 5) status = "HIGH_RISK";
  else if (scan.highCount > 0 || scan.mediumCount > 5)
    status = "NEEDS_ATTENTION";
  else if (scan.mediumCount > 0 || scan.lowCount > 0) status = "GOOD";
  else status = "SECURE";

  return { score, status, description };
}
```

---

## 5. FINDING GROUPING

### Strategy

Group by: `category` + `metadata.ruleId` or `title`

Example:

```
Exposed Secrets (8 findings)
├── Exposed AWS Credentials (3)
├── Exposed API Keys (3)
└── Hardcoded Passwords (2)

SQL Injection (4 findings)
Command Injection (3 findings)
```

---

## 6. PRIORITY RANKING

### Algorithm

**Create:** `lib/finding-prioritizer.ts`

```typescript
function prioritizeFinding(finding: Finding): number {
  let priority = 0;

  // Severity weight
  const severityWeight = {
    CRITICAL: 100,
    HIGH: 50,
    MEDIUM: 20,
    LOW: 5,
    INFO: 1,
  };
  priority += severityWeight[finding.severity];

  // Confidence boost
  if (finding.confidence && finding.confidence >= 0.85) {
    priority *= 1.5;
  }

  // Category boost (secrets are urgent)
  if (finding.category === "SECRET") {
    priority *= 2;
  }

  return priority;
}
```

---

## 7. COMPONENT ARCHITECTURE

### New Components to Create:

1. **`components/scan-detail/SecurityScoreCard.tsx`**
   - Displays score, status, severity distribution
   - Beginner-friendly explanation

2. **`components/scan-detail/VettCodeSummary.tsx`**
   - AI-generated scan summary (optional, user-initiated)
   - "What matters most" section
   - Priority findings overview

3. **`components/scan-detail/PriorityFindings.tsx`**
   - Top 3-5 grouped findings
   - Quick navigation to full list

4. **`components/scan-detail/FindingExplorer.tsx`**
   - Search bar
   - Filter buttons (All/Critical/High/Medium/Low/Info)
   - Paginated finding list
   - Shows 10 per page

5. **`components/scan-detail/FindingCard.tsx`**
   - Enhanced finding display
   - Severity, category, confidence badges
   - Expandable details
   - AI coach actions

6. **`components/scan-detail/FindingDetail.tsx`**
   - Modal/drawer for full finding details
   - Evidence section
   - AI explanation section
   - Remediation guidance

7. **`components/scan-detail/AICoach.tsx`**
   - Explain button
   - Why Dangerous button
   - How to Fix button
   - Teach Me button (future)
   - Ask Question (future)

### Updated Page Structure:

```
/dashboard/scans/[scanId]
├── Header (back button, refresh)
├── SecurityScoreCard
├── VettCodeSummary (optional AI)
├── PriorityFindings
├── FindingExplorer
│   ├── Search
│   ├── Filters
│   ├── Paginated List
│   └── Pagination Controls
└── FindingDetail Modal/Drawer
    ├── Finding Info
    ├── Evidence
    └── AICoach Actions
```

---

## 8. API CHANGES NEEDED

### New Endpoints:

1. **`/api/explain` (POST)**
   - Generate AI explanation for finding
   - Enforces quota
   - Returns template or AI response
   - Handles secret redaction

2. **`/api/scans/[scanId]/summary` (POST)** (Optional)
   - Generate scan-level AI summary
   - User-initiated only
   - More expensive, requires higher tier

### No Changes Needed:

- ✅ `/api/scans/[scanId]` - Already works perfectly
- ✅ TanStack Query caching - Already implemented
- ✅ User ownership verification - Already implemented

---

## 9. PERFORMANCE STRATEGY

### Pagination

- Default: 10 findings per page
- Client-side pagination (data already loaded)
- Preserve search/filter state

### Lazy Loading

- AI explanations: on-demand only
- Code context: load when expanded
- No auto-fetch for 46 findings

### Caching

- Reuse existing TanStack Query
- Cache AI explanations per finding
- Cache search/filter results in component state

---

## 10. SECRET REDACTION IMPLEMENTATION

### Rules:

1. Detect category === 'SECRET'
2. Redact `finding.message` if contains actual secret
3. Replace with: `[REDACTED]` or `AKIA••••••••••••••`
4. Send only metadata to AI:
   - Secret type (API key, password, token)
   - File location
   - Line number
   - Confidence
5. NEVER send actual credential value

---

## 11. MOBILE RESPONSIVE STRATEGY

### Desktop (1024px+):

- Two-column layout where appropriate
- Finding detail as side panel

### Tablet (768px-1024px):

- Single column
- Finding detail as full-width panel

### Mobile (320px-768px):

- Single column
- Finding detail as bottom drawer or full page
- Collapsible filter section
- Sticky pagination

---

## 12. ACCESSIBILITY

### Requirements:

- ✅ Semantic HTML (`<header>`, `<main>`, `<article>`)
- ✅ ARIA labels for all interactive elements
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus management for modals/drawers
- ✅ Severity communicated via text + icon (not color alone)
- ✅ Screen reader announcements for AI loading

---

## 13. IMPLEMENTATION PHASES

### Phase 1: Core Improvements (No AI)

1. ✅ Add security score calculation
2. ✅ Implement pagination (10 per page)
3. ✅ Add search functionality
4. ✅ Add filter buttons
5. ✅ Create finding priority section
6. ✅ Group findings by category/type
7. ✅ Enhanced finding cards

**Estimated Time:** 4-6 hours
**Impact:** High (makes 46-finding reports manageable)

### Phase 2: AI Coach Integration

1. ✅ Create `/api/explain` endpoint
2. ✅ Implement secret redaction
3. ✅ Add AI coach buttons to findings
4. ✅ Create explanation modal/drawer
5. ✅ Handle quota exceeded gracefully

**Estimated Time:** 3-4 hours
**Impact:** Very High (educational value)

### Phase 3: Polish & Advanced Features

1. ✅ Scan-level AI summary
2. ✅ Finding detail modal
3. ✅ Code context display
4. ✅ Mobile optimization
5. ✅ Accessibility audit

**Estimated Time:** 2-3 hours
**Impact:** Medium (UX polish)

---

## 14. SECURITY AUDIT CHECKLIST

Before deployment, verify:

- [ ] No actual secrets sent to AI
- [ ] User ownership verified on all API calls
- [ ] Quota enforced before AI requests
- [ ] Cache cleared on logout
- [ ] No client-side secret storage
- [ ] AI responses sanitized
- [ ] Error messages don't leak sensitive data
- [ ] HTTPS only for AI requests

---

## 15. TESTING CHECKLIST

Test with:

- [ ] 0 findings (clean scan)
- [ ] 1 finding
- [ ] 5 findings
- [ ] 10 findings (1 page)
- [ ] 46 findings (5 pages)
- [ ] 100+ findings
- [ ] Mixed severities
- [ ] Critical-only scan
- [ ] SECRET category findings
- [ ] Findings with high confidence
- [ ] Findings with low confidence
- [ ] AI quota exceeded
- [ ] AI provider timeout
- [ ] AI provider error
- [ ] Mobile (320px)
- [ ] Tablet (768px)
- [ ] Desktop (1440px)
- [ ] Keyboard navigation
- [ ] Screen reader
- [ ] Logout/login
- [ ] Unauthorized scan ID

---

## 16. NO CHANGES NEEDED (EXISTING WORKS)

### DO NOT MODIFY:

- ✅ `/api/scans/[scanId]` - Perfect as-is
- ✅ `useScan()` hook - Working correctly
- ✅ TanStack Query caching - Already implemented
- ✅ User authentication - Working
- ✅ Ownership verification - Server-side checked
- ✅ CLI upload pipeline - Not touching
- ✅ Report JSON schema - Using as-is
- ✅ ImageKit integration - Not relevant here

### EXTEND (NOT REPLACE):

- ✅ AI Router - Use existing
- ✅ AI Providers - Use existing OpenRouter/Groq
- ✅ Model Registry - Use existing 13 models
- ✅ Template system - Use existing templates
- ✅ Usage tracking - Use existing

---

## 17. RECOMMENDED IMPLEMENTATION ORDER

### Step 1: Security Score & Prioritization (No API changes)

- Add `lib/security-score.ts`
- Add `lib/finding-prioritizer.ts`
- Update page to show score
- Group findings by category
- Sort by priority

### Step 2: Pagination & Search (Client-side)

- Add search state
- Add filter state
- Implement client-side pagination
- Add pagination controls

### Step 3: AI Coach Backend

- Add `app/api/explain/route.ts`
- Add `lib/secret-redaction.ts`
- Test with Postman/curl

### Step 4: AI Coach Frontend

- Add AI coach buttons
- Create explanation modal
- Handle loading/error states
- Display quota status

### Step 5: Polish

- Mobile responsive
- Accessibility
- Loading skeletons
- Error boundaries

---

## 18. SUCCESS METRICS

### Before:

- 46 findings rendered at once
- No pagination
- No search/filter
- No AI assistance
- Overwhelming for beginners

### After:

- 10 findings per page (5 pages)
- Search + 5 filter options
- Priority findings highlighted
- AI explanations on-demand
- Beginner-friendly language
- Educational experience

---

## PHASE 0 AUDIT: ✅ COMPLETE

**Ready to proceed with implementation.**

**Recommendation:** Start with Phase 1 (Core Improvements) since it provides immediate value without requiring AI API setup.
