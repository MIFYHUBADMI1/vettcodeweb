# VettCode Ecosystem - Implementation Plan

**Date:** February 11, 2026  
**Workspace Scan Completed:** ✅

## 📊 Current State Analysis

### ✅ **Completed Components**

#### 1. **CLI (VettCode Security Scanner)** - PRODUCTION READY

- **Status:** Fully functional, ready to publish to npm
- **Features:**
  - Multi-sensor orchestration (Semgrep, OSV-Scanner, Gitleaks, Trivy)
  - Risk-based prioritization
  - Deduplication and normalization
  - Beautiful terminal UI
  - JSON export functionality
- **Location:** `C:\Users\USER\Desktop\VETTCODE\CLI\`
- **Package:** `vettcode` v1.0.0

#### 2. **WEB Dashboard** - PARTIALLY COMPLETE

- **Status:** Authentication + Dashboard shell ready, missing core features
- **Completed:**
  - ✅ Landing page with ecosystem visualization
  - ✅ Authentication system (NextAuth with Google OAuth + Credentials)
  - ✅ Email verification system
  - ✅ Dashboard layout with sidebar navigation
  - ✅ Sidebar expand/collapse functionality
  - ✅ User profile and session management
  - ✅ Empty state components
- **Missing:**
  - ❌ Scan upload functionality
  - ❌ Scan history/storage
  - ❌ Finding visualization
  - ❌ AI explanation integration
  - ❌ Project management
- **Location:** `C:\Users\USER\Desktop\VETTCODE\WEB\`
- **Tech Stack:** Next.js 14, NextAuth, MongoDB, Tailwind CSS

#### 3. **VIBE-CLI** - EMPTY

- **Status:** Folder exists, no implementation
- **Purpose:** AI coding agent for terminal
- **Location:** `C:\Users\USER\Desktop\VETTCODE\VIBE-CLI\`

#### 4. **VIBE-CODING (VettCode Vibe)** - EMPTY

- **Status:** Folder exists, no implementation
- **Purpose:** AI-powered application creation
- **Location:** `C:\Users\USER\Desktop\VETTCODE\VIBE-CODING\`

#### 5. **WEB-HOST** - EMPTY

- **Status:** Folder exists, no implementation
- **Purpose:** Deployment and hosting layer
- **Location:** `C:\Users\USER\Desktop\VETTCODE\WEB-HOST\`

---

## 🎯 Priority Implementation Plan

### **PHASE 1: Complete WEB Dashboard Core** (HIGHEST PRIORITY)

**Goal:** Make the dashboard actually usable for viewing CLI scan results

**Rationale:** You have a working CLI that generates scan data, but no way to view it in the web dashboard. This is the highest-value connection to make.

#### 1.1 Scan Upload & Storage System

**Time Estimate:** 4-6 hours

**Tasks:**

- [ ] Create scan upload API endpoint (`/api/scans/upload`)
- [ ] Integrate with existing MongoDB for scan storage
- [ ] Create Scan model/schema in `lib/models/Scan.ts`
- [ ] Build upload component with drag-drop + file picker
- [ ] Add scan validation (ensure it's valid VettCode JSON format)
- [ ] Link scans to authenticated user
- [ ] Store scan metadata (timestamp, file count, finding count)

**Files to Create:**

- `WEB/lib/models/Scan.ts` - Scan database schema
- `WEB/app/api/scans/upload/route.ts` - Upload endpoint
- `WEB/components/dashboard/ScanUpload.tsx` - Upload UI component

**Files to Modify:**

- `WEB/app/dashboard/page.tsx` - Add upload area

#### 1.2 Scan History & Listing

**Time Estimate:** 3-4 hours

**Tasks:**

- [ ] Create `/api/scans` GET endpoint to fetch user's scans
- [ ] Build scan list component showing recent scans
- [ ] Add scan metadata display (date, findings count, status)
- [ ] Create `/dashboard/scans` route for scan history page
- [ ] Add pagination for scan history
- [ ] Add delete scan functionality

**Files to Create:**

- `WEB/app/dashboard/scans/page.tsx` - Scan history page
- `WEB/components/dashboard/ScanList.tsx` - List component
- `WEB/components/dashboard/ScanCard.tsx` - Individual scan card

#### 1.3 Scan Detail View & Finding Visualization

**Time Estimate:** 6-8 hours

**Tasks:**

- [ ] Create `/dashboard/scans/[id]` dynamic route
- [ ] Build finding card component (already exists, may need updates)
- [ ] Add severity filtering (Critical, High, Medium, Low)
- [ ] Add category filtering (Code, Dependency, Secret)
- [ ] Build severity chart visualization
- [ ] Add file-based grouping
- [ ] Implement finding detail modal

**Files to Create:**

- `WEB/app/dashboard/scans/[id]/page.tsx` - Scan detail page
- `WEB/components/dashboard/FindingsList.tsx` - Findings display
- `WEB/components/dashboard/SeverityChart.tsx` - Visual chart

**Files to Modify:**

- `WEB/components/FindingCard.tsx` - Update for dashboard integration
- `WEB/components/ExplanationModal.tsx` - Integrate with dashboard

#### 1.4 AI Explanation Integration

**Time Estimate:** 4-5 hours

**Tasks:**

- [ ] Connect existing `/api/explain` endpoint to dashboard
- [ ] Add AI explanation button to each finding
- [ ] Integrate with existing AI router (OpenRouter/Groq)
- [ ] Track usage limits per user plan
- [ ] Add explanation loading states
- [ ] Cache explanations to avoid duplicate API calls

**Files to Modify:**

- `WEB/app/api/explain/route.ts` - Ensure it works with new auth
- `WEB/components/ExplanationModal.tsx` - Update for new design
- Add usage tracking to user model

**Total Phase 1 Time:** ~20-25 hours

---

### **PHASE 2: Project Management** (MEDIUM PRIORITY)

**Goal:** Allow users to organize scans by project

**Time Estimate:** 8-10 hours

**Tasks:**

- [ ] Create Project model/schema
- [ ] Build `/dashboard/projects` page
- [ ] Create project creation flow
- [ ] Link scans to projects
- [ ] Add project-level security overview
- [ ] Build project detail page with scan history

**Why Later:** Projects are organizational, not functional. Users can use the dashboard without projects, but not without viewing scans.

---

### **PHASE 3: Enhanced Features** (LOWER PRIORITY)

**Goal:** Add polish and advanced features

**Time Estimate:** 15-20 hours

**Tasks:**

- [ ] Export reports (PDF/HTML)
- [ ] Trend analysis across scans
- [ ] Security score calculation
- [ ] Remediation tracking (mark findings as fixed)
- [ ] Comparison between scans
- [ ] Email notifications for scan results
- [ ] API keys for automated uploads
- [ ] GitHub/GitLab integration

---

### **PHASE 4: VettCode Vibe (AI App Creation)** (FUTURE)

**Goal:** Build the AI-powered application creation tool

**Status:** Not started. Empty folder.

**Decision Needed:**

- What exactly is VettCode Vibe?
- Is it a VS Code extension?
- A web-based IDE?
- A CLI tool with AI chat?

**Recommendation:** Define requirements before building

---

### **PHASE 5: Vibe CLI (AI Coding Agent)** (FUTURE)

**Goal:** Terminal-based AI coding assistant

**Status:** Not started. Empty folder.

**Similar to:** GitHub Copilot CLI, Cursor AI

**Recommendation:** Define scope and differentiation from existing tools

---

### **PHASE 6: Web Host (Deployment Platform)** (FUTURE)

**Goal:** One-click deployment for VettCode-scanned projects

**Status:** Not started. Empty folder.

**Similar to:** Vercel, Netlify, Railway

**Recommendation:** Significant undertaking. Consider partnering with existing platform first.

---

## 🚀 Immediate Next Steps (Start Here)

### **Step 1: Fix WEB Dashboard Scan Integration** ⭐ START HERE

**What to build:**

1. **Scan Upload Page Component** - Replace empty dashboard with actual upload
2. **Scan Storage** - MongoDB schema for storing scan results
3. **Scan List** - Show user's uploaded scans
4. **Scan Detail** - View findings from a specific scan

**Why this first:**

- CLI already generates perfect JSON output
- Dashboard already has auth and layout
- This creates immediate value: CLI → Web workflow
- Everything else builds on this foundation

### **Step 2: Connect AI Explanations**

**What to build:**

- Link existing `/api/explain` to dashboard
- Add "Explain" button to each finding
- Use existing AI router (OpenRouter/Groq)

**Why second:**

- AI explanations are a key differentiator
- API already exists, just needs integration
- Adds educational value immediately

### **Step 3: Project Organization**

**What to build:**

- Project model and CRUD operations
- Link scans to projects
- Project dashboard page

**Why third:**

- Helps organize multiple scans
- Better UX for ongoing projects
- Foundation for team features later

---

## 📁 Suggested File Structure (Phase 1)

```
WEB/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard (update with upload)
│   │   ├── scans/
│   │   │   ├── page.tsx          # Scan history list
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Scan detail view
│   │   └── projects/
│   │       └── page.tsx          # (Phase 2)
│   └── api/
│       ├── scans/
│       │   ├── route.ts          # GET user scans
│       │   └── upload/
│       │       └── route.ts      # POST new scan
│       └── explain/
│           └── route.ts          # (already exists)
├── lib/
│   └── models/
│       ├── User.ts               # (already exists)
│       ├── Scan.ts               # NEW - Scan schema
│       └── Project.ts            # (Phase 2)
└── components/
    └── dashboard/
        ├── DashboardLayout.tsx   # (already exists)
        ├── ScanUpload.tsx        # NEW - Upload UI
        ├── ScanList.tsx          # NEW - List scans
        ├── ScanCard.tsx          # NEW - Scan card
        ├── FindingsList.tsx      # NEW - Display findings
        ├── SeverityChart.tsx     # NEW - Visual chart
        └── ...
