# Baloney Pro -- Comprehensive Repository Analysis

**Date:** 2026-03-20
**Scope:** Full codebase audit -- architecture, quality, detection pipeline, security, and technical debt
**Repository:** baloney (AI content detection platform)

---

## 1. Executive Summary

Baloney Pro is a multi-service AI content detection platform comprising a Next.js 16 frontend (Vercel), a FastAPI Python ML backend (Railway/local Mac Studio), a SynthID watermark detection microservice (Railway), and a Chrome MV3 browser extension. It detects AI-generated text, images, and video using ensemble methods combining commercial APIs (Pangram, SightEngine, Google SynthID) with local statistical analysis.

The project was built at the MadData26 hackathon by 2 primary contributors (+ Claude AI). It has 101 commits, solid TypeScript type safety (zero errors), 36 passing unit tests, and a well-designed detection config system. Key weaknesses are limited test coverage (1 test file), a 2,087-line monolith in `real-detectors.ts`, 49 TODO comments in the extension, and 104 console statements in the frontend.

### Scorecard

| Dimension | Grade | Notes |
|-----------|-------|-------|
| Architecture | A | 4-service design, clean separation, single config source of truth |
| Detection Quality | A | 0.982 ROC AUC (text), 0.975 (image), 207 benchmark samples |
| Type Safety | A+ | Zero TS errors, strict mode, comprehensive type system |
| Test Coverage | C+ | 36 passing tests but only 1 test file; no API/component/backend tests |
| Code Quality | B | Zero type errors, but 104 console statements, 49 TODOs in extension |
| Security | B+ | No auth on most routes (user_id optional), CORS open, but no secrets exposed |
| Build/Deploy | B+ | Vercel + Railway auto-deploy, but no CI pipeline for tests |
| Extension | B | Feature-rich but all config hardcoded (49 sync TODOs) |
| Documentation | B+ | Comprehensive CLAUDE.md, but no inline code docs |

---

## 2. Codebase Metrics

### Scale

| Metric | Count |
|--------|-------|
| Frontend TypeScript files | 110 |
| Backend Python files | 8 |
| Extension JS files | 5 |
| Frontend lines of code | ~21,530 |
| Backend lines of code | ~1,731 |
| Extension lines of code | ~3,500 (estimated) |
| API routes | 24 |
| Pages | 10 |
| Components (reusable) | 10 |
| Dashboard visualizations | 21 |
| Analyze visualizations | 15 |
| Hooks | 1 |
| Lib modules | 16 |
| Test files | 1 (36 tests, 207 samples) |
| Type errors | 0 |
| TODO comments | 49 (all in extension) |
| Console statements | 104 (frontend) |

### Largest Files (complexity hotspots)

| File | Lines | Risk |
|------|-------|------|
| `frontend/src/lib/real-detectors.ts` | 2,087 | High -- monolith, should decompose |
| `frontend/src/__tests__/datasets.ts` | 1,925 | Low -- test data |
| `frontend/src/app/evaluation/page.tsx` | 1,792 | Medium -- evaluation dashboard |
| `frontend/src/app/analyze/page.tsx` | 515 | Low |
| `frontend/src/lib/phishing-detector.ts` | 1,100 | Medium -- large heuristic engine |
| `backend/app/services/phishing_detector.py` | 666 | Low -- standalone service |
| `backend/app/services/text_detector.py` | 421 | Low -- clear ML pipeline |

### Git History

| Metric | Value |
|--------|-------|
| Total commits | 101 |
| Primary contributors | nategarelik (~51), Ben Verhaalen (43), Claude (7) |
| Development origin | MadData26 hackathon |
| Branch | master |
| Recent velocity | Dormant (0 commits in last 2 weeks) |

---

## 3. Architecture Analysis

### System Design

```
+-------------------+     HTTPS      +---------------------+
|                   | <----------->  |                     |
|  Chrome Extension |   base64 +     |   baloney.app       |
|  (MV3, vanilla JS)|   user_id     |   (Next.js 16,      |
|                   |                |    Vercel)           |
+-------------------+                |                     |
                                     |   24 API routes     |
+-------------------+     HTTPS      |   10 pages          |
|                   | <----------->  |   21 dashboard viz   |
|  Baloney Mobile   |   Bearer token |   15 analyze viz     |
|  (Expo SDK 55)    |   + install ID |                     |
|                   |                +----------+----------+
+-------------------+                           |
                                                |  API cascade
                                     +----------+----------+
                                     |                     |
                              +------+------+    +---------+--------+
                              |             |    |                  |
                              | Pangram API |    | SightEngine API  |
                              | (text, 99%) |    | (image, 98%)     |
                              +-------------+    +------------------+
                                     |
                              +------+------+    +---------+--------+
                              |             |    |                  |
                              | SynthID     |    | Mac Studio       |
                              | Backend     |    | Backend          |
                              | (Railway)   |    | (local, 9 models)|
                              +-------------+    +------------------+
                                     |
                              +------+------+
                              |             |
                              | Supabase    |
                              | (Postgres)  |
                              +-------------+
```

