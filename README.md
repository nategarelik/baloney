<p align="center">
  <img src="frontend/public/baloney.png" alt="Baloney" width="80" />
</p>

<h1 align="center">Baloney</h1>

<p align="center">
  <strong>Tell what's baloney.</strong><br />
  A Chrome extension and analytics platform that detects AI-generated content as you browse — images and text, on every website, in real time.
</p>

<p align="center">
  <a href="https://baloney.app"><img src="https://img.shields.io/badge/Live_Demo-Vercel-black?logo=vercel" alt="Live Demo" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase" alt="Supabase" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Chrome-Extension_MV3-4285F4?logo=googlechrome" alt="Chrome Extension" /></a>
  <a href="docs/AI_CITATION.md"><img src="https://img.shields.io/badge/AI_Tools-Cited-blue" alt="AI Citation" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" /></a>
  <a href="#detection"><img src="https://img.shields.io/badge/Signals-6%2B-orange" alt="6+ Signals" /></a>
  <a href="#detection"><img src="https://img.shields.io/badge/AUC-0.982-brightgreen" alt="AUC 0.982" /></a>
</p>

---

## The Problem

AI-generated images, text, and video are flooding social media, news, and professional platforms. Existing detection tools are either expensive enterprise APIs or scattered academic models with no consumer-facing product. No tool passively detects AI content as users browse, and no open dataset tracks the prevalence and distribution of AI-generated content across the internet.

Companies in HR, marketing, publishing, and trust & safety need quantitative data on where AI content appears in their ecosystems. That data does not exist today.

## The Solution

Baloney is a **Chrome extension** paired with a **web analytics platform** that detects AI-generated content in real time. As you scroll any website, the extension scans images and text blocks, injecting verdict badges directly into the page. Every scan feeds a personal analytics dashboard — and with one toggle, users can contribute anonymized data to a community intelligence layer.

**Detection** is the hook. **Analytics** is the differentiator. **Data** is the business.

### Highlights

- **6+ independent detection signals** per modality — commercial APIs + Google SynthID watermarks + statistical analysis
- **ROC AUC 0.982** on 207-sample benchmark across 15+ content categories
- **SynthID watermark detection** — we detect Google's own invisible Gemini/Imagen watermarks
- **AI Slop Index** — platform report cards grading AI content pollution (A+ to F)
- **Information Diet Score** — gamified AI awareness on a 0–850 scale
- **Privacy-first** — no raw content stored, community sharing opt-in, default OFF
- **28-hour hackathon build** — 53 deliberate human prompts across 12 Claude Code sessions

## Features

### Chrome Extension (v0.4.0) — "Grammarly for AI Detection"

Baloney takes design cues from Grammarly's inline UX — but where Grammarly is always-on and aggressive (auto-underlining every text field, floating widgets on every input, red/blue/purple squiggles you can't miss), Baloney is **intentional and non-invasive**. The user chooses when to check.

| | Grammarly | Baloney |
|--|-----------|---------|
| **Text** | Always-on. Auto-underlines every word you type with colored squiggles. Floating suggestion card appears on hover. | **On-demand.** User highlights text → popup appears with a scan button → click to get AI analysis with WHY explanations. Nothing happens until you ask. |
| **Visual indicators** | Colored underlines (red/blue/purple/green) applied to your text automatically. Impossible to ignore. | **Discrete 10px detection dots** in the top-right corner of scanned images/videos. Verdict-colored (pink/orange/amber/green). Hover to expand and see "78% AI" label. |
| **Detail view** | Hover an underline → floating card with fix suggestion. Click to accept. | **Click a detection dot** → Chrome sidepanel opens with full analysis: verdict banner, confidence meter, reasoning bullets, sentence breakdown (text), model attribution. |
| **Floating widget** | Green circle in corner of every text field showing suggestion count. Always visible. | **Page indicator badge** (bottom-right) showing flagged item count. Click to see a panel of flagged items. Unobtrusive. |
| **Invasiveness** | High — modifies the editing experience, injects UI into text fields, always processing. | **Low** — never modifies page content, never auto-scans text, images scan silently in background with discrete 10px detection dots. |

