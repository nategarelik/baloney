# AI Tools Disclosure

> Per MadData26 hackathon requirements, this document discloses all AI tools used in building Baloney (formerly TrustLens).

## Tools Used

| Tool | Model | Purpose |
|------|-------|---------|
| Claude Code (CLI) | Opus 4.6 | Architecture planning, debugging, code review, orchestration |
| Claude Code (CLI) | Sonnet 4.6 | Implementation, component building, API routes, documentation |

## What AI Generated

- **Boilerplate code**: Next.js API route scaffolding, TypeScript interfaces, Tailwind utility classes
- **Mock detectors**: Statistical distributions for image/text/video detection simulation
- **Real ML integration**: Multi-signal ensemble architecture (RoBERTa + MiniLM + ViT + FFT + metadata) in `real-detectors.ts`, HuggingFace Inference API integration with graceful fallback
- **Seed data**: Realistic scan distributions, weighted platform selection, content hash generation
- **Type definitions**: 17+ TypeScript interfaces matching Supabase schema
- **CSS theming**: Dark mode color system, chart styling, badge colors
- **Extension UX redesign (v0.3.0)**: Selection-based text scanning (highlight → popup → insight with WHY explanations), image hover borders (outline per verdict), video frame capture analysis, pig icon generation (SVG → PNG via sharp)
- **Rebrand & redesign**: Baloney landing page, warm color palette, Young Serif + DM Sans typography, SVG hand-drawn accent components
- **AI Tracker dashboard**: Platform-tabbed tracker page with collapsible chart sections, new `/api/analytics/tracker` endpoint
- **Design system**: Full `docs/DESIGN.md` — brand ethos, color palette, typography rationale, component patterns, page layouts, do/don't rules
- **UI polish**: 3D bevel effect for primary buttons (`.btn-primary-3d`), pig logo favicon (`app/icon.png`), `HandDrawnUnderline` SVG component
- **Documentation**: Architecture diagrams, API reference, this disclosure

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

Additional detection methods implemented locally (no external API):
- **Text Method D**: Statistical features — burstiness, type-token ratio, perplexity proxy, repetition score, readability
- **Image Method F**: Frequency domain analysis — local variance uniformity and high-frequency energy proxy
- **Image Method G**: Metadata analysis — EXIF marker detection, camera make/model identification

## Team

- **Nathaniel Garelik** — Full Stack Developer, Product Owner
