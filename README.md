<p align="center">
  <img src="frontend/public/baloney.png" alt="Baloney" width="80" />
</p>

<h1 align="center">Baloney</h1>

<p align="center">
  <strong>Tell what's baloney.</strong><br />
  A Chrome extension and analytics platform that detects AI-generated content as you browse — images and text, on every website, in real time.
</p>

<p align="center">
  <a href="https://trustlens-nu.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-Vercel-black?logo=vercel" alt="Live Demo" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase" alt="Supabase" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Chrome-Extension_MV3-4285F4?logo=googlechrome" alt="Chrome Extension" /></a>
</p>

---

## The Problem

AI-generated images, text, and video are flooding social media, news, and professional platforms. Existing detection tools are either expensive enterprise APIs or scattered academic models with no consumer-facing product. No tool passively detects AI content as users browse, and no open dataset tracks the prevalence and distribution of AI-generated content across the internet.

Companies in HR, marketing, publishing, and trust & safety need quantitative data on where AI content appears in their ecosystems. That data does not exist today.

## The Solution

Baloney is a **Chrome extension** paired with a **web analytics platform** that detects AI-generated content in real time. As you scroll any website, the extension scans images and text blocks, injecting verdict badges directly into the page. Every scan feeds a personal analytics dashboard — and with one toggle, users can contribute anonymized data to a community intelligence layer.

**Detection** is the hook. **Analytics** is the differentiator. **Data** is the business.

## Features

### Chrome Extension
- **Universal Coverage** — Works on every website. Content scripts and host permissions use `<all_urls>`.
- **Image Detection** — Scans images >= 200px via IntersectionObserver. Badges inject into the DOM with verdicts and confidence scores.
- **Text Detection** — Scans text blocks >= 100 characters. Colored left borders and verdict pills indicate AI likelihood.
- **Content Filtering** — Three modes: **Label** (badges only), **Blur** (20px gaussian + click-to-reveal), **Hide** (remove from view).
- **Per-Page Stats** — Hostname-keyed tracking shows scan counts, flag rates, and top pages in the popup.
- **Platform Detection** — Recognizes X, Instagram, Reddit, Facebook, TikTok, LinkedIn, Medium, and generic sites.
- **Context Menus** — Right-click any image or selected text for on-demand analysis.
- **Offline Fallback** — Mock detector runs locally when the API is unreachable. The extension never breaks.

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

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Extension** | Chrome Manifest V3, MutationObserver, IntersectionObserver |
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

The `.env.example` file includes the Supabase project URL and publishable anon key. No additional secrets are needed for local development.

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
curl -X POST "https://trustlens-nu.vercel.app/api/seed?secret=$SEED_SECRET"
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
│   ├── content.js                    # DOM scanning + badge injection + filtering
│   ├── background.js                 # API calls + mock fallback + context menus
│   ├── popup.html                    # Stats, filters, IDS, per-page, top pages
│   ├── styles.css                    # Badge variants, filter effects, animations
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

| Modality | Model / Method | Key Metric | Source |
|----------|---------------|------------|--------|
| Image | Organika/sdxl-detector | 97.3% F1, 98.1% Acc | AutoTrain validation |
| Image | AEROBLADE (training-free) | 99.2% mean AP | Ricker et al., CVPR 2024 |
| Video | Per-frame aggregation | Inherits image metrics | Novel approach |
| Text | chatgpt-detector-roberta | ~95% on HC3 test set | Guo et al., 2023 |
| Text | Binoculars (zero-shot) | 90%+ TPR @ 0.01% FPR | Hans et al., ICML 2024 |

The live demo uses mock detectors returning weighted random results that simulate realistic distributions. Real ML inference requires GPU allocation. The feed page includes a curated ground-truth fallback so the demo never breaks.

## Privacy

- **No raw content stored** — only metadata: verdict, confidence, platform, timestamp
- **Personal data is private** — never shared without explicit opt-in
- **Community sharing is opt-in** — single toggle, default OFF
- **Anonymized contributions** — no identity, no content, no browsing history shared

## Deployment

| Service | URL |
|---------|-----|
| Frontend + API | [trustlens-nu.vercel.app](https://trustlens-nu.vercel.app) |
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

## Team

Built at **MadData26** — UW-Madison Data Science Hackathon, February 21–22, 2026.

- **Nathaniel Garelik** — Full Stack, ML, Extension
- **Dev Partner** — Frontend Design, UI/UX

## AI Tools

See [`docs/AI_CITATION.md`](docs/AI_CITATION.md) for full disclosure per hackathon requirements.

## License

MIT — see [`LICENSE`](LICENSE)