### Detection Pipelines

**Text Detection** (3-signal cascade):
```
Input text
  |
  v
[Watermark] SynthID text watermark detector
  -> If detected: verdict = ai_generated, confidence = 0.97 (OVERRIDE)
  |
  v
[Primary] Pangram API (99.85% accuracy, 5 free/day)
  -> Returns: per-sentence AI scores, overall confidence, pangram windows
  -> If rate-limited/timeout: fall through
  |
  v
[Fallback] Statistical 12-feature analysis (local, instant)
  -> Burstiness, TTR, perplexity, repetition, sentence/word length,
     readability, transition density, hedging, comma density,
     expressive punctuation, paragraph repetition, bigram entropy
  |
  v
Ensemble weighting -> Bayesian posterior -> Verdict mapping
  -> Verdict thresholds: ai_generated=0.75, heavy_edit=0.55, light_edit=0.35
  -> Confidence floor: 0.5 (below = inconclusive)
```

**Image Detection** (4-signal cascade):
```
Input image (base64)
  |
  v
[Watermark] SynthID image via Google Vertex AI
  -> If detected: verdict = ai_generated, confidence = 0.95 (OVERRIDE)
  |
  v
[Primary] SightEngine API (98.3% ARIA benchmark, 120+ generators)
  -> Returns: AI probability, generator name
  -> If rate-limited: fall through
  |
  v
[Secondary] FFT frequency analysis (local, instant)
  -> 2D FFT -> radial profile -> high/mid/low frequency bands
  -> AI images have lower high-frequency energy
  |
  v
[Tertiary] EXIF metadata analysis (local, instant)
  -> Camera Make/Model, GPS, exposure, datetime
  -> 3+ signals = likely real (0.10), 0 signals = possibly AI (0.60)
  |
  v
Ensemble weighting -> Verdict mapping
  -> Verdict thresholds: ai_generated=0.65, heavy_edit=0.45, light_edit=0.30
```

**Video Detection** (SightEngine native):
```
Input video/frames
  |
  v
[Primary] SightEngine native video endpoint (server-side frame extraction)
  -> Returns: per-frame AI scores, frames analyzed, AI frame percentage
  |
  v
[Fallback] Frame-by-frame image detection (if native fails)
  -> Uses realImageDetection() on first frame
  |
  v
Verdict: score >0.65 = ai_generated, >0.45 = heavy_edit, >0.30 = light_edit
```

### Local ML Backend (Mac Studio M2 Ultra)

**Text Ensemble** (5 models, ~4.5GB VRAM):
| Model | Weight | Architecture | Accuracy |
|-------|--------|-------------|----------|
| DeBERTa-v3-large (desklib) | 0.30 | BERT encoder + classifier | RAID #1 |
| SuperAnnotate/ai-detector | 0.25 | RoBERTa-Large, 14 LLMs | 98-99% |
| RoBERTa-ChatGPT (HC3) | 0.10 | RoBERTa, ChatGPT era | HC3 baseline |
| MiniLM-v2 embeddings | 0.10 | Sentence similarity | Uniformity analysis |
| Statistical (12 features) | 0.25 | Pure math | Burstiness/TTR/FK |

**Image Ensemble** (4 signals):
| Signal | Weight | Type | Accuracy |
|--------|--------|------|----------|
| SigLIP deepfake | 0.35 | ViT classifier | 94.44% |
| ViT deepfake v2 | 0.25 | ViT classifier | 92.12% |
| FFT frequency | 0.22 | Spectral analysis | Local |
| EXIF metadata | 0.18 | Provenance check | Local |

---

## 4. API Surface

### Detection Routes (5)

