# Segmented Plan Implementation Plan

## Current Architecture Analysis

### ✅ What Exists and Works

1. **BuildSession** - Tracks build lifecycle, stores artifacts
2. **BuildTask** - Individual agent tasks
3. **BuildActivity** - Activity logging
4. **Agent System** - 7 specialized agents (Planner, Requirements, Architecture, UI/UX, Code, Review, Test)
5. **AI Router** - Intelligent model selection and fallback
6. **Model Registry** - 23 models across 4 tiers
7. **Base Agent** - JSON parsing with repair, AI calling with error handling
8. **Orchestrator** - Sequential agent execution with pause/resume

### ✅ Current Planning Flow

```
User clicks "Build with AI"
→ Planner Agent generates COMPLETE plan (single-shot)
→ Plan saved to BuildSession.artifacts.plan
→ Orchestrator pauses (waiting for approval)
→ User redirected to /plan page
→ User reviews/edits plan
→ User approves → Build continues
```

### ❌ Problems with Current Approach

1. **Single-shot generation** - One massive AI call generating everything at once
2. **No visibility** - User sees nothing until entire plan completes
3. **High failure risk** - If any part fails, entire plan fails
4. **Not beginner-friendly** - Technical jargon, no progressive explanation
5. **Poor UX** - Long wait with no feedback
6. **Expensive** - One large prompt costs more than multiple focused prompts

---

## New Segmented Architecture

### Core Concept: Section-by-Section Generation

Instead of generating one massive plan, we break planning into **12 independent sections** that build on each other:

1. **Project Understanding** - AI interprets user's idea in simple language
2. **Project Goals** - What the app should accomplish
3. **Core Features** - Main functionality (beginner-friendly)
4. **User Experience** - How users will interact with it
5. **Pages/Screens** - UI structure
6. **Design Direction** - Visual style and theme
7. **Tech Stack** - Technologies to use (with explanations)
8. **Data Structure** - What information needs to be stored
9. **Architecture** - How components connect
10. **Security** - How to keep it safe
11. **Testing Strategy** - How to verify it works
12. **Final Summary** - Complete overview

### Key Principles

1. **Real-time Visibility** - User sees each section as it's generated
2. **Checkpoint Approvals** - User reviews at logical points (not after every section)
3. **Resumable** - Can pause and resume without losing progress
4. **Editable During Generation** - User can edit completed sections while others generate
5. **Dependency Tracking** - If user edits Feature 1, mark dependent sections for review
6. **Beginner-Friendly** - Every section has simple explanation + optional technical details
7. **Project-Type Aware** - Different sections for web app vs mobile app vs game vs API

---

## Implementation Strategy

### Phase 1: Extend Data Models ✅

**BuildArtifacts Interface** (extend existing):

```typescript
export interface BuildArtifacts {
  plan?: any; // Legacy full plan
  planApproved?: boolean;
  planApprovedAt?: Date;

  // NEW: Segmented plan sections
  segmentedPlan?: {
    status:
      | "initializing"
      | "generating"
      | "paused"
      | "completed"
      | "approved"
      | "failed";
    currentSection?: string;
    completedSections: string[];
    sectionsData: {
      projectUnderstanding?: PlanSection;
      projectGoals?: PlanSection;
      coreFeatures?: PlanSection;
      userExperience?: PlanSection;
      pages?: PlanSection;
      designDirection?: PlanSection;
      techStack?: PlanSection;
      dataStructure?: PlanSection;
      architecture?: PlanSection;
      security?: PlanSection;
      testing?: PlanSection;
      summary?: PlanSection;
    };
    checkpoints: {
      checkpoint1?: "pending" | "approved" | "editing";
      checkpoint2?: "pending" | "approved" | "editing";
      checkpoint3?: "pending" | "approved" | "editing";
    };
    conflictWarnings?: Array<{
      section: string;
      message: string;
      affectedSections: string[];
    }>;
  };

  requirements?: any;
  architecture?: any;
  uiDesign?: any;
}

export interface PlanSection {
  id: string;
  name: string;
  status: "pending" | "generating" | "completed" | "failed" | "needs_review";
  simpleExplanation: string;
  technicalDetails?: any;
  data: any;
  generatedAt?: Date;
  lastEditedAt?: Date;
  dependencies?: string[]; // Which sections this depends on
  aiUsage?: {
    provider: string;
    model: string;
    tokensUsed: number;
    cost: number;
  };
  error?: string;
}
```

### Phase 2: Create Planning Section Agents

Instead of modifying the existing Planner Agent (which works for legacy plans), create **specialized section agents**:

1. **ProjectUnderstandingAgent** - Translates user idea into simple language
2. **ProjectGoalsAgent** - Defines what the app should accomplish
3. **CoreFeaturesAgent** - Lists main functionality
4. **UserExperienceAgent** - Defines user flows
5. **PagesAgent** - Designs page structure
6. **DesignDirectionAgent** - Creates visual theme
7. **TechStackAgent** - Selects technologies
8. **DataStructureAgent** - Designs data models
9. **ArchitecturePlanningAgent** - High-level architecture (different from detailed ArchitectureAgent)
10. **SecurityPlanningAgent** - Security considerations
11. **TestingStrategyAgent** - Testing approach
12. **SummaryAgent** - Assembles final plan

Each agent:

- Takes **focused input** (only what it needs)
- Returns **structured JSON** with simpleExplanation + technicalDetails
- Uses **appropriate model tier** (Understanding = Tier 1, Architecture = Tier 2/3)
- Handles **errors gracefully** (doesn't crash entire plan)

### Phase 3: Segmented Planning Orchestrator

Create **`SegmentedPlanningOrchestrator`** (separate from BuildOrchestrator):

```typescript
class SegmentedPlanningOrchestrator {
  async startPlanGeneration(projectId, userId): Promise<void>;
  async generateNextSection(sessionId, userId): Promise<PlanSection>;
  async regenerateSection(sessionId, userId, sectionId): Promise<PlanSection>;
  async pausePlanning(sessionId, userId): Promise<void>;
  async resumePlanning(sessionId, userId): Promise<void>;
  async approvePlan(sessionId, userId): Promise<void>;
  async detectConflicts(sessionId, editedSection): Promise<ConflictWarning[]>;
}
```

**Section Generation Flow:**

```
1. Initialize segmented plan in BuildSession
2. For each section in order:
   a. Update section status to 'generating'
   b. Call appropriate section agent
   c. Parse and validate response
   d. Save section data
   e. Update section status to 'completed'
   f. Check if checkpoint reached
   g. If checkpoint, pause and wait for user approval
   h. Otherwise continue to next section
3. When all sections complete, set status to 'completed'
4. Wait for final approval
5. Assemble complete plan and hand off to BuildOrchestrator
```

### Phase 4: Redesign Plan Page UI

**New Plan Page Structure (matching reference image):**

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Build Plan · Draft · Regenerate · Save · Approve   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Original Idea Card]                                        │
│                                                             │
│ ┌──────────────────────────┬──────────────────────────────┐│
│ │ Project Goals            │ Core Features                ││
│ │ [Section content]        │ [Section content]            ││
│ └──────────────────────────┴──────────────────────────────┘│
│                                                             │
│ ┌──────────────────────────┬──────────────────────────────┐│
│ │ Pages / Screens          │ Tech Stack                   ││
│ │ [Section content]        │ [Section content]            ││
│ └──────────────────────────┴──────────────────────────────┘│
│                                                             │
│ ┌──────────────────────────┬──────────────────────────────┐│
│ │ Data Structure           │ Plan Summary (sidebar)       ││
│ │ [Section content]        │ ✓ 8/10 sections complete     ││
│ │                          │ ○ 2 sections pending         ││
│ │ Architecture Overview    │                              ││
│ │ [Section content]        │ Plan Readiness               ││
│ │                          │ ✓ Project understood         ││
│ │ Security                 │ ✓ Goals defined              ││
│ │ [Section content]        │ ✓ Features planned           ││
│ │                          │ ...                          ││
│ │ Build & Testing          │                              ││
│ │ [Section content]        │                              ││
│ └──────────────────────────┴──────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**During Generation:**

```
Building Your Plan...

✓ Understanding your idea
✓ Defining goals
● Planning features (generating...)
○ Mapping pages
○ Choosing technology
○ Planning data structure
○ Designing architecture
○ Considering security
○ Planning testing
○ Creating summary
```

**Section Display (Beginner-Friendly):**

```
┌─────────────────────────────────────────────┐
│ 🎯 Core Features                            │
├─────────────────────────────────────────────┤
│                                             │
│ What this means:                            │
│ "These are the main things your app will    │
│  do. Think of them as the key buttons       │
│  and actions users will use most."          │
│                                             │
│ 1. ✓ User authentication (login, logout)   │
│    "Users can create accounts and sign in" │
│                                             │
│ 2. ✓ Expense tracking                       │
│    "Students can add and view expenses"     │
│                                             │
│ 3. ✓ Monthly budgeting                      │
│    "Set spending limits and track progress" │
│                                             │
│ [Show Technical Details ▼]                  │
│                                             │
│ Actions: [Edit] [Regenerate]                │
└─────────────────────────────────────────────┘
```

### Phase 5: API Routes

**New/Updated Routes:**

