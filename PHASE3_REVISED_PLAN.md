# Phase 3: Plan Page UI (Matching Reference Design)

## Design Analysis from Reference Image

The reference image shows a **comprehensive plan dashboard** with:

### Layout Structure

```
┌────────────────────────────────────────────────────────────────────┐
│ Header: Build Plan · Draft · Actions (Regenerate, Save, Approve)  │
├────┬───────────────────────────────────────────────────────────┬───┤
│ L  │ Main Content (2-column grid of sections)                 │ R │
│ e  │ ┌──────────────┬──────────────┐                          │ i │
│ f  │ │ Original Idea│ Project Goals│                          │ g │
│ t  │ ├──────────────┼──────────────┤                          │ h │
│    │ │ Core Features│ Pages/Screens│                          │ t │
│ S  │ ├──────────────┼──────────────┤                          │   │
│ i  │ │ Tech Stack   │ Architecture │                          │ S │
│ d  │ ├──────────────┼──────────────┤                          │ i │
│ e  │ │ Security     │ Build/Test   │                          │ d │
│ b  │ └──────────────┴──────────────┘                          │ e │
│ a  │                                                           │ b │
│ r  │                                                           │ a │
│    │                                                           │ r │
└────┴───────────────────────────────────────────────────────────┴───┘
```

### Section Cards

Each section card contains:

- **Header**: Section title + "Add [Item]" button
- **Content**: List of items with:
  - Checkbox/icon
  - Item text
  - Edit icon (pencil)
  - Delete icon (trash)

### Right Sidebar (Plan Summary)

- **Progress Circle**: 92% completion
- **Readiness Checklist**:
  - ✓ Project goals defined
  - ✓ Core features listed
  - ✓ Pages & screens defined
  - ✓ Technical stack selected
  - ✓ Data structure defined
  - ✓ Security considered
  - ✓ Testing strategy ready
  - ⚠️ Dependencies reviewed

### Specific Sections Shown

1. **Original Idea** - User's project description
2. **Project Goals** (4 items with checkboxes)
3. **Core Features** (8 features with checkboxes)
4. **Pages/Screens** (7 pages with icons)
5. **Tech Stack** (Framework, Language, Styling, UI Components, Database, ORM, Auth, Hosting)
6. **Architecture Overview** (text description + "View Architecture Details" button)
7. **Security Considerations** (6 items with checkboxes)
8. **Build & Testing Strategy** (6 items with checkboxes)
9. **Data Structure (High Level)** - Shown in right panel as table

## Implementation Plan

### Step 1: Map Segmented Plan Data to UI Sections

Our segmented plan has 12 sections:

1. projectUnderstanding → Original Idea
2. projectGoals → Project Goals
3. coreFeatures → Core Features
4. userExperience → (internal, feeds into Pages)
5. pages → Pages/Screens
6. designDirection → (internal, feeds into display)
7. techStack → Tech Stack
8. dataStructure → Data Structure (High Level)
9. architecture → Architecture Overview
10. security → Security Considerations
11. testing → Build & Testing Strategy
12. summary → (internal, for AI context)

### Step 2: Create Adapter Layer

```typescript
// lib/utils/plan-adapter.ts
export function adaptSegmentedPlanToUI(segmentedPlan: SegmentedPlan) {
  return {
    originalIdea: segmentedPlan.sectionsData.projectUnderstanding,
    goals: segmentedPlan.sectionsData.projectGoals,
    features: segmentedPlan.sectionsData.coreFeatures,
    pages: segmentedPlan.sectionsData.pages,
    techStack: segmentedPlan.sectionsData.techStack,
    architecture: segmentedPlan.sectionsData.architecture,
    security: segmentedPlan.sectionsData.security,
    testing: segmentedPlan.sectionsData.testing,
    dataStructure: segmentedPlan.sectionsData.dataStructure,
  };
}
```

### Step 3: Build Section Components

#### `PlanSectionCard.tsx`

Generic card component that displays any section with:

- Section title
- "Add Item" button (conditional)
- List of items (from section.data)
- Edit/delete per item
- Status badge if generating

#### `PlanGoalsSection.tsx`

- Maps `projectGoals.data.goals[]` to checkable list
- Each goal has: title, description, priority

#### `PlanFeaturesSection.tsx`

- Maps `coreFeatures.data.features[]` to checkable list
- Each feature has: name, description, priority, complexity

#### `PlanPagesSection.tsx`

- Maps `pages.data.pages[]` to list with icons
- Each page has: name, route, description, sections

#### `PlanTechStackSection.tsx`

- Displays `techStack.data` as key-value pairs
- Framework, Language, Styling, Database, etc.

#### `PlanSecuritySection.tsx`

- Maps `security.data.considerations[]` to checkable list

#### `PlanTestingSection.tsx`

- Maps `testing.data` to checkable list

#### `PlanDataStructurePanel.tsx`

- Shows `dataStructure.data.dataModels[]` as table
- User, Product, Category, Order, etc. with fields

### Step 4: Build Main Page

```typescript
// app/dashboard/vibe/projects/[id]/plan/page.tsx

export default function PlanPage() {
  const { data: planData } = useSegmentedPlan(projectId);

  if (planData.plan.status === 'generating') {
    // Show progress view
    return <PlanGenerationView />;
  }

  // Show complete plan view (matching reference design)
  return <CompletePlanView />;
}
```

### Step 5: Handle Two States

#### State 1: Generating (Progress View)

- Show progress indicator
- Display completed sections
- Show current section being generated
- Hide incomplete sections

#### State 2: Complete (Full Dashboard View)

- Show all sections in grid
- Enable editing
- Show approval button

## Component Breakdown

```
app/dashboard/vibe/projects/[id]/plan/page.tsx
├─ PlanGenerationView (when generating)
│  ├─ PlanProgressIndicator
│  ├─ CompletedSectionsPreview
│  └─ CurrentSectionSpinner
│
└─ CompletePlanView (when complete)
   ├─ PlanHeader
   ├─ PlanContentGrid
   │  ├─ OriginalIdeaCard
   │  ├─ ProjectGoalsCard
   │  ├─ CoreFeaturesCard
   │  ├─ PagesScreensCard
   │  ├─ TechStackCard
   │  ├─ ArchitectureCard
   │  ├─ SecurityCard
   │  └─ TestingCard
   └─ PlanReadinessSidebar
      ├─ ProgressCircle
      ├─ ReadinessChecklist
      └─ DataStructurePanel
```

## Next Steps

1. Create adapter function to transform segmented plan data
2. Build generic `PlanSectionCard` component
3. Build specific section components (Goals, Features, Pages, etc.)
4. Build `PlanReadinessSidebar` with progress circle
5. Build main page with conditional rendering (generating vs complete)
6. Style to match reference design exactly

## Key Differences from My Initial Plan

- **Not** showing sections one-by-one during generation in final view
- **Not** using sidebar for progress during viewing (only during generation)
- **Using** dense 2-column grid layout for all sections
- **Using** consistent card design for all sections
- **Showing** data structure in right sidebar (not main content)

The segmented planning system I built is perfect for **generating** the data. Now we need the UI to **display** it beautifully.