| Route | Method | Body | Response | External APIs |
|-------|--------|------|----------|---------------|
| `/api/detect/text` | POST | `{text, user_id?, platform?}` | TextDetectionResult + scan_id | SynthID, Pangram |
| `/api/detect/image` | POST | `{image: base64, user_id?, platform?}` | DetectionResult + scan_id | SynthID, SightEngine |
| `/api/detect/video` | POST | `{video?: base64, frames?: base64[]}` | VideoDetectionResult + scan_id | SightEngine native |
| `/api/detect/phishing` | POST | `{html, url?}` | PhishingResult | None (local heuristics) |
| `/api/detect/preview` | POST | `{text, platform?}` | DetectionResult (no DB recording) | SynthID, Pangram |

### Data Routes (19)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/scans/me` | GET | User scan history (paginated, limit 1-200) |
| `/api/scans/all` | GET | Global scan feed (limit 1-500) |
| `/api/analytics/personal` | GET | User stats (4 parallel view queries) |
| `/api/analytics/community` | GET | Global stats (3 parallel view queries) |
| `/api/analytics/community/trends` | GET | AI rate over time (1-365 days) |
| `/api/analytics/community/domains` | GET | Top domains by AI rate |
| `/api/analytics/community/heatmap` | GET | 7x24 scan activity grid (30 days) |
| `/api/analytics/community/radar` | GET | Platform health profiles (5 axes) |
| `/api/analytics/community/flow` | GET | Sankey: content_type -> platform -> verdict |
| `/api/analytics/community/treemap` | GET | Platform x category breakdown |
| `/api/analytics/community/sentinel-distribution` | GET | User exposure level distribution |
| `/api/analytics/tracker` | GET | Platform-specific trend data |
| `/api/health` | GET | Health check (Supabase connectivity) |
| `/api/exposure-score` | GET | User AI exposure score (Novice->Sentinel) |
| `/api/provenance` | GET | Top content hashes by sighting count |
| `/api/slop-index` | GET | Platform AI pollution grades (A+ to F) |
| `/api/sharing/status` | GET | User community sharing preference |
| `/api/sharing/toggle` | POST | Toggle community data sharing |
| `/api/seed` | POST | Seed demo data (requires x-seed-secret) |

### Supabase Database

**Tables** (inferred from RPC calls):
- `scans` -- Detection records (user_id, content_type, platform, verdict, confidence, content_hash, scan_duration_ms, trust_score, edit_magnitude)
- `profiles` -- User preferences (sharing_enabled, updated_at)
- `exposure_scores` -- User AI exposure (score, level, streak_days, total_ai_caught)
- `content_sightings` -- Cross-platform content tracking (content_hash, sighting_count, compound_score, ai_votes, human_votes)
- `platform_slop_index` -- Platform-level AI pollution metrics

**RPC Functions**:
- `record_scan_with_provenance()` -- Record scan with 13 parameters
- `compute_exposure_score(user_id)` -- Recompute user's exposure score
- `compute_slop_index()` -- Recompute platform slop grades
- `get_tracker_trends(platform, content_type, since)` -- Trend aggregation

**Materialized Views** (11):
- `v_personal_stats`, `v_personal_by_platform`, `v_personal_by_content_type`, `v_personal_by_verdict`
- `v_community_stats`, `v_community_by_platform`, `v_community_by_content_type`
- `v_community_trends`, `v_domain_leaderboard`, `v_top_provenance`, `v_slop_index_latest`

---

## 5. Security Analysis

### Authentication Model

| Route Category | Auth Required | Identity |
|----------------|---------------|----------|
| Detection routes | None | user_id (optional, from localStorage UUID) |
| Scan history | None | user_id (query param) |
| Analytics | None | user_id or public |
| Sharing | None | user_id (body/query) |
| Seed | x-seed-secret header | Admin only |

**Risk**: No authentication on detection or history routes. Any client can read any user's scans by guessing user_id (UUID). This was acceptable for hackathon demo but should be hardened for production.

### Data Handling

- Content is never stored (only SHA-256 hash of first N chars)
- Scans recorded with: verdict, confidence, platform, duration, hash
- Page URLs hashed with SHA-256 before storage (privacy)
- CORS fully open on all services (`allow_origins=["*"]`)
- Extension uses `host_permissions: <all_urls>` for CORS bypass

### API Key Management

| Key | Storage | Risk |
|-----|---------|------|
| PANGRAM_API_KEY | .env.local (Vercel env vars) | Server-side only |
| SIGHTENGINE_API_USER/SECRET | .env.local (Vercel env vars) | Server-side only |
| GOOGLE_CLOUD_PROJECT_ID/API_KEY | .env.local (Vercel env vars) | Server-side only |
| REALITY_DEFENDER_API_KEY | .env.local (Vercel env vars) | Server-side only |
| SUPABASE_ANON_KEY | Public (NEXT_PUBLIC_*) | RLS-protected |
| SEED_SECRET | .env.local | Server-side only |