#### Text: Selection-Based Scanning
1. **Highlight** any text on any page (minimum 20 characters)
2. A small popup appears below the selection: **"Scan with Baloney"**
3. **Click** → loading spinner → the popup expands into an insight card:
   - Verdict header with colored dot (AI Generated / Heavy Edit / Light Edit / Human) + confidence %
   - API caveat text explaining detection limitations
   - **Plain-English WHY bullets** explaining the reasoning:
     - "Sentence lengths are very uniform, typical of AI writing"
     - "Vocabulary is repetitive, a common AI pattern"
     - "Unpredictable word choices suggest human creativity"
   - Sentence-level breakdown (up to 5 sentences with colored AI probability bars)
   - Model name footer
4. **Dismiss** by clicking outside, making a new selection, or scrolling 200+ pixels

#### Images: Auto-Scan with Detection Dots
1. Images (>= 200px) **auto-scan silently** as they enter the viewport (max 3 concurrent API calls)
2. A **10px detection dot** appears in the top-right corner of scanned images, colored by verdict:
   - Pink (`#d4456b`) = AI Generated
   - Orange (`#f97316`) = Heavy Edit
   - Amber (`#f59e0b`) = Light Edit
   - Green (`#16a34a`) = Human
3. **Hover** the dot → it expands to show a label like "78% AI"
4. **Click** the dot → Chrome sidepanel opens with full analysis: verdict banner, confidence meter, plain-English reasoning, and model attribution
5. Dots are non-invasive — no layout shifts, no borders, no overlays on the image itself

#### Videos: Poster/Frame Capture
- `<video>` elements with width > 200px are observed in the viewport
- If the video has a `poster` attribute, that URL is sent for analysis
- Otherwise, the current frame is captured to a `<canvas>`, exported as JPEG base64, and sent through the image detection pipeline
- Same detection dot + sidepanel behavior as images

#### Content Filtering
Three modes (toggled in popup): **Scan** (detection dots only), **Blur** (20px gaussian + click-to-reveal overlay), **Block** (removes flagged content from view). Only AI Generated and Heavy Edit verdicts trigger filtering.

#### Additional Features
- **Context Menus** — Right-click any image ("Scan with Baloney") or selected text ("Check with Baloney") for on-demand analysis via toast notification.
- **Per-Page Stats** — Hostname-keyed tracking shows image/text/flagged counts and top pages in the popup.
- **Platform Detection** — Recognizes X, Instagram, Reddit, Facebook, TikTok, LinkedIn, Medium, and generic sites.
- **Offline Fallback** — Returns `human` with 0 confidence when the API is unreachable. The extension never crashes.

### Web Dashboard
- **AI Slop Index** — Platform report cards with letter grades (A+ to F), 7-day and 24-hour AI rates, and trend arrows.
- **Exposure Score** — Personal AI awareness gamification on a 0–850 scale across five levels: Novice, Aware, Informed, Vigilant, Sentinel.
- **Content Provenance** — Crowd-sourced truth via SHA-256 content hashes tracking the same content across platforms.
- **Information Diet Score** — Holistic 0–100 score measuring AI ratio, source diversity, trend direction, and awareness.
- **AI Tracker** — Platform-level trend charts with content type filtering and time range controls.
- **Privacy by Design** — No raw content stored. Community sharing is opt-in with a single toggle, default OFF.

## Architecture

```
Chrome Extension (MV3)  ──POST /api/detect/*──▶  Vercel (Next.js 16 API Routes)
                                                          │
Web Dashboard (React 19) ──GET /api/*──────────▶          │
                                                          ▼
                                                  Supabase Postgres
                                                  (7 tables, 11 views, 4 RPCs)
```

The extension observes DOM mutations and viewport intersections, sends content to the API for analysis, and injects results back into the page. The dashboard reads from Supabase views for analytics, scoring, and community intelligence.

