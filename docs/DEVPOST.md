# Devpost Submission — Baloney (General Track)

## Inspiration
In today's internet landscape, it's surprising to spend more than three minutes scrolling Instagram reels without seeing anthropomorphized dogs doing kickflips on skateboards, "fruit with a face eating fruit not with a face," and the countless AI comments promoting the same crypto scheme. While some of these forms of generative content bring harmless fun and practical use cases, people today have also begun to use these accessible tools to promote hate and disinformation online. With our generation having grown up on the internet — a place we grew up supposing would always be a window to the outer world — it has today become a known "Slop Fest." In an effort to take a leap ahead of the rapid AI race, and experiment with newly published detection methods, we've developed Baloney.

## What it does
Baloney is a Chrome extension paired with a web analytics dashboard that detects AI-generated content in real time. As you browse any website, the extension silently scans images and lets you highlight text for analysis using a multi-signal ML ensemble. Every detection feeds a personal analytics dashboard and, with opt-in community sharing, contributes to the AI Slop Index — the first independent measurement of AI content prevalence across social media platforms.

## How we built it
We built Baloney in 24 hours at MadData26, driven by our frustration with AI-generated disinformation and its role in enabling real-world harm. Between us — Computer Engineering and Data Science — we conceptualized every architectural and data decision ourselves, from database schema to detection methodology to privacy safeguards. We used Claude Code (Opus 4.6 + Sonnet 4.6) as a validation engine to eliminate error and move at the speed our ideas demanded.

The detection pipeline combines commercial APIs (Pangram at 99.85% text accuracy, SightEngine at 98.3% image accuracy), Google SynthID watermark detection for both Gemini text and Imagen images, and statistical/frequency/metadata analysis. Frontend: Next.js 16 on Vercel with 17 API routes. Database: Supabase Postgres with 7 tables, 11 views, and 4 RPC functions. Extension: Chrome Manifest V3 with a Grammarly-inspired selection-based UX.

## Challenges we ran into
**API rate limits during development.** Pangram gives 5 free requests per day and SightEngine caps at 2,000 operations per month. We burned through our daily Pangram quota fast while testing, so we had to be strategic — test the ensemble logic with statistical signals first, then validate the full pipeline sparingly. For the live demo we basically have to treat every real API call as precious.

**SynthID integration.** Google's SynthID text watermark detection is open-source but poorly documented for standalone use outside of Google's own infrastructure. Getting the Bayesian detector running on our own Railway backend took real digging through the HuggingFace transformers source code. The image watermark side required Vertex AI access with specific project configuration that wasn't straightforward either.

**Chrome extension state management.** Manifest V3 service workers can die at any time and lose all in-memory state. We had to build a storage migration system and handle the background worker waking up mid-scan gracefully. Debugging content scripts injected into pages with wildly different DOMs (X vs Instagram vs Reddit) was a constant source of edge cases — what works on one platform's DOM structure breaks on another.

**Ensemble weight tuning with limited data.** With only 207 benchmark samples and multiple detection signals per modality, finding the right weights for the ensemble was more art than science within the hackathon timeframe. We ran an ablation study to prove the ensemble approach itself adds value, but we'd want significantly more data to tune the weights with real confidence.

**Hydration and build issues.** Next.js 16 with React 19 server components introduced subtle hydration mismatches that only showed up in production builds, not in dev mode. We spent more time than we'd like debugging why components worked locally but threw errors on Vercel.

**Scope creep at 3 AM.** We kept adding features — phishing detection, a platform simulator, more dashboard visualizations — when we should have been polishing what we had. We eventually cut several features to focus on the core detection pipeline and evaluation, which was the right call but hard to do in the moment.

## Accomplishments that we're proud of
**We detect Google's own watermarks.** SynthID watermark detection for both Gemini text and Imagen images. Google embeds invisible cryptographic watermarks in everything their models generate. Most detection tools can't see them. We can.

