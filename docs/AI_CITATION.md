# AI Tools Disclosure

> Per MadData26 hackathon requirements, this document discloses all AI tools used in building Baloney (formerly TrustLens).

## Tools Used

| Tool | Model | Purpose |
|------|-------|---------|
| Claude Code (CLI) | Opus 4.6 | Architecture planning, debugging, code review, orchestration |
| Claude Code (CLI) | Sonnet 4.6 | Implementation, component building, API routes, documentation |
| Pangram API | v3 (Emi & Spero 2024) | Commercial text AI detection, 99.85% accuracy, SOTA (arXiv:2402.14873) |
| SightEngine API | genai model | Commercial image + video AI detection, 98.3% accuracy, ARIA benchmark #1 |
| Reality Defender API | Enterprise | Deepfake escalation for ambiguous images (RSA Innovation Award winner) |
| Google SynthID (Text) | via HuggingFace Transformers | Google Gemini watermark detection (open-source, synthid-text) |
| Google SynthID (Image) | via Vertex AI | Google Imagen watermark detection (Vertex AI API) |

## What AI Generated

- **Boilerplate code**: Next.js API route scaffolding, TypeScript interfaces, Tailwind utility classes
- **Mock detectors**: Statistical distributions for image/text/video detection simulation
- **Real ML integration**: Multi-signal ensemble architecture (RoBERTa + MiniLM + ViT + FFT + metadata) in `real-detectors.ts`, HuggingFace Inference API integration with graceful fallback
- **Seed data**: Realistic scan distributions, weighted platform selection, content hash generation
- **Type definitions**: 17+ TypeScript interfaces matching Supabase schema
- **CSS theming**: Dark mode color system, chart styling, badge colors
- **Extension UX redesign (v0.3.0)**: Selection-based text scanning (highlight → popup → insight with WHY explanations), image hover borders (outline per verdict), video frame capture analysis, pig icon generation (SVG → PNG via sharp)
- **Extension warm theme + dot UI (v0.4.0)**: Full warm-theme popup redesign (cream/pink/brown, Young Serif + DM Sans), detection dots replacing hover borders (10px dot → expand on hover → click to open Chrome sidepanel), Grammarly-style text underlines after selection scans, master on/off toggle, per-type auto-scan toggles, allowed-sites gating, content mode selector (scan/blur/block), Chrome sidePanel API integration with fallback, storage migration system
- **Analyze page redesign**: Tabbed Text/Image/Video detector with HandDrawnUnderline tabs, ImageDetectorPanel (drag-and-drop + paste upload), AnimatedPercentage component, warm-themed TrustScoreGauge/SentenceHeatmap/ScoreBreakdown
- **Rebrand & redesign**: Baloney landing page, warm color palette, Young Serif + DM Sans typography, SVG hand-drawn accent components
- **AI Tracker dashboard**: Platform-tabbed tracker page with collapsible chart sections, new `/api/analytics/tracker` endpoint
- **Design system**: Full `docs/DESIGN.md` — brand ethos, color palette, typography rationale, component patterns, page layouts, do/don't rules
- **Dashboard warm theme**: Full restyle of ~19 dashboard components from navy/dark to warm Baloney palette (cream cards, brown text, pink accents), warm Recharts chart colors, updated ChartCard/StatCard/Skeleton shared components
- **Dashboard revamp**: Simplified personal dashboard (3 stats + per-site AI rate chart + scan table), community dashboard at `/dashboard/community` (stats + stacked bar charts by website and by medium), navbar Dashboards dropdown, hero staggered fade-in animations, `AiRateBySiteChart` multi-line Recharts component
- **UI polish**: 3D bevel effect for primary buttons (`.btn-primary-3d`), pig logo favicon (`app/icon.png`), `HandDrawnUnderline` SVG component
- **Data pipeline**: Live dashboard showing all users' scans via `/api/scans/all`, 15-second auto-refresh polling on both dashboards for real-time hackathon demo
- **Documentation**: Architecture diagrams, API reference, this disclosure
- **v3.0 Multi-Signal Ensemble**: 6+ signal detection per modality — Pangram (99.85%), SightEngine (98.3%), Google SynthID watermark detection, Reality Defender deepfake escalation, dynamic weight allocation, method breakdown visualization, evaluation pipeline with ROC curves and ablation studies

## What Humans Did

- **Product vision**: Problem identification, target user definition, feature prioritization
- **Architecture decisions**: Choosing Supabase over custom backend, serverless over monolith, extension-first UX
- **Feature design**: AI Slop Index concept, Exposure Score gamification, Content Provenance system
- **Database schema**: All 7 tables, 11 views, 4 RPC functions designed by hand
- **Deployment pipeline**: Vercel configuration, Supabase project setup, environment variable management
- **Testing and QA**: Manual testing of all endpoints, cross-browser extension testing, data integrity verification
- **Presentation**: Pitch narrative, demo script, recovery procedures

## Methodology

All code was written through an iterative human-AI collaboration:

1. Human defines the feature requirements and architectural constraints
2. AI generates initial implementation following established patterns
3. Human reviews, tests, and iterates on the output
4. AI assists with debugging and refinement
5. Human makes final decisions on all shipped code

No code was blindly accepted. Every AI-generated line was reviewed by a human team member before merging.

## HuggingFace Models Used

| Model | Method | Purpose |
|-------|--------|---------|
| `openai-community/roberta-base-openai-detector` | Text Method A | RoBERTa fine-tuned on GPT-2 outputs for binary AI/human classification |
| `sentence-transformers/all-MiniLM-L6-v2` | Text Method B | Sentence embeddings for inter-sentence uniformity analysis (EditLens-inspired) |
| `umm-maybe/AI-image-detector` | Image Method E | ViT-based classifier trained on AI-generated vs real images |
| `Hello-SimpleAI/chatgpt-detector-roberta` | Text Method C | RoBERTa fine-tuned on HC3 dataset for ChatGPT/Claude/Gemini detection |
| `Organika/sdxl-detector` | Image Method E2 | SDXL-specific AI image detector |
| Google SynthID Text | Text Method SynthID | Bayesian watermark detection for Gemini-generated text (via synthid-text library) |

Additional detection methods implemented locally (no external API):
- **Text Method D**: Statistical features — burstiness, type-token ratio, perplexity proxy, repetition score, readability
- **Image Method F**: Frequency domain analysis — local variance uniformity and high-frequency energy proxy
- **Image Method G**: Metadata analysis — EXIF marker detection, camera make/model identification
- **Text Method P**: Pangram commercial API — 99.85% accuracy SOTA, 4-tier classification (Fully Human / Lightly AI-Assisted / Moderately AI-Assisted / Fully AI-Generated)
- **Image Method S**: SightEngine commercial API — 98.3% accuracy, ARIA benchmark #1, covers 120+ AI generators
- **Video Method S**: SightEngine native video endpoint — server-side video analysis for Sora, Veo, Runway, Kling
- **Text SynthID**: Google Gemini watermark detection via open-source synthid-text library
- **Image SynthID**: Google Imagen watermark detection via Vertex AI
- **Reality Defender**: Enterprise deepfake escalation for ambiguous image scores (0.4-0.7 range)

## Team

- **Nathaniel Garelik** — Full Stack Developer, Product Owner
- **Ben Verhaalen** — Frontend Design, UI/UX

## Development Stats

- **53 human prompts** across 12 Claude Code sessions
- **28-hour build** — February 21-22, 2026, MadData26
- **v5.0 pipeline** uses Pangram, SightEngine, Google SynthID as primary APIs
- Reality Defender integrated but not active in v5.0 pipeline (reserved for deepfake escalation)
