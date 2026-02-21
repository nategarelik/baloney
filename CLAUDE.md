# Baloney — Project Instructions

## Overview

Baloney is a multi-modal AI content detection platform built for MadData26 (UW-Madison Data Science Hackathon, Feb 21-22, 2026). Chrome extension + Next.js dashboard + Supabase backend.

## Architecture

```
Extension → Vercel (Next.js API routes) → Supabase (Postgres)
```

- **Frontend + API:** `frontend/` — Next.js 16, React 19, TypeScript 5.7, Tailwind CSS 3.4, Recharts 2.15, @supabase/supabase-js
- **Database:** Supabase Postgres (project `xpeubpqbqlyxawjovxuy`, us-east-1)
- **Extension:** `extension/` — Chrome Manifest V3, content script, background worker, popup

## Deployment

| Service | URL | Status |
|---------|-----|--------|
| Frontend (Vercel) | https://trustlens-nu.vercel.app | Live |
| Supabase | https://xpeubpqbqlyxawjovxuy.supabase.co | Live |
| GitHub | https://github.com/nategarelik/trustlens | Live (private) |

### Environment Variables

**Vercel (frontend):**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase publishable anon key
- `SEED_SECRET` — Protects the `/api/seed` endpoint

**Local development:** Copy values to `frontend/.env.local`

### Seeding Data

Hit the seed endpoint once after deploying:
```bash
curl -X POST "https://trustlens-nu.vercel.app/api/seed?secret=$SEED_SECRET"
```

This creates 50 users, 535 scans, computes slop index and exposure scores.

## Key Patterns

### Mock Detection (TypeScript)

Detection is handled by `frontend/src/lib/mock-detectors.ts` — a TypeScript port of the original Python `mock_detector.py`. All detection runs server-side in Next.js API routes:
- Image: 35% AI (conf 0.78-0.96), 55% human, 10% inconclusive
- Text: real text_stats + mock verdict with caveats
- Video: random frame-level analysis

### API Routes (14 total)

All in `frontend/src/app/api/`:

| Route | Method | Purpose |
|-------|--------|---------|
| `detect/image` | POST | Image detection + Supabase write |
| `detect/text` | POST | Text detection + Supabase write |
| `scans/me` | GET | Scan history by user_id |
| `analytics/personal` | GET | Personal stats from Postgres views |
| `analytics/community` | GET | Community stats (sharing_enabled only) |
| `analytics/community/trends` | GET | Daily AI rate trends |
| `analytics/community/domains` | GET | Domain leaderboard |
| `sharing/toggle` | POST | Toggle community sharing |
| `sharing/status` | GET | Get sharing preference |
| `slop-index` | GET | Platform AI Slop Index |
| `exposure-score` | GET | Personal exposure score |
| `provenance` | GET | Content provenance sightings |
| `seed` | POST | Seed demo data (protected) |
| `health` | GET | System health check |

### Supabase Schema

**6 tables:** `profiles`, `scans`, `content_sightings`, `platform_slop_index`, `exposure_scores`, `daily_snapshots`

**11 views:** `v_personal_stats`, `v_personal_by_platform`, `v_personal_by_content_type`, `v_personal_by_verdict`, `v_community_stats`, `v_community_by_platform`, `v_community_by_content_type`, `v_community_trends`, `v_domain_leaderboard`, `v_slop_index_latest`, `v_top_provenance`

**3 RPC functions:**
- `record_scan_with_provenance(...)` — Insert scan + upsert profile + update content_sightings
- `compute_exposure_score(user_id)` — Calculate 0-850 awareness score
- `compute_slop_index()` — Grade platforms A+ through F

### Innovative Features

1. **AI Slop Index** — Platform report cards with letter grades, 7d/24h AI rates, trend arrows
2. **Exposure Score** — Personal AI awareness gamification (0-850, 5 levels: Novice → Sentinel)
3. **Content Provenance** — Crowd-sourced truth via sha256 content hashes across platforms

### Feed Page Fallback