---

## 6. Chrome Extension Architecture

```
User browsing supported site
  |
  v
Content Script (content.js)
  |-- IntersectionObserver: detects images/videos entering viewport
  |-- MutationObserver: detects DOM changes (lazy-loaded content)
  |-- Text scanning: IntersectionObserver on <p>, <article>, etc.
  |
  v
chrome.runtime.sendMessage({ type: "analyze-image/text/video-frame" })
  |
  v
Background Service Worker (background.js)
  |-- fetchImageAsBase64(): CORS bypass via host_permissions
  |-- POST to baloney.app/api/detect/* (8s timeout, 2 retries)
  |-- SHA-256 page URL hash for privacy
  |
  v
Result returned to content script
  |-- createDetectionDot(): colored circle overlay on media
  |-- applyContentMode(): scan/blur/block filtered content
  |-- showTextToastResult(): toast card for text analysis
  |-- updateStats(): session tracking
  |
  v
User clicks detection dot -> sidepanel.js or baloney.app/analyze
```

**Supported Sites**: x.com, instagram.com, reddit.com, facebook.com, tiktok.com, linkedin.com, medium.com, substack.com, threads.net

**Content Modes**: scan (dot only), blur (20px blur + reveal overlay), block (hide entire post)

---

## 7. Technical Debt Register

### Critical

| ID | Item | Location | Impact |
|----|------|----------|--------|
| TD-01 | `real-detectors.ts` is 2,087 lines | `frontend/src/lib/real-detectors.ts` | Hard to maintain, review, and test |
| TD-02 | No auth on scan history routes | All `/api/scans/*` and `/api/analytics/*` | Any client can read any user's data |
| TD-03 | 104 console statements in frontend | Throughout `frontend/src/` | Production logging pollution |

### Important

| ID | Item | Location | Impact |
|----|------|----------|--------|
| TD-04 | 49 TODO comments in extension | `extension/content.js`, `extension/sidepanel.js` | Hardcoded config not synced with detection-config.ts |
| TD-05 | Only 1 test file | `frontend/src/__tests__/` | No API route, component, or backend tests |
| TD-06 | Extension has no build step | `extension/` | No TypeScript, no linting, no minification |
| TD-07 | CORS fully open | Backend + SynthID `allow_origins=["*"]` | Should restrict to known domains |

### Low Priority

| ID | Item | Location | Impact |
|----|------|----------|--------|
| TD-08 | Commented-out backup detectors | `real-detectors.ts` | Dead code (HuggingFace, RoBERTa, Reality Defender) |
| TD-09 | phishing_detector.py at 666 lines | `backend/app/services/` | Could extract feature groups |
| TD-10 | No CI pipeline for tests | No .github/workflows/ | Tests only run manually |

---

## 8. Cross-Project Contract (Mobile Client)

### Verdict Type Mapping

```
baloney-pro (4 values):          baloney-mobile (6 values):
  human            <---------->    likely_human
  light_edit       <---------->    uncertain / possibly_ai
  heavy_edit       <---------->    likely_ai
  ai_generated     <---------->    ai_generated
  (no equivalent)                  inconclusive
```

The API at baloney.app maps pro verdicts to mobile verdicts before responding. The mobile app has its own `VERDICT_COLORS` and `VERDICT_SOLID_COLORS` that must visually correspond.

### Shared API Endpoints (used by mobile)

| Endpoint | Mobile Function | Pro Handler |
|----------|----------------|-------------|
| POST `/api/detect/text` | `detectText()` in `lib/api.ts` | `frontend/src/app/api/detect/text/route.ts` |
| POST `/api/detect/image` | `detectImage()` in `lib/api.ts` | `frontend/src/app/api/detect/image/route.ts` |
| POST `/api/detect/video` | `detectVideo()` in `lib/api.ts` | `frontend/src/app/api/detect/video/route.ts` |
| POST `/api/detect/url` | `detectUrl()` in `lib/api.ts` | (server-side extraction + detect) |
| GET `/api/quota` | `fetchQuota()` in `lib/api.ts` | (quota enforcement) |
| GET `/api/scans/me` | `fetchScans()` in `lib/api.ts` | `frontend/src/app/api/scans/me/route.ts` |
| POST `/api/stripe/checkout` | `upgrade.tsx` | (Stripe integration) |
| POST `/api/stripe/portal` | `profile.tsx` | (Stripe portal) |

### Shared Resources