```

---

## 🎯 Success Metrics

**Phase 1 Complete When:**

- ✅ User can upload CLI scan JSON from dashboard
- ✅ User can view list of their past scans
- ✅ User can click into a scan and see all findings
- ✅ User can click "Explain" on a finding and get AI explanation
- ✅ User can filter findings by severity/category
- ✅ Scans are stored in MongoDB with user association

**ROI:** Complete CLI → Web workflow. CLI becomes 10x more valuable because results persist and are shareable.

---

## 💡 Key Technical Decisions

### Database Schema Design

**Scan Model:**

```typescript
{
  userId: ObjectId,           // Link to user
  projectId?: ObjectId,       // Optional project link (Phase 2)
  fileName: string,           // Original upload filename
  scanDate: Date,             // When scan was run
  uploadDate: Date,           // When uploaded to web
  findings: Finding[],        // Array of findings from CLI
  metadata: {
    totalFindings: number,
    criticalCount: number,
    highCount: number,
    mediumCount: number,
    lowCount: number,
    sensors: string[],        // Which sensors ran
    fileCount: number         // How many files scanned
  },
  rawData: object            // Complete CLI output
}
```

### Storage Strategy

**Option A: MongoDB Only** (RECOMMENDED)

- Store scan JSON directly in MongoDB
- Pros: Simple, no additional services, faster queries
- Cons: Large documents if many findings
- **Decision:** Start with this. MongoDB handles this fine.

**Option B: MongoDB + ImageKit**

- Store metadata in MongoDB, full JSON in ImageKit
- Pros: Offload storage, better for huge scans
- Cons: Two services, slower to retrieve
- **Decision:** Add later if needed

### AI Explanation Strategy

**Current Setup:**

- OpenRouter (primary) - Multiple models including free tier
- Groq (secondary) - Fast inference
- Both already configured in `lib/ai-router.ts`

**Usage Limits:**

- Free plan: 5 explanations/day
- Pro plan: 150/month
- Track in User model: `aiUsage.count` and `aiUsage.lastReset`

---

## 🚧 Blockers & Dependencies

### Current Blockers: NONE ✅

- Authentication works
- Database connected
- AI providers configured
- Dashboard shell complete

### External Dependencies:

- MongoDB Atlas (already configured)
- OpenRouter API (already configured)
- Groq API (already configured)

---

## 📋 Definition of Done - Phase 1

### User Story:

**As a developer using VettCode CLI,**  
**I want to upload my scan results to the web dashboard,**  
**So that I can view findings with AI explanations and track security over time.**

### Acceptance Criteria:

1. User can drag-drop or select JSON file to upload
2. Upload validates JSON format before storing
3. Scan appears in user's scan history immediately
4. User can click scan to view all findings
5. Findings display severity, category, file, line number
6. User can filter/sort findings
7. User can click "Explain" to get AI-powered explanation
8. AI usage counts against user's plan limits
9. Scans persist across sessions
10. Multiple scans can be uploaded and compared

---

## 🎬 Let's Start Building!

**Recommended Starting Point:**

1. **Create Scan Model** - Define the database schema
2. **Build Upload API** - Handle scan uploads
3. **Create Upload Component** - UI for uploading
4. **Test End-to-End** - CLI → Upload → View

Would you like me to start with **Step 1: Create the Scan Model and Upload API**?

I can implement:

- `WEB/lib/models/Scan.ts` - Database schema
- `WEB/app/api/scans/upload/route.ts` - Upload endpoint
- `WEB/components/dashboard/ScanUpload.tsx` - Upload UI

This will establish the foundation for the entire dashboard integration.

**What do you want to tackle first?**