Full architecture documentation with Mermaid diagrams: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Extension** | Chrome Manifest V3, MutationObserver, IntersectionObserver, Selection API |
| **ML Detection** | Pangram (99.85%), SightEngine (98.3%), Google SynthID, Statistical/Frequency/Metadata |
| **Frontend** | Next.js 16, React 19, TypeScript 5.7, Tailwind CSS 3.4, Recharts 2.15 |
| **API** | 17 Next.js API Routes deployed on Vercel |
| **Database** | Supabase Postgres — 7 tables, 11 views, 4 RPC functions, 17 indexes |
| **Deployment** | Vercel (frontend + API) · Supabase (database) · GitHub (CI) |

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Chrome browser (for the extension)

### 1. Clone and install

```bash
git clone https://github.com/nategarelik/baloney.git
cd baloney/frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

The `.env.example` file includes the Supabase project URL and publishable anon key. Optionally add a `HUGGINGFACE_API_KEY` to enable real ML detection (free tier available at [huggingface.co](https://huggingface.co)). Without it, mock detectors are used as fallback.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Load the Chrome extension

1. Navigate to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `extension/` folder
4. Browse any website — detection badges appear as you scroll

### 5. Seed demo data (optional)

```bash
curl -X POST "https://baloney.app/api/seed?secret=$SEED_SECRET"
```

Creates 50 profiles, 535 scans, and computes all derived scores.

## Project Structure

```
baloney/
├── frontend/                         # Next.js 16 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/                  # 17 API routes
│   │   │   │   ├── detect/           # image, text, preview
│   │   │   │   ├── analytics/        # personal, community, tracker, trends, domains
│   │   │   │   ├── scans/            # scan history
│   │   │   │   ├── sharing/          # toggle, status
│   │   │   │   ├── slop-index/       # platform report cards
│   │   │   │   ├── exposure-score/   # personal awareness score
│   │   │   │   ├── information-diet/ # holistic diet score
│   │   │   │   ├── provenance/       # content hash tracking
│   │   │   │   ├── seed/             # demo data (protected)
│   │   │   │   └── health/           # system health
│   │   │   ├── dashboard/            # Analytics dashboard (15 components)
│   │   │   ├── feed/                 # Demo feed with live scanning
│   │   │   ├── analyze/              # Text analyzer
│   │   │   ├── my-diet/              # Information Diet Score page
│   │   │   ├── tracker/              # AI Tracker (platform trends)
│   │   │   ├── product/              # Product overview
│   │   │   ├── platform/             # Platform simulator
│   │   │   ├── extension/            # Extension info + install guide
│   │   │   ├── page.tsx              # Landing page
│   │   │   └── layout.tsx            # Root layout
│   │   ├── components/               # 8 shared UI components
│   │   └── lib/                      # Types, API client, Supabase, constants, detectors
│   ├── public/                       # Static assets (images, icons)
│   └── package.json
├── extension/                        # Chrome Extension (Manifest V3)
│   ├── manifest.json                 # <all_urls> permissions
│   ├── content.js                    # Selection popup, hover borders, video scanning, filtering
│   ├── background.js                 # API calls + safe offline fallback + context menus
│   ├── popup.html                    # Pig logo, stats, filters, IDS, per-page, top pages
│   ├── styles.css                    # Hover borders, selection popup, insight styles, filtering
│   └── icons/
├── docs/
│   ├── ARCHITECTURE.md               # System diagrams and design decisions
│   ├── API.md                        # Full API reference
│   ├── AI_CITATION.md                # AI tools disclosure
│   ├── PRESENTATION.md               # Pitch guide and demo plan
│   └── MANUAL_TEST_RESULTS.md        # Testing checklist and results
├── CLAUDE.md                         # Development context and instructions
└── LICENSE                           # MIT
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/detect/image` | Detect AI in a base64-encoded image |
| `POST` | `/api/detect/text` | Detect AI in text content |
| `POST` | `/api/detect/preview` | Text detection without database write |
| `GET` | `/api/analytics/personal` | Personal AI exposure metrics |
| `GET` | `/api/analytics/community` | Aggregated community statistics |
| `GET` | `/api/analytics/community/trends` | Time-series AI rate by day |
| `GET` | `/api/analytics/community/domains` | Domain leaderboard |
| `GET` | `/api/analytics/tracker` | Platform-level trend data |
| `GET` | `/api/scans/me` | User scan history |
| `POST` | `/api/sharing/toggle` | Enable or disable community sharing |
| `GET` | `/api/sharing/status` | Check sharing preference |
| `GET` | `/api/slop-index` | Platform AI Slop Index |
| `GET` | `/api/exposure-score` | Personal exposure score |
| `GET` | `/api/information-diet` | Information Diet Score |
| `GET` | `/api/provenance` | Content provenance sightings |
| `POST` | `/api/seed` | Seed demo data (secret-protected) |
| `GET` | `/api/health` | System health and Supabase connectivity |

Full documentation: [`docs/API.md`](docs/API.md)

## Detection

Baloney uses a **multi-signal ensemble** — multiple models and methods per modality, combined with configurable weights.

### Primary Detection Pipeline (v5.0)

| Modality | Signal | Method | Weight |
|----------|--------|--------|--------|
| Text | Pangram | Commercial API — 99.85% accuracy, SOTA (Emi & Spero 2024) | 38% |
| Text | SynthID | Google Gemini watermark detection (Bayesian, open-source) | Override |
| Text | Statistical | Burstiness, entropy, readability, hedging, 12 features | 25% |
| Image | SightEngine | Commercial API — 98.3% accuracy, ARIA benchmark #1 | 45% |
| Image | SynthID | Google Imagen watermark detection (Vertex AI) | Override |
| Image | Frequency | Local variance uniformity + DCT coefficient analysis | 30% |
| Image | Metadata | EXIF markers, camera provenance, C2PA credentials | 25% |
| Video | SightEngine | Native server-side video analysis (Sora, Veo, Runway, Kling) | — |

**SynthID Override:** When a Google watermark is detected, it overrides the ensemble with high confidence (0.95–0.97). This is our crown jewel — we detect Google's own invisible watermarks.

**Evaluation:** 207-sample benchmark across 15+ content categories. ROC AUC 0.982. Ablation study proves ensemble > any individual method. See [`/evaluation`](https://baloney.app/evaluation).

## Privacy

- **No raw content stored** — only metadata: verdict, confidence, platform, timestamp
- **Personal data is private** — never shared without explicit opt-in
- **Community sharing is opt-in** — single toggle, default OFF
- **Anonymized contributions** — no identity, no content, no browsing history shared

## Deployment

| Service | URL |
|---------|-----|
| Frontend + API | [baloney.app](https://baloney.app) |
| Database | Supabase project `xpeubpqbqlyxawjovxuy` (us-east-1) |
| Repository | [github.com/nategarelik/baloney](https://github.com/nategarelik/baloney) |

Deploy to Vercel:
```bash
cd frontend
npx vercel --prod --yes
```

## References

1. Ricker, J., Lukovnikov, D., Fischer, A. (2024). **AEROBLADE: Training-Free Detection of Latent Diffusion Images Using Autoencoder Reconstruction Error.** CVPR 2024.
2. Hans, A., Schwarzschild, A., Cherepanova, V., et al. (2024). **Spotting LLMs With Binoculars: Zero-Shot Detection of Machine-Generated Text.** ICML 2024.
3. Guo, B., Cao, X., Dong, Y., et al. (2023). **How Close is ChatGPT to Human Experts?** arXiv:2301.07597.

## Built For

| MadData26 Criterion | How Baloney Addresses It |
|---------------------|------------------------|
| **Presentation & Technique** | Revelation narrative arc, live Chrome extension demo, "we detect Google's watermarks" memorability line |
| **Social Impact** | Anti-disinformation tool, Information Diet Score for awareness, privacy-first design, AI Slop Index for platform accountability |
| **Data Methods** | 6+ signal ensemble, SynthID watermark detection, 207-sample evaluation with ROC/confusion/ablation, bootstrap CI, publishable methodology |

## Team

Built at **MadData26** — UW-Madison Data Science Hackathon, February 21–22, 2026.

- **Nathaniel Garelik** — Full Stack, ML, Extension
- **Ben Verhaalen** — Frontend Design, UI/UX

## AI Tools

See [`docs/AI_CITATION.md`](docs/AI_CITATION.md) for full disclosure per hackathon requirements.

## License

MIT — see [`LICENSE`](LICENSE)
