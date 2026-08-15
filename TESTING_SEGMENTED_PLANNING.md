# Testing Segmented Planning - Quick Guide

## Prerequisites

1. ✅ MongoDB running and connected
2. ✅ AI provider credentials configured (OpenRouter/Groq)
3. ✅ Next.js dev server running (`npm run dev`)
4. ✅ User account created and logged in

---

## Option 1: Test via API (Easiest)

### Step 1: Create Test Project & Start Planning

```bash
# In your browser or using curl:
POST http://localhost:3000/api/vibe/test/segmented-planning

# Or use browser DevTools console:
fetch('/api/vibe/test/segmented-planning', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

**Expected Response:**

```json
{
  "success": true,
  "projectId": "...",
  "sessionId": "...",
  "instructions": {
    "checkProgress": "GET /api/vibe/projects/{id}/plan/segmented",
    "viewProject": "/dashboard/vibe/projects/{id}/plan"
  }
}
```

### Step 2: Monitor Progress

```bash
# Check progress (replace {projectId} with actual ID)
GET http://localhost:3000/api/vibe/projects/6a804e600828e10ba17941a0/plan/segmented

# Or in browser console:
fetch('/api/vibe/projects/{projectId}/plan/segmented')
  .then(r => r.json())
  .then(console.log)
```

**Expected Response:**

```json
{
  "success": true,
  "plan": {
    "status": "generating",  // or "completed"
    "completedSections": ["projectUnderstanding", "projectGoals", ...],
    "currentSection": "coreFeatures",
    "sectionsData": {
      "projectUnderstanding": {
        "id": "projectUnderstanding",
        "name": "Project Understanding",
        "status": "completed",
        "simpleExplanation": "You want to build...",
        "data": { ... }
      }
    }
  },
  "progress": {
    "progress": 42,
    "status": "generating",
    "completedSections": [...]
  }
}
```

### Step 3: View in Database

```javascript
// In MongoDB Compass or mongo shell:
db.build_sessions.find({ status: "planning" }).pretty();

// Look for:
// - artifacts.segmentedPlan.status
// - artifacts.segmentedPlan.completedSections
// - artifacts.segmentedPlan.sectionsData
```

---

## Option 2: Test via UI (When Plan Page Exists)

1. Navigate to `/dashboard/vibe`
2. Create a new project or select existing
3. Click "Build with AI"
4. Should redirect to `/dashboard/vibe/projects/{id}/plan`
5. Watch sections appear in real-time

---

## Option 3: Test Single Agent (TypeScript)

Create a simple test file:

**`test-single-agent.ts`:**

```typescript
import { ProjectUnderstandingAgent } from "./lib/agents/planning/project-understanding-agent";
import { AIRouter } from "./lib/ai-router";
import { getUserPlan } from "./lib/subscription";
import { ObjectId } from "mongodb";

async function test() {
  const agent = new ProjectUnderstandingAgent(new AIRouter());
  const userPlan = await getUserPlan("your-email@example.com");

  const context = {
    session: {
      _id: new ObjectId(),
      projectId: new ObjectId(),
      userId: "your-email@example.com",
      status: "planning",
      artifacts: {
        segmentedPlan: {
          status: "generating",
          completedSections: [],
          sectionsData: {},
          checkpoints: {},
        },
      },
      // ... other required fields
    },
    project: {
      _id: new ObjectId(),
      name: "Test",
      description: "A simple todo app for students",
      type: "web",
      userId: "your-email@example.com",
      // ... other required fields
    },
    user: { email: "your-email@example.com", plan: userPlan },
    generatedFiles: new Map(),
    currentPhase: "planning",
    budget: { maxTokens: 50000, usedTokens: 0, maxCost: 10, usedCost: 0 },
  };

  const output = await agent.execute(context);
  console.log("✅ Success!", output);
}

test().catch(console.error);
```

Run with: `npx ts-node test-single-agent.ts`

---

## What to Verify

### ✅ Agent Execution

- [ ] Agent calls AI successfully
- [ ] Response is valid JSON
- [ ] JSON parsing works (with repair if needed)
- [ ] Section structure is correct
- [ ] `simpleExplanation` is beginner-friendly
- [ ] `data` contains expected fields
- [ ] `aiUsage` tracks cost and tokens

### ✅ Orchestrator

- [ ] Can start planning session
- [ ] Initializes segmented plan in BuildSession
- [ ] Generates sections sequentially
- [ ] Saves each section immediately
- [ ] Updates `completedSections` array
- [ ] Handles dependencies correctly
- [ ] Changes status to 'completed' when done

### ✅ Error Handling

- [ ] Failed section doesn't crash entire plan
- [ ] Error message saved in section
- [ ] Can retry failed section
- [ ] Completed sections preserved on failure

### ✅ Cost Tracking

- [ ] Each section tracks AI usage
- [ ] Tokens counted correctly
- [ ] Cost calculated correctly
- [ ] Total cost reasonable (~$0.015-0.025)

---

## Expected Results

### Complete Plan Should Have:

```javascript
{
  status: 'completed',
  completedSections: [
    'projectUnderstanding',
    'projectGoals',
    'coreFeatures',
    'userExperience',
    'pages',
    'designDirection',
    'techStack',
    'dataStructure',
    'architecture',
    'security',
    'testing',
    'summary'
  ],
  sectionsData: {
    projectUnderstanding: { /* section data */ },
    projectGoals: { /* section data */ },
    // ... all 12 sections
  }
}
```

### Each Section Should Have:

```javascript
{
  id: 'projectUnderstanding',
  name: 'Project Understanding',
  status: 'completed',
  simpleExplanation: 'Beginner-friendly text...',
  data: { /* Section-specific data */ },
  generatedAt: Date,
  dependencies: ['previousSection'],
  aiUsage: {
    provider: 'openrouter' | 'groq',
    model: 'model-name',
    tokensUsed: 1234,
    cost: 0.0012
  }
}
```

---

## Common Issues & Solutions

### Issue: "No AI providers available"

**Solution:** Check OpenRouter/Groq API keys in environment variables

### Issue: "Invalid JSON response"

**Solution:** Check AI model is returning valid JSON. JSON repair function should handle most cases.

### Issue: "Section not found"

**Solution:** Verify all 12 agents registered in SegmentedPlanningOrchestrator constructor

### Issue: "MongoDB connection error"

**Solution:** Ensure MongoDB is running and MONGODB_URI is correct

### Issue: "Planning stuck/not progressing"

**Solution:** Check server logs for errors. May need to restart dev server.

---

## Quick Smoke Test Checklist

Run these in order:

1. ✅ Start dev server
2. ✅ Call test API endpoint
3. ✅ Check response has projectId and sessionId
4. ✅ Wait 30 seconds
5. ✅ Check progress endpoint
6. ✅ Verify at least 2-3 sections completed
7. ✅ Wait 2-3 minutes total
8. ✅ Check status is 'completed'
9. ✅ Verify all 12 sections present
10. ✅ Check total cost is reasonable

**If all pass:** ✅ System works! Proceed to Phase 3 (UI)

**If any fail:** Debug specific issue before continuing

---

## Next Steps After Testing

Once verified working:

1. Proceed to Phase 3 - UI Redesign
2. Create React Query hooks
3. Build plan page components
4. Implement real-time progress display
5. Add edit/regenerate functionality

---

**Note:** The test API endpoint (`/api/vibe/test/segmented-planning`) should be removed or secured in production.
