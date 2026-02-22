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
| Frontend (Vercel) | https://baloney.app | Live |
| Supabase | https://xpeubpqbqlyxawjovxuy.supabase.co | Live |
| GitHub | https://github.com/nategarelik/baloney | Live (private) |

### Environment Variables

**Vercel (frontend):**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase publishable anon key
- `SEED_SECRET` — Protects the `/api/seed` endpoint
- `PANGRAM_API_KEY` — Pangram text detection API (99.85% accuracy, 5 free/day)
- `SIGHTENGINE_API_USER` — SightEngine API user ID (98.3% image accuracy, 2000 ops/month)
- `SIGHTENGINE_API_SECRET` — SightEngine API secret
- `GOOGLE_CLOUD_PROJECT_ID` — Google Cloud project for SynthID Image (Vertex AI)
- `GOOGLE_CLOUD_REGION` — Google Cloud region (default: us-central1)
- `GOOGLE_CLOUD_API_KEY` — Google Cloud API key for Vertex AI
- `RAILWAY_BACKEND_URL` — Railway Python backend URL for SynthID Text detection

**Local development:** Copy values to `frontend/.env.local`

### Seeding Data

Hit the seed endpoint once after deploying:
```bash
curl -X POST "https://baloney.app/api/seed" -H "x-seed-secret: $SEED_SECRET"
```

This creates 50 users, 535 scans, computes slop index and exposure scores.

## Key Patterns

### Real AI Detection (v5.0 Primary APIs Only)

Detection is handled by `frontend/src/lib/real-detectors.ts` — cascading pipeline with primary commercial APIs only. All detection runs server-side in Next.js API routes. Secondary/backup code (HuggingFace, Mac Studio backend, Reality Defender) is commented out but preserved in the file.

**Text Detection (3 signals):**
- **Pangram** — 99.85% accuracy SOTA commercial API (Emi & Spero 2024, arXiv:2402.14873)
- **SynthID Text** — Google Gemini watermark detection via Railway Python backend. Override: if watermarked, returns 0.97 probability immediately
- **Statistical** — 12 features: burstiness, entropy, readability, transition words, hedging (used for feature_vector in Pangram/SynthID paths)

**Image Detection (4 signals):**
- **SightEngine** — 98.3% accuracy, ARIA benchmark #1, covers 120+ AI generators
- **SynthID Image** — Google Imagen watermark detection via Vertex AI. Override: if detected, returns 0.95 probability immediately
- **Frequency/DCT** — Local variance + high-frequency energy + DCT coefficient analysis
- **Metadata/EXIF** — Camera provenance, EXIF markers, C2PA content credentials

**Video Detection:**
- **SightEngine Native** — Server-side video analysis only (no multi-frame fallback)

**Error behavior:** If both primary APIs fail for a modality, the pipeline throws an error (no mock fallback).

### Mock Detection (Disabled)

Mock detectors exist in `frontend/src/lib/mock-detectors.ts` but are no longer called from active code paths. `computeTextStats()` is still imported and used by the statistical analysis pipeline. Mock fallback imports are commented out in `real-detectors.ts`.

### API Routes (17 total)

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
| `scans/all` | GET | All recent scans across all users (live dashboard) |
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

`frontend/src/lib/types.ts` contains 20+ interfaces. Key types:
- `DetectionResult`, `TextDetectionResult`, `VideoDetectionResult` — detection responses
- `MethodScore` — per-method score/weight/label for ensemble breakdown
- `PangramWindow` — Pangram per-segment AI classification windows
- `PersonalAnalytics`, `CommunityAnalytics` — dashboard data
- `SlopIndexEntry`, `ExposureScore`, `ContentProvenance` — innovative feature types
- `ScanRecord`, `FeedPostData` — history and feed

### API Client

`frontend/src/lib/api.ts` — 14 functions using relative URLs (no external API dependency). Includes `getSlopIndex()`, `getExposureScore()`, `getTopProvenance()`, `getInformationDietScore()`, `detectPreview()`, `getAllScans()`.

### Demo User

`DEMO_USER_ID = "demo-user-001"` — hardcoded in `frontend/src/lib/constants.ts`. Has sharing_enabled=true, ~45 scans, exposure score 462 "Vigilant".

### Chart Theming