`feed/page.tsx` has a double-safety fallback:
1. Tries real API call via `detectImage()`
2. On failure/timeout: uses curated ground-truth from `_data.ts`
3. Demo never breaks regardless of backend status

### Type System

`frontend/src/lib/types.ts` contains 17 interfaces. Key types:
- `DetectionResult`, `TextDetectionResult`, `VideoDetectionResult` — detection responses
- `PersonalAnalytics`, `CommunityAnalytics` — dashboard data
- `SlopIndexEntry`, `ExposureScore`, `ContentProvenance` — innovative feature types
- `ScanRecord`, `FeedPostData` — history and feed

### API Client

`frontend/src/lib/api.ts` — 11 functions using relative URLs (no external API dependency). Includes `getSlopIndex()`, `getExposureScore()`, `getTopProvenance()`.

### Demo User

`DEMO_USER_ID = "demo-user-001"` — hardcoded in `frontend/src/lib/constants.ts`. Has sharing_enabled=true, ~45 scans, exposure score 462 "Vigilant".

### Chart Theming

All Recharts components use consistent dark theme from `CHART_COLORS` in `constants.ts`:
- AI: `#ef4444` (red), Human: `#22c55e` (green), Unclear: `#f59e0b` (amber)
- Axis labels: `#94a3b8` (slate-400), Grid: `#1e3a5f` (navy-lighter)

### Badge Colors

Detection badges match extension `styles.css` exactly:
- AI: `rgba(220,38,38,0.85)`, Human: `rgba(22,163,74,0.80)`, Unclear: `rgba(202,138,4,0.80)`

## File Reference

### Critical Files (read before modifying)

- `frontend/src/lib/types.ts` — Type contract
- `frontend/src/lib/api.ts` — All API calls (relative URLs)
- `frontend/src/lib/supabase.ts` — Supabase client
- `frontend/src/lib/mock-detectors.ts` — TS mock detection logic
- `frontend/src/lib/constants.ts` — Colors, IDs, RequestQueue

### Dashboard Components

- `frontend/src/app/dashboard/page.tsx` — Main dashboard (personal + community tabs)
- `frontend/src/app/dashboard/SlopIndexCard.tsx` — Platform report cards
- `frontend/src/app/dashboard/ExposureScoreCard.tsx` — Personal awareness score
- `frontend/src/app/dashboard/ProvenanceTable.tsx` — Crowd-sourced truth table
- `frontend/src/app/dashboard/PersonalTab.tsx` — Personal analytics charts
- `frontend/src/app/dashboard/CommunityTab.tsx` — Community analytics charts

### Pages

- `frontend/src/app/page.tsx` — Landing (hero, stats, how-it-works)
- `frontend/src/app/feed/page.tsx` — Demo feed (20 posts, IntersectionObserver scanning)
- `frontend/src/app/dashboard/page.tsx` — Dashboard

## Development

### Local Setup

```bash
cd frontend
npm install
# Copy .env.local with Supabase credentials
npm run dev
```

### Verification

```bash
cd frontend
npx tsc --noEmit     # TypeScript check (must be 0 errors)
npm run build        # Production build (must succeed)
```

### Git

- Repo: https://github.com/nategarelik/trustlens (private)
- Branch: `master`
- Commit style: conventional commits (feat:, fix:, chore:, docs:)
- Stage specific files, never `git add -A`

## Documentation

- `docs/ARCHITECTURE.md` — System diagrams (Mermaid), database ER, component hierarchy, design decisions
- `docs/API.md` — Full API reference for all 14 endpoints
- `docs/AI_CITATION.md` — AI tools disclosure (hackathon requirement)
- `docs/PRESENTATION.md` — 5-minute pitch guide and demo recovery plan

## Known Limitations

- Supabase RLS is permissive (hackathon mode) — real security is in API routes
- No rate limiting on public endpoints
- Next.js images use `<img>` tags instead of `<Image>` to avoid remote domain config
- `compute_slop_index()` uses `ROUND(...::numeric, 2)` — Postgres requires numeric cast for 2-arg ROUND