- **Supabase instance**: xpeubpqbqlyxawjovxuy.supabase.co
- **Brand colors**: primary #d4456b, accent #e8c97a, base #f0e6ca
- **Platform enum**: shared core, mobile adds mobile_share + mobile_library

---

## 9. Recommendations

### P0 -- Before Next Development Cycle

1. **Decompose `real-detectors.ts`** (2,087 lines) into:
   - `text-detection.ts` -- text cascade pipeline
   - `image-detection.ts` -- image cascade pipeline
   - `video-detection.ts` -- video detection
   - `statistical-analysis.ts` -- 12-feature analysis
   - `detection-utils.ts` -- shared helpers (clamp, precise, splitSentences, etc.)

2. **Remove console statements** -- replace 104 instances with structured logging or remove entirely

3. **Add authentication to data routes** -- at minimum, validate user_id format (UUID) and consider Supabase RLS

### P1 -- Next Sprint

4. **Sync extension config** -- extract thresholds from `detection-config.ts` into a shared JSON that the extension can fetch, eliminating 49 TODO comments

5. **Add API route tests** -- test detection routes with mock API responses, test analytics routes with seeded data

6. **Add CI pipeline** -- GitHub Actions workflow running `tsc --noEmit && npm test` on push/PR

7. **Restrict CORS** -- limit `allow_origins` to `["https://baloney.app", "chrome-extension://..."]`

### P2 -- When Convenient

8. **Add TypeScript to extension** -- even basic JSDoc types would help
9. **Clean up dead code** -- remove commented-out backup detector functions
10. **Add Python backend tests** -- test ensemble logic with known inputs
11. **Document Supabase schema** -- create migration files or schema docs

---

## 10. File Reference

```
frontend/src/
  app/
    page.tsx                    Landing page (225 lines)
    layout.tsx                  Root layout (40 lines)
    analyze/                    AI detector playground
      page.tsx                  Main analysis UI (515 lines)
      + 15 visualization components
    dashboard/
      page.tsx                  Live scan feed (150 lines)
      + 21 dashboard visualization components
      + CommunityTab.tsx, PersonalTab.tsx
    feed/page.tsx               Social feed simulator (98 lines)
    tracker/page.tsx            Platform AI tracker (209 lines)
    product/page.tsx            Product landing (676 lines)
    extension/page.tsx          Extension docs (694 lines)
    evaluation/page.tsx         Benchmark results (1792 lines)
    platform/page.tsx           Platform simulator
    allowed-sites/page.tsx      Extension whitelist (319 lines)
    api/
      detect/                   text, image, video, phishing, preview
      scans/                    me, all
      analytics/                personal, community (7 sub), tracker
      health, exposure-score, provenance, seed, slop-index, sharing/
  lib/
    real-detectors.ts           Detection pipeline (2087 lines)
    detection-config.ts         Config source of truth (382 lines)
    types.ts                    All types (351 lines)
    api.ts                      API client (284 lines)
    api-utils.ts                Utilities (49 lines)
    bayesian.ts                 Bayesian posterior (104 lines)
    constants.ts                Colors, limits, RequestQueue (139 lines)
    phishing-detector.ts        Phishing heuristics (1100 lines)
    mock-detectors.ts           computeTextStats (34 lines)
    supabase.ts                 Client init (6 lines)
    cn.ts                       Class merger (6 lines)
    error-messages.ts           Error mapping (27 lines)
    evaluation-data.ts          Eval data (707 lines)
    ensemble-evaluation-data.ts Ensemble data (201 lines)
    phishing-types.ts           Phishing types (161 lines)
  components/                   10 reusable UI components
  hooks/useUserId.ts            User ID hook (31 lines)
  __tests__/
    analysis-system.test.ts     36 tests (1102 lines)
    datasets.ts                 207 samples (1925 lines)

backend/app/
  main.py                      FastAPI server (180 lines)
  services/
    text_detector.py            5-model ensemble (421 lines)
    image_detector.py           4-signal ensemble (340 lines)
    statistical_features.py     12-feature analysis (124 lines)
    phishing_detector.py        80+ feature heuristics (666 lines)

synthid-backend/
  main.py                      SynthID watermark detector (153 lines)

extension/
  manifest.json                Chrome MV3 config
  background.js                Service worker
  content.js                   Page injection + scanning
  popup.html/js                Quick stats UI
  sidepanel.html/js            Detailed analysis UI
  styles.css                   Extension styles
```

---

*Analysis generated 2026-03-20 via comprehensive 6-agent parallel codebase exploration.*