All Recharts components use warm Baloney theme from `CHART_COLORS` in `constants.ts`:
- AI: `#d4456b` (primary pink), Human: `#16a34a` (green), Unclear: `#f59e0b` (amber)
- Axis labels: `rgba(74,55,40,0.5)` (secondary/50), Grid: `rgba(74,55,40,0.08)`
- Tooltip: cream bg `#f0e6ca`, brown text `#4a3728`

### Dashboard Theme

All dashboard components use warm Baloney palette (restyled from navy in Phase 3):
- Card backgrounds: `bg-base-dark`, borders: `border-secondary/10`
- Inset panels: `bg-secondary/5`, skeleton fills: `bg-secondary/8`
- Text hierarchy: `text-secondary` (headings), `text-secondary/70` (data), `text-secondary/50` (labels/subtitles)

### Badge Colors

Detection badges match extension `styles.css` exactly:
- AI: `rgba(220,38,38,0.85)`, Human: `rgba(22,163,74,0.80)`, Unclear: `rgba(202,138,4,0.80)`

## File Reference

### Critical Files (read before modifying)

- `frontend/src/lib/types.ts` — Type contract
- `frontend/src/lib/api.ts` — All API calls (relative URLs)
- `frontend/src/lib/supabase.ts` — Supabase client
- `frontend/src/lib/real-detectors.ts` — Real AI detection (v5.0 — primary APIs only: Pangram, SightEngine, SynthID, statistical)
- `frontend/src/lib/mock-detectors.ts` — Mock fallback detection logic (disabled) + shared `computeTextStats()`
- `frontend/src/lib/constants.ts` — Colors, IDs, RequestQueue

### Dashboard Components

- `frontend/src/app/dashboard/page.tsx` — Live dashboard showing ALL users' scans (3 stats + AI rate by site chart + recent scans table, 15s auto-refresh)
- `frontend/src/app/dashboard/AiRateBySiteChart.tsx` — Multi-line Recharts chart showing AI rate per platform over time
- `frontend/src/app/dashboard/community/page.tsx` — Community dashboard (stats + By Website bar chart + By Medium bar chart, 15s auto-refresh)
- `frontend/src/app/dashboard/SlopIndexCard.tsx` — Platform report cards
- `frontend/src/app/dashboard/ProvenanceTable.tsx` — Crowd-sourced truth table
- `frontend/src/app/dashboard/CommunityTab.tsx` — Community analytics charts

### Pages (9 total)

- `frontend/src/app/page.tsx` — Landing (hero, stats, how-it-works)
- `frontend/src/app/feed/page.tsx` — Demo feed (20 posts, IntersectionObserver scanning)
- `frontend/src/app/analyze/page.tsx` — AI Detector (tabbed: Text, Image, Video) with method breakdown visualization
- `frontend/src/app/analyze/MethodBreakdown.tsx` — Per-method score bars with SynthID watermark badges
- `frontend/src/app/evaluation/page.tsx` — Evaluation dashboard (ROC curve, confusion matrix, per-domain accuracy, ablation study, benchmark comparison)
- `frontend/src/app/my-diet/page.tsx` — Information Diet (score gauge, breakdown cards, tips, recent scans)
- `frontend/src/app/platform/page.tsx` — Platform Simulator (Twitter/Reddit/LinkedIn/Instagram)
- `frontend/src/app/dashboard/page.tsx` — Personal Dashboard (stats + per-site chart + scan table)
- `frontend/src/app/dashboard/community/page.tsx` — Community Dashboard (stats + by website + by medium charts)
- `frontend/src/app/extension/page.tsx` — Extension info (features, install steps, CTA)

### Extension Features (v0.4.0 — Warm Theme + Dot UI + Sidepanel)

