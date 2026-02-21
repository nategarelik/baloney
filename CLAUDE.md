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
| GitHub | https://github.com/nategarelik/baloney | Live (private) |

### Environment Variables

**Vercel (frontend):**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase publishable anon key
- `SEED_SECRET` — Protects the `/api/seed` endpoint
- `HUGGINGFACE_API_KEY` — HuggingFace Inference API key (enables real ML detection; falls back to mock without it)

**Local development:** Copy values to `frontend/.env.local`

### Seeding Data

Hit the seed endpoint once after deploying:
```bash
curl -X POST "https://trustlens-nu.vercel.app/api/seed?secret=$SEED_SECRET"
```

This creates 50 users, 535 scans, computes slop index and exposure scores.

## Key Patterns

### Real AI Detection (HuggingFace)

Detection is handled by `frontend/src/lib/real-detectors.ts` — multi-signal ensemble using HuggingFace Inference API. All detection runs server-side in Next.js API routes:
- **Text:** Method A (RoBERTa, 50%) + Method B (MiniLM sentence embeddings, 20%) + Method D (statistical features, 30%)
- **Image:** Method E (ViT AI-image-detector, 55%) + Method F (frequency/FFT analysis, 25%) + Method G (metadata/EXIF, 20%)
- Falls back to `mock-detectors.ts` if `HUGGINGFACE_API_KEY` is not set or API fails
- Models: `openai-community/roberta-base-openai-detector`, `sentence-transformers/all-MiniLM-L6-v2`, `umm-maybe/AI-image-detector`

### Mock Detection (Fallback)

Fallback detectors in `frontend/src/lib/mock-detectors.ts`:
- Image: 35% AI (conf 0.78-0.96), 55% human, 10% inconclusive
- Text: real text_stats + mock verdict with caveats

### API Routes (16 total)

All in `frontend/src/app/api/`:

| Route | Method | Purpose |
|-------|--------|---------|
| `detect/image` | POST | Image detection + Supabase write |
| `detect/text` | POST | Text detection + Supabase write |
| `detect/preview` | POST | Text detection WITHOUT Supabase write (preview mode) |
| `information-diet` | GET | Information Diet Score by user_id |
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

**7 tables:** `profiles`, `scans`, `content_sightings`, `platform_slop_index`, `exposure_scores`, `information_diet_scores`, `daily_snapshots`

**11 views:** `v_personal_stats`, `v_personal_by_platform`, `v_personal_by_content_type`, `v_personal_by_verdict`, `v_community_stats`, `v_community_by_platform`, `v_community_by_content_type`, `v_community_trends`, `v_domain_leaderboard`, `v_slop_index_latest`, `v_top_provenance`

**4 RPC functions:**
- `record_scan_with_provenance(...)` — Insert scan + upsert profile + update content_sightings
- `compute_exposure_score(user_id)` — Calculate 0-850 awareness score
- `compute_slop_index()` — Grade platforms A+ through F
- `compute_information_diet_score(user_id)` — Calculate 0-100 diet score with letter grade

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

`frontend/src/lib/api.ts` — 13 functions using relative URLs (no external API dependency). Includes `getSlopIndex()`, `getExposureScore()`, `getTopProvenance()`, `getInformationDietScore()`, `detectPreview()`.

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
- `frontend/src/lib/real-detectors.ts` — Real HuggingFace ML detection (multi-signal ensemble)
- `frontend/src/lib/mock-detectors.ts` — Mock fallback detection logic + shared `computeTextStats()`
- `frontend/src/lib/constants.ts` — Colors, IDs, RequestQueue

### Dashboard Components

- `frontend/src/app/dashboard/page.tsx` — Main dashboard (personal + community tabs)
- `frontend/src/app/dashboard/SlopIndexCard.tsx` — Platform report cards
- `frontend/src/app/dashboard/ExposureScoreCard.tsx` — Personal awareness score
- `frontend/src/app/dashboard/ProvenanceTable.tsx` — Crowd-sourced truth table
- `frontend/src/app/dashboard/PersonalTab.tsx` — Personal analytics charts
- `frontend/src/app/dashboard/CommunityTab.tsx` — Community analytics charts

### Pages (7 total)

- `frontend/src/app/page.tsx` — Landing (hero, stats, how-it-works)
- `frontend/src/app/feed/page.tsx` — Demo feed (20 posts, IntersectionObserver scanning)
- `frontend/src/app/analyze/page.tsx` — Text Analyzer (sentence-level AI detection)
- `frontend/src/app/my-diet/page.tsx` — Information Diet (score gauge, breakdown cards, tips, recent scans)
- `frontend/src/app/platform/page.tsx` — Platform Simulator (Twitter/Reddit/LinkedIn/Instagram)
- `frontend/src/app/dashboard/page.tsx` — Dashboard (personal + community analytics)
- `frontend/src/app/extension/page.tsx` — Extension info (features, install steps, CTA)

