---
description: Add a new Next.js API route following baloney-pro patterns
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
argument-hint: <route-path e.g. analytics/community/new-metric>
---

# New API Route: $ARGUMENTS

1. Read an existing route for pattern reference:
   - GET route: `frontend/src/app/api/analytics/community/route.ts`
   - POST route: `frontend/src/app/api/detect/text/route.ts`

2. Create `frontend/src/app/api/$ARGUMENTS/route.ts`:
   - Import `errorResponse`, `validatePlatform`, `clampInt` from `@/lib/api-utils`
   - Import `supabase` from `@/lib/supabase`
   - Add response types to `frontend/src/lib/types.ts`

3. If recording scans:
   - Call `supabase.rpc("record_scan_with_provenance", {...})` (fire-and-forget)
   - Call `supabase.rpc("compute_exposure_score", {...})` (fire-and-forget)
   - Call `supabase.rpc("compute_slop_index")` with 10% sampling

4. Add typed client function to `frontend/src/lib/api.ts`

5. Run `cd frontend && npx tsc --noEmit && npm test`