```
POST /api/vibe/projects/[id]/plan/start-segmented
  → Start segmented planning

GET /api/vibe/projects/[id]/plan/segmented
  → Get current segmented plan state

POST /api/vibe/projects/[id]/plan/sections/[sectionId]/edit
  → Edit a completed section

POST /api/vibe/projects/[id]/plan/sections/[sectionId]/regenerate
  → Regenerate a single section

POST /api/vibe/projects/[id]/plan/checkpoint/approve
  → Approve checkpoint and continue

POST /api/vibe/projects/[id]/plan/segmented/approve
  → Final approval, start build
```

### Phase 6: Real-Time Updates (Optional Enhancement)

Use React Query's `refetchInterval` (already implemented) to poll for section updates every 1-2 seconds during generation.

No WebSockets needed - simple polling works well for this use case.

---

## Implementation Order

### Step 1: ✅ Data Models

- Extend BuildArtifacts with segmentedPlan
- Create PlanSection interface
- Update BuildSession types

### Step 2: Create First Section Agent

- Start with ProjectUnderstandingAgent
- Test end-to-end with simple prompt
- Verify JSON parsing, error handling, AI routing

### Step 3: Create Segmented Planning Orchestrator

- Basic orchestrator structure
- Section generation loop
- State management in BuildSession
- Error handling and recovery

### Step 4: Create Remaining Section Agents

- Implement all 12 section agents
- Each with appropriate prompts
- Each with proper input/output validation

### Step 5: Redesign Plan Page

- New UI layout (matching reference)
- Real-time section display
- Progress indicators
- Beginner-friendly content display
- Edit/regenerate controls

### Step 6: API Routes

- Implement all new routes
- Proper authentication/authorization
- Error handling

### Step 7: Integration

- Connect Plan page to new orchestrator
- Replace single-shot planning with segmented
- Maintain backward compatibility with existing projects

### Step 8: Testing

- Test all 9 scenarios from specification
- Test error recovery
- Test checkpoint approvals
- Test conflict detection

---

## Key Design Decisions

### 1. Reuse Existing BuildSession

✅ **Decision:** Extend BuildSession.artifacts with segmentedPlan
❌ **NOT:** Create separate PlanningSession model
**Reason:** Avoid duplicate systems, keep single source of truth

### 2. Separate Section Agents

✅ **Decision:** Create new specialized section agents
❌ **NOT:** Modify existing agents
**Reason:** Existing agents work for full build, section agents have different responsibilities

### 3. Simple Polling, No WebSockets

✅ **Decision:** Use React Query refetchInterval (already works)
❌ **NOT:** Add WebSocket infrastructure
**Reason:** Simpler, already implemented, sufficient for this use case

### 4. Checkpoints, Not Per-Section Approval

✅ **Decision:** 3 logical checkpoints
❌ **NOT:** Approve every section
**Reason:** Better UX, less interruption, still gives user control

### 5. Two-Level Information

✅ **Decision:** simpleExplanation + optional technicalDetails
❌ **NOT:** Only technical output
**Reason:** Beginner-friendly is primary requirement

---

## Beginner-Friendly Content Strategy

Every section must have:

1. **"What this means"** - Plain English explanation
2. **Why it matters** - User benefit
3. **Simple language** - No jargon
4. **Examples** - Concrete illustrations
5. **Optional technical details** - For advanced users

**Example Prompts for Section Agents:**

```
"You are explaining to someone who has never built an app before.
Use simple, everyday language. Avoid technical jargon.
For every technical concept, explain it like you're talking to a friend.

BAD: 'Implement JWT-based stateless authentication with bcrypt hashing'
GOOD: 'Users can create secure accounts and sign in. Their passwords will be
       stored safely so even we can't see them.'

Provide two levels:
1. Simple explanation (required)
2. Technical details (optional)"
```

---

## Success Criteria

✅ User sees plan being built section-by-section
✅ Each section appears immediately when completed
✅ User can edit any completed section
✅ User can regenerate any section
✅ Conflicts detected when dependencies change
✅ Checkpoints allow logical review points
✅ Plan page matches reference design
✅ All content is beginner-friendly
✅ Failed sections can retry without losing progress
✅ Completed plan integrates with existing BuildOrchestrator
✅ No duplicate systems created
✅ Existing projects continue working

---

## Next Steps

1. Create new folder: `lib/agents/planning/`
2. Implement ProjectUnderstandingAgent (test first agent)
3. Create SegmentedPlanningOrchestrator
4. Test end-to-end with one section
5. Implement remaining 11 agents
6. Redesign Plan page UI
7. Create API routes
8. Integration testing
9. User acceptance testing

**Estimated Time:** 2-3 days of focused development