### Extension Features (v0.3.0 — Selection + Hover UX)

- `extension/manifest.json` — MV3, `<all_urls>` content scripts + host permissions, pig icon
- `extension/content.js` — **Selection-based text** (highlight → popup → insight), **image hover borders** (colored outline on hover, tooltip at edge), **video scanning** (poster/frame capture), max 2 concurrent scans, content filtering (label/blur/hide), per-page stats
- `extension/background.js` — API calls with safe offline fallback (returns human/0 confidence), platform detection (8 platforms), context menus ("Scan with Baloney" for images, "Check with Baloney" for text)
- `extension/popup.html` — Pig logo, stats, exposure bar, filter buttons, IDS card, This Page, Top Pages, session timer
- `extension/styles.css` — Hover borders (outline per verdict color), selection popup with scan button + insight, loading spinner, content filtering, page indicator
- `extension/icons/` — Pig face icons (SVG-generated) at 16/48/128px on navy rounded-square background

## Development

### Local Setup

```bash
cd frontend
npm install
cp .env.example .env.local   # Supabase credentials included
npm run dev
```

### Chrome Extension (local)

1. Open `chrome://extensions`, enable Developer Mode
2. Click "Load unpacked" → select the `extension/` folder
3. Extension points at https://trustlens-nu.vercel.app (production API)

### Verification

```bash
cd frontend
npx tsc --noEmit     # TypeScript check (must be 0 errors)
npm run build        # Production build (must succeed)
```

### Git

- Repo: https://github.com/nategarelik/baloney (private, was trustlens)
- Branch: `master`
- Commit style: conventional commits (feat:, fix:, chore:, docs:)
- Stage specific files, never `git add -A`

## Documentation

- `docs/ARCHITECTURE.md` — System diagrams (Mermaid), database ER, component hierarchy, design decisions
- `docs/API.md` — Full API reference (missing detect/preview and information-diet endpoints)
- `docs/AI_CITATION.md` — AI tools disclosure (hackathon requirement)
- `docs/PRESENTATION.md` — 5-minute pitch guide and demo recovery plan
- `docs/MANUAL_TEST_RESULTS.md` — Manual testing checklist and results

## Deployment Notes

- Vercel auto-deploy from GitHub broke when repo was renamed from `trustlens` to `baloney`
- Use `cd frontend && npx vercel --prod --yes` from the repo root to deploy manually
- Or run from the project root: `npx vercel --prod --yes` (Vercel config is in `frontend/.vercel/`)

## Known Limitations

- Supabase RLS is permissive (hackathon mode) — real security is in API routes
- No rate limiting on public endpoints
- Next.js images use `<img>` tags instead of `<Image>` to avoid remote domain config
- `compute_slop_index()` uses `ROUND(...::numeric, 2)` — Postgres requires numeric cast for 2-arg ROUND
- `information_diet_scores` table has RLS disabled (only table without it)
- `daily_snapshots` table is empty (never populated)
- Extension hardcodes API URL to `https://trustlens-nu.vercel.app` (no local dev support)
- HuggingFace free tier has rate limits (~30k chars/day for text, ~100 images/day)
- Video analysis uses poster frame or single captured frame (not multi-frame)

## Future Development (Hackathon Win Strategy)

### High-Impact Quick Wins
- **Real detection demo**: Set `HUGGINGFACE_API_KEY` on Vercel → instant upgrade from mock to real ML
- **Extension polish**: Load extension in Chrome for live demo — judges love interactive demos
- **Data pipeline**: Populate `daily_snapshots` table → enables trend visualizations

### Differentiators to Emphasize
1. **Multi-modal ensemble** — 3 methods per modality (RoBERTa + embeddings + statistical for text; ViT + FFT + metadata for images)
2. **Selection-based UX** — Intentional detection (user highlights text) vs passive scanning. More respectful, more trustworthy
3. **Content Provenance** — SHA-256 crowd-sourced truth across platforms. No other tool does this
4. **Information Diet Score** — Gamification of AI awareness. Unique concept in the space
5. **Open architecture** — Real HuggingFace models with graceful fallback. Not a black box

### Demo Script Tips
- Start with extension: highlight text on any article → show insight popup with WHY explanations
- Hover over images → colored border appears → move to edge → tooltip with visual analysis
- Switch to dashboard → show personal stats updating in real-time
- Show AI Slop Index → platform report cards with letter grades
- Close with Information Diet Score → gamification angle
