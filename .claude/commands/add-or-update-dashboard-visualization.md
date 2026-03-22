---
name: add-or-update-dashboard-visualization
description: Workflow command scaffold for add-or-update-dashboard-visualization in baloney.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-dashboard-visualization

Use this workflow when working on **add-or-update-dashboard-visualization** in `baloney`.

## Goal

Adds a new dashboard chart or visualization, often with supporting API endpoints and type updates.

## Common Files

- `frontend/src/app/dashboard/*.tsx`
- `frontend/src/app/api/analytics/community/*/route.ts`
- `frontend/src/lib/types.ts`
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/app/dashboard/community/page.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update dashboard component in frontend/src/app/dashboard/*.tsx
- Add or update supporting API route in frontend/src/app/api/analytics/community/*/route.ts or similar
- Update types/interfaces in frontend/src/lib/types.ts
- Wire new visualization into dashboard page (frontend/src/app/dashboard/page.tsx or community/page.tsx)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.