**The evaluation pipeline is real.** 207 samples across 15 content categories, ROC curves with AUC 0.982, a confusion matrix, an ablation study that proves the ensemble outperforms any individual method, and bootstrap confidence intervals. This isn't a demo metric — it's publishable methodology.

**The method breakdown shows WHY.** We don't just say "92% AI." We show exactly which signals contributed and how much weight each one carried. Users can see the evidence and decide for themselves.

**The AI Slop Index.** Grading platforms from A+ to F based on AI content pollution. The idea that our detection tool is simultaneously a data collection mechanism — and that the aggregate intelligence is the real product — clicked halfway through the build and changed how we think about the entire project.

**It's live.** Not a mockup, not a slide deck. [baloney.app](https://baloney.app) is running right now with real API calls, real detection, and real data.

## What we learned
**Multi-signal ensemble design is hard but worth it.** Each signal has blind spots that others cover. The ablation study wasn't just for the judges — it taught us that the architecture itself is the innovation, not any individual API.

**Rate limits shape your architecture.** When your best API gives you 5 calls a day, you design differently. We built the cascading early-exit pipeline specifically because we couldn't afford to call every signal on every scan. That constraint made the system better.

**The data science matters as much as the engineering.** Building a working detector is table stakes. The evaluation pipeline, the statistical rigor, and the honest disclosure of limitations — that's what separates a hackathon demo from something worth continuing.

**AI tools amplify the quality of your thinking.** Claude Code didn't make decisions for us. It let us execute faster on decisions we'd already made. The 24 hours we had would have been 24 hours regardless — AI just meant we could attempt a more ambitious version of what we envisioned.

## What's next for Baloney
Chrome Web Store launch with a goal of 10,000 users in six months. The AI Slop Index published as a weekly metric. A detection API for advertisers, media companies, and brand safety teams. And publishing the evaluation methodology as academic research — the dataset, the ensemble architecture, and the ablation results.

Long-term, every user is a sensor. The more people who install the extension, the more comprehensive the map of AI content across the internet becomes. That network effect is what turns a detection tool into a data platform.

---

## Data Methods
- Multi-signal ensemble with independent detection signals per modality and dynamic weight allocation
- Google SynthID watermark detection — Bayesian detection of invisible Gemini/Imagen watermarks
- 207-sample evaluation benchmark across 15+ content categories
- ROC curves (AUC 0.982), confusion matrix, ablation study proving ensemble > individual methods
- Bootstrap confidence intervals, per-domain accuracy analysis
- SHA-256 content hashing for crowd-sourced provenance tracking across platforms
- Every scan generates a structured data point (platform, content type, verdict, confidence, timestamp)

## Social Impact
We were motivated by the violence and disinformation we see enabled by AI-generated content today. Wars are being fought partly on information battlegrounds. People are being radicalized by synthetic media they can't distinguish from reality. There is no consumer-facing tool that passively detects AI content during normal browsing.

Baloney isn't a surveillance system. It's a better tool to use the web — one that empowers individuals with transparency, not control. The AI Slop Index creates the first independent, crowd-sourced platform accountability metric. Privacy-first: no raw content stored, community sharing opt-in, off by default.

Research opportunities include misinformation velocity measurement, cross-platform content migration tracking via SHA-256 hashes, detection arms race benchmarking against new generator models, and data protection insights for web safety standards.

## AI Tools Used
Claude Code (Opus 4.6 + Sonnet 4.6) for validation, testing, and error elimination. Every architectural and product decision made by humans. Full disclosure: [docs/AI_CITATION.md](https://github.com/nategarelik/baloney/blob/master/docs/AI_CITATION.md)

## Links
- **Live Demo:** https://baloney.app
- **GitHub:** https://github.com/nategarelik/baloney
- **AI Citation:** https://github.com/nategarelik/baloney/blob/master/docs/AI_CITATION.md
