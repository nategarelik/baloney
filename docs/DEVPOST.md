# Devpost Submission — Baloney (General Track)

## Title
Baloney — AI Content Detection for the Real-Time Web

## Tagline
"Tell what's baloney." A Chrome extension + analytics platform detecting AI text, images, and video as you browse.

## What it does
Baloney is a Chrome extension paired with a web analytics dashboard that detects AI-generated content in real time. As you browse any website, the extension silently scans images and lets you highlight text for analysis using a 6+ signal ML ensemble. Every detection feeds a personal analytics dashboard and, with opt-in community sharing, contributes to the AI Slop Index — the first independent measurement of AI content prevalence across social media platforms.

## How we built it
We built Baloney in 28 hours at MadData26, driven by our frustration with AI-generated disinformation and its role in enabling real-world harm. With strong programming backgrounds between us, we conceptualized every architectural and data decision ourselves — from database schema to detection methodology to privacy safeguards. We used Claude Code (Opus 4.6 + Sonnet 4.6) as a validation engine: 53 deliberate prompts across 12 sessions, each a human decision amplified by AI execution to eliminate error and move at the speed our ideas demanded.

The detection pipeline combines commercial APIs (Pangram 99.85% text accuracy, SightEngine 98.3% image accuracy), Google SynthID watermark detection (Gemini text + Imagen images), and statistical/frequency/metadata analysis. Frontend: Next.js 16 on Vercel with 17 API routes. Database: Supabase Postgres (7 tables, 11 views, 4 RPCs). Extension: Chrome MV3 with Grammarly-inspired UX.

## Data Methods
- 6+ independent detection signals per modality with dynamic weight allocation
- Google SynthID watermark detection — Bayesian detection of invisible Gemini/Imagen watermarks
- 207-sample evaluation benchmark across 15+ content categories
- ROC curves (AUC 0.982), confusion matrix, ablation study proving ensemble > individual methods
- Bootstrap confidence intervals, per-domain accuracy analysis
- SHA-256 content hashing for crowd-sourced provenance tracking across platforms
- Real-world dataset: every scan generates a data point (platform, content type, verdict, confidence, timestamp)

## Social Impact
We were motivated by violence and war enabled by synthetic media. AI-generated content floods social media with no consumer-facing tool to passively detect it during normal browsing. Baloney isn't Big Brother — it's a better tool to use the web. It empowers individuals to understand their information diet through transparent detection signals. The AI Slop Index creates the first independent, crowd-sourced platform accountability metric — like Nielsen ratings for AI content. The Information Diet Score gamifies awareness (0-850, five levels). Privacy-first: no raw content stored, community sharing opt-in, default OFF.

Research opportunities: Misinformation velocity measurement, cross-platform content migration tracking, detection arms race benchmarking, information diet behavioral studies, and data protection insights for web safety standards.

## What's next
Chrome Web Store launch, 10,000 users in six months, AI Slop Index as a weekly published metric, API for advertisers and media companies, and publishing the evaluation methodology as academic research.

## AI Tools Used
Claude Code (Opus 4.6 + Sonnet 4.6) for validation, testing, and error elimination. Every architectural and product decision made by humans. Full disclosure: [docs/AI_CITATION.md](https://github.com/nategarelik/baloney/blob/master/docs/AI_CITATION.md)

## Links
- **Live Demo:** https://trustlens-nu.vercel.app
- **GitHub:** https://github.com/nategarelik/baloney
- **AI Citation:** https://github.com/nategarelik/baloney/blob/master/docs/AI_CITATION.md
