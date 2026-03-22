# Baloney Pro

AI content detection platform. Next.js 16 frontend (Vercel) + FastAPI ML backend (Railway) + Chrome Extension + SynthID backend (Railway).

**Platform docs:** [github.com/nategarelik/baloney-platform](https://github.com/nategarelik/baloney-platform) (private) -- investor-ready documentation covering product, technology, market, vision, and appendix across 17 documents.

## Quick Reference

| Key | Value |
|-----|-------|
| Frontend | Next.js 16.1.6, React 19, TS 5.7 strict, Tailwind, Recharts, Vitest |
| Backend | FastAPI (Python 3.11), Railway, 9-model ML ensemble, Apple Silicon MPS |
| SynthID | FastAPI microservice (Railway), HuggingFace SynthID watermark detector |
| Extension | Chrome MV3, vanilla JS (no build step), content + background + popup + sidepanel |
| DB | Supabase (xpeubpqbqlyxawjovxuy), RPC for scans/analytics/provenance |
| Hosting | Vercel (frontend), Railway (backend + synthid-backend) |
| Styling | Tailwind CSS + Young Serif (headings) + DM Sans (body) |
| Tests | Vitest (36 tests, 1 suite, 100% passing) |
| Mobile client | ~/Baloney-mobile/baloney-mobile (Expo SDK 55 thin client) |
| Platform docs | ~/Baloney-platform/baloney-platform (private, investor materials) |

## Commands

| Task | Command |
|------|---------|
| Dev server | `cd frontend && npm run dev` |
| Typecheck | `cd frontend && npx tsc --noEmit` |
| Lint | `cd frontend && npm run lint` |
| Test | `cd frontend && npm test` |
| Build | `cd frontend && npm run build` |
| Backend (local) | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000` |

## File Map

```
frontend/src/
  app/                     10 pages + 24 API routes
    analyze/               AI detector playground (15 viz components)
    dashboard/             Analytics dashboard (21 viz components + community page)
    feed/                  Social feed simulator
    tracker/               Platform AI prevalence tracker
    product/               Product landing page
    extension/             Extension docs + evaluation
    evaluation/            Benchmark results
    platform/              Platform simulator
    allowed-sites/         Extension site whitelist
    api/
      detect/              text, image, video, phishing, preview
      scans/               me (user history), all (global)
      analytics/           personal, community (7 sub-routes), tracker
      health, exposure-score, provenance, seed, slop-index, sharing/
  lib/                     16 modules (5,637 lines)
    real-detectors.ts      Detection pipeline (2,087 lines -- SynthID + Pangram + Statistical)
    detection-config.ts    SINGLE SOURCE OF TRUTH -- all thresholds, weights, formulas
    types.ts               All TypeScript types (4 verdicts, 12 platforms, 30+ interfaces)
    api.ts                 Typed API client (21 functions, timeouts, AbortController)
    api-utils.ts           errorResponse, validatePlatform, clampInt
    bayesian.ts            Bayesian posterior + confidence floor (0.5)
    constants.ts           Brand colors, verdict colors, API limits, RequestQueue
    phishing-detector.ts   80+ feature phishing heuristic engine
    mock-detectors.ts      computeTextStats utility
    supabase.ts            Supabase client init
    cn.ts                  clsx + tailwind-merge
    error-messages.ts      HTTP error -> user message mapping
  components/              10 reusable UI (Navbar, ConfidenceRing, Toast, etc.)
  hooks/                   useUserId (localStorage + extension bridge)
  __tests__/               1 test file (36 tests) + datasets (207 samples)
backend/app/
  main.py                  FastAPI (6 endpoints: health, analyze, analyze-batch, analyze-image, analyze-image-b64, detect-phishing)
  services/
    text_detector.py       5-model ensemble: DeBERTa (0.30) + SuperAnnotate (0.25) + RoBERTa-ChatGPT (0.10) + MiniLM embeddings (0.10) + Statistical (0.25)
    image_detector.py      4-signal ensemble: SigLIP (0.35) + ViT-v2 (0.25) + FFT (0.22) + EXIF (0.18)
    statistical_features.py  12-feature linguistic analysis
    phishing_detector.py   80+ feature heuristic scoring (666 lines)
synthid-backend/
  main.py                  SynthID watermark detection (HuggingFace, Railway)
extension/
  manifest.json            Chrome MV3, host_permissions: <all_urls>
  background.js            Service worker (API calls, CORS bypass, user ID)
  content.js               Page injection (image/text/video scanning, detection dots, toast cards)
  popup.html/js            Quick stats + settings toggles
  sidepanel.html/js        Detailed analysis view
docs/
  ANALYSIS.md              Comprehensive repo analysis
```

## Architecture Rules

1. **Detection config source of truth**: `frontend/src/lib/detection-config.ts` -- all thresholds, weights, ensemble formulas, evaluation data
2. **Detection pipeline**: `frontend/src/lib/real-detectors.ts` -- text: SynthID -> Pangram -> Statistical; image: SynthID -> SightEngine -> FFT -> EXIF
3. **Types in `frontend/src/lib/types.ts`** -- 4 verdicts: human, light_edit, heavy_edit, ai_generated
4. **API utils in `frontend/src/lib/api-utils.ts`** -- errorResponse(), validatePlatform(), clampInt()
5. **Supabase RPC for scan recording** -- `record_scan_with_provenance()` (fire-and-forget after response)
6. **Tailwind + cn()** from `lib/cn.ts` for class merging
7. **Extension is vanilla JS** -- no TypeScript, no build step, no npm. Config values are hardcoded (49 TODOs to sync with detection-config.ts)
8. **Bayesian confidence floor** -- scores below 0.5 downgrade to "inconclusive" for display via `lib/bayesian.ts`

## API Contracts (Frontend Routes)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/detect/text` | Text AI detection (Pangram + SynthID + Statistical) |
| POST | `/api/detect/image` | Image AI detection (SightEngine + SynthID + FFT + EXIF) |
| POST | `/api/detect/video` | Video AI detection (SightEngine native + frame fallback) |
| POST | `/api/detect/phishing` | Phishing HTML classification |
| POST | `/api/detect/preview` | Preview text detection (no DB recording) |
| GET | `/api/scans/me?user_id=&limit=&offset=` | User scan history (paginated) |
| GET | `/api/scans/all?limit=` | Global scan feed |
| GET | `/api/analytics/personal?user_id=` | User detection stats |
| GET | `/api/analytics/community` | Global detection stats |
| GET | `/api/analytics/community/trends?days=` | AI rate trends |
| GET | `/api/analytics/community/domains?limit=` | Top AI source domains |
| GET | `/api/analytics/community/heatmap` | 7x24 scan activity grid |
| GET | `/api/analytics/community/radar` | Platform health profiles |
| GET | `/api/analytics/community/flow` | Sankey flow data |
| GET | `/api/analytics/community/treemap` | Platform x category breakdown |
| GET | `/api/analytics/community/sentinel-distribution` | User level distribution |
| GET | `/api/analytics/tracker?platform=&content_type=&days=` | Platform trends |
| GET | `/api/health` | Health check |
| GET | `/api/exposure-score?user_id=` | User AI exposure score |
| GET | `/api/provenance?limit=` | Top reused content hashes |
| GET | `/api/slop-index` | Platform AI pollution grades |
| GET/POST | `/api/sharing/status` `/api/sharing/toggle` | Community sharing |
| POST | `/api/seed` | Seed demo data (requires x-seed-secret header) |

## Common Patterns

### New API route
1. Create `frontend/src/app/api/route-name/route.ts`
2. Use `api-utils.ts` (errorResponse, validatePlatform, clampInt)
3. Add response type to `frontend/src/lib/types.ts`
4. Record scan via `supabase.rpc("record_scan_with_provenance")` if applicable
5. Fire-and-forget `compute_exposure_score()` + `compute_slop_index()` (10% sampling)

### New detection method
1. Add to `frontend/src/lib/real-detectors.ts` in the cascade chain
2. Register weight in `frontend/src/lib/detection-config.ts`
3. Add `MethodScore` entry with tier: "primary" | "watermark" | "escalation" | "fallback"
4. Update test cases in `frontend/src/__tests__/datasets.ts`

### New dashboard visualization
1. Create component in `frontend/src/app/dashboard/ComponentName.tsx`
2. Use Recharts (BarChart, LineChart, ScatterChart, RadarChart, etc.)
3. Use `CHART_COLORS` from `lib/constants.ts`
4. Add API endpoint if new data needed
5. Add to `CommunityTab.tsx` or `PersonalTab.tsx`

## Error Recovery

| Symptom | Cause | Fix |
|---------|-------|-----|
| Detection timeout | Pangram/SightEngine slow | Fallback to statistical/frequency analysis (built in) |
| 429 on Pangram | Rate limited (5 free/day) | Statistical fallback activates automatically |
| Backend models not loading | Missing VRAM | Check MPS device availability, reduce batch size |
| SynthID backend error | Model gated on HuggingFace | Set HF_TOKEN env var, or falls back to TinyLlama tokenizer |
| Extension not scanning | Site not in allowedSites | Check allowed-sites page, verify hostname matching |
| Hydration mismatch | SSR user ID | useUserId() starts with DEMO_USER_ID, updates client-side |
