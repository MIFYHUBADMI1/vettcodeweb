# Phase 3: Segmented Planning UI Implementation Plan

## Overview

Create a beautiful, beginner-friendly UI for the segmented planning system that shows progress in real-time as sections are generated.

## Design Goals

1. **Real-time visibility** - Show sections as they complete
2. **Dense 2-column layout** (desktop) → single column (mobile)
3. **Beginner-friendly** - Simple explanations + expandable technical details
4. **Editable** - User can edit completed sections
5. **Checkpoint-based approvals** - Approve at key milestones
6. **Conflict warnings** - Show when edits affect other sections

## Components to Create

### 1. `PlanProgressIndicator.tsx`

- Shows 12 section cards in a grid
- Each card shows: section name, status (pending/generating/completed/failed), icon
- Progress bar showing overall completion (0-100%)
- Highlights current section being generated

### 2. `PlanSectionCard.tsx`

- Displays a single section's content
- Two-level display: Simple explanation (always visible) + Technical details (expandable)
- Edit mode with textarea
- Status badge (completed, generating, failed, needs_review)
- Regenerate button
- AI usage stats (tokens, cost)

### 3. `PlanReadinessSidebar.tsx`

- Sticky sidebar showing:
  - Overall progress percentage
  - Completed sections count
  - Total estimated cost
  - Next checkpoint info
  - Approve button (enabled when checkpoint reached)

### 4. `ConflictWarningBanner.tsx`

- Shows when editing a section affects others
- Lists affected sections
- Option to regenerate dependent sections

### 5. `PlanSectionEditor.tsx`

- Modal/panel for editing section content
- Save/Cancel buttons
- Detects conflicts on save

## API Routes to Add

### `POST /api/vibe/projects/[id]/plan/segmented/sections/[sectionId]/edit`

- Save edited section content
- Detect conflicts with dependent sections

### `POST /api/vibe/projects/[id]/plan/segmented/sections/[sectionId]/regenerate`

- Regenerate a single section

### `POST /api/vibe/projects/[id]/plan/segmented/pause`

- Pause ongoing planning

### `POST /api/vibe/projects/[id]/plan/segmented/resume`

- Resume paused planning

### `POST /api/vibe/projects/[id]/plan/segmented/approve`

- Approve plan and transition to build phase

## React Query Hooks

### `useSegmentedPlan(projectId)`

- Fetches segmented plan
- Auto-refetches every 5 seconds if status is 'generating'
- Returns: plan data, progress, loading state

### `useEditSection(projectId, sectionId)`

- Mutation for editing a section
- Invalidates plan query on success

### `useRegenerateSection(projectId, sectionId)`

- Mutation for regenerating a section
- Shows loading state while regenerating

### `usePausePlanning(projectId)`

- Mutation for pausing planning

### `useResumePlanning(projectId)`

- Mutation for resuming planning

### `useApprovePlan(projectId)`

- Mutation for approving plan
- Redirects to overview on success

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                         Header                               │
│  [← Back] Build Plan - [Project Name]    [Pause] [Approve]  │
└─────────────────────────────────────────────────────────────┘
┌────────────────────────────┬────────────────────────────────┐
│                            │   Sidebar (Sticky)              │
│  Progress Grid             │   ┌──────────────────────────┐ │
│  ┌────┬────┬────┬────┐     │   │ Progress: 67%            │ │
│  │ 1✓ │ 2✓ │ 3✓ │ 4⚙ │     │   │ Completed: 8/12          │ │
│  ├────┼────┼────┼────┤     │   │ Cost: $0.0023            │ │
│  │ 5  │ 6  │ 7  │ 8  │     │   ├──────────────────────────┤ │
│  ├────┼────┼────┼────┤     │   │ Next Checkpoint:         │ │
│  │ 9  │ 10 │ 11 │ 12 │     │   │ Technical Foundation    │ │
│  └────┴────┴────┴────┘     │   │ (2 sections remaining)   │ │
│                            │   ├──────────────────────────┤ │
│  Section Cards             │   │ [Approve Checkpoint 2]   │ │
│  ┌──────────────────────┐  │   └──────────────────────────┘ │
│  │ 1. Project           │  │                                │
│  │    Understanding     │  │                                │
│  │ ✓ Completed          │  │                                │
│  │                      │  │                                │
│  │ Simple: You want...  │  │                                │
│  │ [▼ Show Details]     │  │                                │
│  │ [Edit] [Regenerate]  │  │                                │
│  └──────────────────────┘  │                                │
│  ┌──────────────────────┐  │                                │
│  │ 2. Project Goals     │  │                                │
│  │ ✓ Completed          │  │                                │
│  └──────────────────────┘  │                                │
│                            │                                │
└────────────────────────────┴────────────────────────────────┘
```

## Mobile Layout

- Single column
- Sidebar becomes top card
- Progress grid remains visible at top
- Sections stack vertically

## Implementation Steps

1. ✅ Create React Query hooks file
2. ✅ Create API routes for edit, regenerate, pause, resume, approve
3. ✅ Build `PlanProgressIndicator` component
4. ✅ Build `PlanSectionCard` component
5. ✅ Build `PlanReadinessSidebar` component
6. ✅ Build `ConflictWarningBanner` component
7. ✅ Redesign main plan page to use new components
8. ✅ Test real-time updates
9. ✅ Test editing and regeneration
10. ✅ Test approval flow

## Status Indicators

- ⏳ **Pending** - Gray, waiting to be generated
- ⚙️ **Generating** - Yellow/Orange, spinner animation
- ✅ **Completed** - Green, checkmark
- ❌ **Failed** - Red, error icon
- ⚠️ **Needs Review** - Yellow, warning (after dependency edited)

## Color Scheme

- Background: `bg-gray-950`
- Cards: `bg-gray-900` with `border-gray-800`
- Success: `text-green-400` / `bg-green-500/20`
- Warning: `text-yellow-400` / `bg-yellow-500/20`
- Error: `text-red-400` / `bg-red-500/20`
- Generating: `text-orange-400` / `bg-orange-500/20`
- Primary action: `bg-gradient-to-r from-purple-600 to-blue-600`

## Next Steps

Start with creating the React Query hooks, then build components incrementally.