- `extension/manifest.json` — MV3, `<all_urls>` content scripts + host permissions, pig icon, `sidePanel` permission, `minimum_chrome_version: 114`
- `extension/content.js` — **Selection-based text** (highlight → popup → insight + colored underlines), **detection dots** (10px colored dot on images/videos, expands on hover to show "78% AI", click opens sidepanel), **video scanning** (poster/frame capture), max 3 concurrent scans, **gating system** (master on/off, allowed sites list, per-type auto-scan toggles), content mode (scan/blur/block), per-page stats
- `extension/background.js` — API calls with safe offline fallback, platform detection (12 platforms), context menus, **storage defaults + migration** (filterMode→contentMode), **sidepanel open handler**, session stats preserved across service worker wakes
- `extension/popup.html` — **Warm Baloney theme** (cream bg, Young Serif + DM Sans), pig logo, master on/off toggle + status light, pink/gold stat cards, 3 auto-scan toggles (text OFF, images ON, videos ON), segmented Scan/Blur/Block control, 3D pink dashboard CTA
- `extension/sidepanel.html` + `extension/sidepanel.js` — **Chrome sidepanel** detail view with verdict banner, confidence meter, reasoning bullets, sentence breakdown (text), model attribution
- `extension/styles.css` — Detection dots with expand animation, text underlines (Grammarly-style slide-in), warm-themed selection popup + page indicator + blur overlay, content filtering
- `extension/icons/` — Pig face icons (SVG-generated) at 16/48/128px on navy rounded-square background

### Extension Storage Schema (v0.4.0)

| Key | Type | Default |
|-----|------|---------|
| `extensionEnabled` | boolean | `true` |
| `autoScanText` | boolean | `false` |
| `autoScanImages` | boolean | `true` |
| `autoScanVideos` | boolean | `true` |
| `contentMode` | `"scan"/"blur"/"block"` | `"scan"` |
| `allowedSites` | string[] | `["x.com","linkedin.com","substack.com","reddit.com","facebook.com","instagram.com","medium.com","tiktok.com","threads.net"]` |
| `sidepanelData` | object | null |

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
3. Extension points at https://baloney.app (production API)

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
- `docs/AI_CITATION.md` — AI tools disclosure (hackathon requirement) — updated for v3.0 APIs
- `docs/PRESENTATION.md` — 5-minute pitch guide, demo recovery plan, judging criteria alignment
- `docs/MANUAL_TEST_RESULTS.md` — Manual testing checklist and results

## Deployment Notes

- Vercel `frontend` project (serves `baloney.app`) has GitHub auto-deploy connected
- Root directory must be set to `frontend` in Vercel dashboard (Settings → General → Root Directory)
- Manual deploy: `cd frontend && npx vercel --prod --yes`
- Old `trustlens` Vercel project still exists but is obsolete — safe to delete once root directory is confirmed

## Known Limitations

- Supabase RLS is permissive (hackathon mode) — real security is in API routes
- No rate limiting on public endpoints
- Next.js images use `<img>` tags instead of `<Image>` to avoid remote domain config
- `compute_slop_index()` uses `ROUND(...::numeric, 2)` — Postgres requires numeric cast for 2-arg ROUND
- `information_diet_scores` table has RLS disabled (only table without it)
- `daily_snapshots` table is empty (never populated)
- Extension hardcodes API URL to `https://baloney.app` (no local dev support)
- Pangram API: 5 free requests/day — use sparingly, live demo only
- SightEngine: 2000 ops/month — budget for eval + demos
- Video analysis uses SightEngine native endpoint only (no multi-frame fallback)
- Secondary/backup code (HuggingFace, Mac Studio backend, Reality Defender) is commented out in `real-detectors.ts` but preserved for future reference

## v5.0 Differentiators

1. **Primary API ensemble** — Pangram (99.85%), SightEngine (98.3%), SynthID watermarks, statistical/frequency/metadata — per modality
2. **Google SynthID detection** — "We detect Google's own watermarks" — crown jewel differentiator
3. **Method breakdown visualization** — Shows exactly WHY content was flagged, per-method scores and weights
4. **Rigorous evaluation** — 200+ sample dataset, ROC curves (AUC 0.982), confusion matrix, ablation studies, benchmark comparisons
5. **Selection-based UX** — Intentional detection (user highlights text) vs passive scanning
6. **Content Provenance** — SHA-256 crowd-sourced truth across platforms
7. **Information Diet Score** — Gamification of AI awareness

### Demo Script (5 minutes)
1. Extension on X → text underlines, image dots → hover → "92% AI (Pangram)" → click → method breakdown
2. Paste AI text in Analyze → Pangram leading ensemble → method breakdown shows 3 signals
3. Gemini-generated text → SynthID watermark detected badge
4. Image → SightEngine + frequency + metadata → method breakdown shows 4 signals
5. Dashboard → Information Diet Score, AI Slop Index
6. `/evaluation` page → ROC curve, confusion matrix, ablation study
