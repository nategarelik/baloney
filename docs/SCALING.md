# SCALING.md — Baloney: From Hackathon to Product

> **Context:** Baloney won MadData26 (UW-Madison Data Science Hackathon, Feb 21-22, 2026). This document analyzes every path forward — open source vs. product, cost modeling, legal constraints, growth strategies, and business models — to inform the decision of two college sophomores optimizing for maximum career signal.

---

## Table of Contents

1. [Executive Summary & Recommendation](#1-executive-summary--recommendation)
2. [The Two Paths: Open Source vs. Product](#2-the-two-paths-open-source-vs-product)
3. [Market Landscape](#3-market-landscape)
4. [Cost Analysis & Pricing Models](#4-cost-analysis--pricing-models)
5. [Self-Hosting vs. API: The Economics](#5-self-hosting-vs-api-the-economics)
6. [The Detection Arms Race: What You're Up Against](#6-the-detection-arms-race-what-youre-up-against)
7. [Legal & Ethical Constraints](#7-legal--ethical-constraints)
8. [Growth Strategy](#8-growth-strategy)
9. [Business Models Beyond Subscriptions](#9-business-models-beyond-subscriptions)
10. [Authentication & Payment Implementation](#10-authentication--payment-implementation)
11. [Metrics That Matter](#11-metrics-that-matter)
12. [Funding & Accelerators](#12-funding--accelerators)
13. [Concrete Roadmap](#13-concrete-roadmap)

---

## 1. Executive Summary & Recommendation

### The Goal
Maximize signal to employers (Google, Anthropic, Meta, OpenAI, startups) by demonstrating you can build something people actually use. The best proxies, in order: paying users > active users > GitHub stars > hackathon wins.

### The Recommendation: Do Both (Open-Core Model)

**Open-source the Chrome extension. Keep the backend/API proprietary.**

This is the model used by Supabase, GitLab, PostHog, and most successful developer tools. It gives you:
- GitHub stars + community trust + contributions (open source signal)
- Revenue + user metrics + business acumen (product signal)
- The widest possible surface area for employer evaluation

### The Ideal Resume Line
> "Built an AI content detection platform that won MadData26, grew to X,000 users with Y% weekly retention, Z paying customers, and $W MRR. Open-source extension has N GitHub stars. Published evaluation methodology (AUC 0.982)."

That sentence alone gets interviews at every AI company hiring in 2026.

### Why This Works for You Specifically
- Anthropic explicitly hires for "side quests" — self-driven projects that demonstrate curiosity and shipping ability. They do not require PhDs.
- Over 40% of Anthropic Fellows subsequently join full-time. The July 2026 cohort is accepting applications now ($3,850/week stipend, $15K/month compute).
- The AI detection market is growing at 28.8% CAGR ($580M to $2.06B by 2030). You're building in a space that matters.

---

## 2. The Two Paths: Open Source vs. Product

### Path A: Pure Open Source

| Dimension | Assessment |
|-----------|------------|
| **Signal type** | Technical depth, community building, code quality |
| **GitHub stars target** | 500-2,000 (realistic for a well-marketed tool) |
| **Revenue** | $0 (donations negligible) |
| **Time investment** | Lower (no payment infra, no customer support) |
| **Career signal** | Strong for ML/research roles; weaker for product/SWE |
| **Risk** | Stars are vanity; 50% of repos with 1K+ stars are abandoned within 2 years |
| **User growth** | Slower — OSS users self-select for technical audience |
| **Data advantage** | Cannot collect/monetize data ethically without commercial relationship |
| **Moat** | None — anyone can fork and compete |

**Best for:** If you want pure ML/research roles and don't want to deal with business operations.

### Path B: Pure Product (Closed Source)

| Dimension | Assessment |
|-----------|------------|
| **Signal type** | Product thinking, UX, business model, customer development |
| **User target** | 5,000-50,000 free users, 100-2,500 paying |
| **Revenue** | $1,000-$25,000 MRR (realistic at $9.99/mo with 2-5% conversion) |
| **Time investment** | Higher (auth, payments, support, marketing) |
| **Career signal** | Strongest for product/SWE roles; also strong for ML if you publish methodology |
| **Risk** | Users demand support, reliability, uptime — real operational burden |
| **User growth** | Faster with free tier + viral mechanics |
| **Data advantage** | Can collect aggregate analytics with consent, train models, sell insights |
| **Moat** | Proprietary data (crowd-sourced provenance), trained models, brand |

**Best for:** If you want SWE/product roles and are willing to invest in operations.

### Path C: Open-Core (RECOMMENDED)

| Component | Status | Rationale |
|-----------|--------|-----------|
| Chrome extension source code | **Open source** (MIT/Apache 2.0) | Trust, transparency, contributions, GitHub stars |
| Detection pipeline (real-detectors.ts) | **Open source** | Enables community improvements, academic credibility |
| Evaluation dataset + methodology | **Open source** | Research signal, reproducibility |
| Next.js API routes + backend | **Proprietary** | Revenue protection, API monetization |
| Trained/fine-tuned models | **Proprietary** | Competitive moat from proprietary data |
| Crowd-sourced provenance database | **Proprietary** | Network effect — grows with users |
| Aggregate analytics (Slop Index) | **Proprietary** | B2B data product potential |

**This gives you BOTH signals.** GitHub stars from the open extension, revenue from the proprietary backend, and a research artifact from the open evaluation methodology.

---

## 3. Market Landscape

### Market Size

| Metric | 2025 | 2030 Forecast | CAGR |
|--------|------|---------------|------|
| AI Detection Market (narrow) | $580M | $2.06B | 28.8% |
| AI Content Detection Software | $1.79B | $6.96B by 2032 | 21.4% |
| Education segment | $520M | Growing | — |
| Text detection share | 37.3% | — | — |

### Competitor Landscape

| Competitor | Users | Revenue | Funding | Pricing | Your Edge |
|-----------|-------|---------|---------|---------|-----------|
| **GPTZero** | 10M+ | ~$16M ARR | $13.5M | $8-15/mo | SynthID detection, multi-modal, open-source trust |
| **Turnitin** | 71M students | $203M | Acquired $1.75B | $2-6.50/student | Consumer-first, not institutional lock-in |
| **Copyleaks** | N/A | Inc. 5000 #153 | $7.1M | $8/mo+ | Method transparency, ensemble breakdown |
| **Hive** | N/A | N/A | $120M+ | Free extension | Provenance, gamification, deeper analysis |
| **Reality Defender** | Enterprise | N/A | $52.4M | Enterprise | Consumer accessibility, free tier |
| **Pangram** | N/A | N/A | N/A | $12.50/mo | Broader multi-modal, gamification, open-source |

### Your Competitive Differentiation

No competitor currently offers ALL of these in a single product:
1. Multi-modal ensemble detection (text + image + video)
2. SynthID watermark detection ("we detect Google's own watermarks")
3. Per-method score breakdown with transparency
4. Selection-based UX (intentional, not passive)
5. Crowd-sourced content provenance via SHA-256
6. Gamification (Information Diet Score, Exposure Score, Slop Index)
7. Open-source extension code

### Chrome Extension Competition

| Extension | Rating | Cost | Multi-Modal | Method Breakdown | Open Source |
|-----------|--------|------|-------------|-----------------|------------|
| GPTZero | 4.4 stars | Freemium | Text only | No | No |
| Hive AI Detector | N/A | Free | Yes | Partial | No |
| Copyleaks | 4.1 stars | Freemium | Text only | No | No |
| **Baloney** | New | Freemium | **Yes** | **Yes** | **Yes** |

---

## 4. Cost Analysis & Pricing Models

### Current API Stack Costs (Per Scan)

| API | Cost/Scan | Monthly Limit (Current) |
|-----|-----------|------------------------|
| Pangram (text) | $0.050 | 5/day free |
| SightEngine (image) | $0.002 | 2,000 ops/mo free |
| Vertex AI SynthID (image) | ~$0.040 | Pay-per-use |
| SynthID Text (Railway) | ~$0.005 | Compute-based |

### Usage Modeling Per Active User

A user with auto-scan enabled browsing 50-200 pages/day:

| Scenario | Text Scans/Day | Image Scans/Day | Video/Day | Total/Day |
|----------|---------------|-----------------|-----------|-----------|
| Light user | 20 | 50 | 5 | 75 |
| Medium user | 100 | 350 | 50 | 500 |
| Heavy user (filter mode) | 600 | 2,000 | 100 | 2,700 |

### Cost Per User (No Optimization)

Using current API stack at medium usage:

| Component | Scans/Day | Cost/Scan | Monthly Cost |
|-----------|-----------|-----------|-------------|
| Pangram | 100 | $0.050 | $150.00 |
| SightEngine | 350 | $0.002 | $21.00 |
| Vertex AI SynthID | 350 | $0.040 | $420.00 |
| SynthID Text | 100 | $0.005 | $15.00 |
| **TOTAL** | — | — | **$606/user/mo** |

**This is obviously unsustainable.** No consumer will pay $606/month.

### Cost Per User (Optimized with Caching + Filtering)

Apply: SHA-256 content caching (60% hit rate), skip tiny images/SVGs (50% reduction), text >50 words only (70% reduction), use GPTZero instead of Pangram ($0.03 vs $0.05), drop Vertex AI SynthID image:

| Component | Effective Scans/Day | Monthly Cost |
|-----------|---------------------|-------------|
| Text (GPTZero API) | 30 | $27.00 |
| Images (SightEngine) | 70 | $4.20 |
| SynthID Text (Railway) | 30 | $4.50 |
| Local analysis | 500 | $0.00 |
| **TOTAL** | — | **$35.70/user/mo** |

Still too expensive for a consumer product at scale. This is why self-hosting is essential.

### Cost Per User (Hybrid Tiered Architecture)

The winning architecture uses three tiers:

```
User browses page
    |
    v
[Tier 1: Client-Side] — FREE (85% of scans stop here)
    - Content hash lookup (cached results from Supabase)
    - Statistical text analysis (entropy, burstiness — already in computeTextStats())
    - Image EXIF/metadata check
    - Browser ONNX model (DistilBERT via Transformers.js + WebGPU)
    |
    +--> High confidence? --> Return result
    |
    v
[Tier 2: Self-Hosted GPU] — ~$0.00005/scan (12% of scans)
    - Fine-tuned RoBERTa/DeBERTa text classifier
    - ViT image classifier
    - SynthID text watermark detection
    |
    +--> High confidence? --> Return result
    |
    v
[Tier 3: Premium API] — $0.002-0.05/scan (3% of scans)
    - Pangram (text, 99.85% accuracy)
    - SightEngine (image, 98.3% accuracy)
    - Only for ambiguous cases or user-requested deep scan
```

**Costs with hybrid architecture:**

| Active Users | Monthly Cost | Per-User Cost | Viable Price Point |
|-------------|-------------|---------------|-------------------|
| 1,000 | $590 | $0.59 | $4.99/mo (88% margin) |
| 10,000 | $1,850 | $0.19 | $2.99/mo or free + ads |
| 100,000 | $9,500 | $0.095 | Free tier viable with $4.99 Pro |

### Recommended Pricing Tiers

| Tier | Price | Includes |
|------|-------|---------|
| **Free** | $0 | 10 scans/day, basic results, no history |
| **Pro** | $9.99/mo | 100 scans/day, method breakdown, scan history, Information Diet Score, Exposure Score |
| **Team** | $29.99/mo | Unlimited scans, API access, shared dashboard, multiple seats |
| **API** | $99-499/mo | 10K-100K scans, SLA, developer documentation |

### Revenue Projections

At 2-5% free-to-paid conversion (industry benchmarks for Chrome extensions):

| Free Users | Conversion Rate | Paying Users | MRR (at $9.99) | ARR |
|-----------|----------------|-------------|-----------------|-----|
| 1,000 | 2% | 20 | $200 | $2,400 |
| 5,000 | 3% | 150 | $1,500 | $18,000 |
| 10,000 | 4% | 400 | $4,000 | $48,000 |
| 50,000 | 5% | 2,500 | $25,000 | $300,000 |

---

## 5. Self-Hosting vs. API: The Economics

### GPU Cloud Pricing (Feb 2026)

| GPU | RunPod ($/hr) | Lambda Labs ($/hr) | Modal Serverless ($/hr) |
|-----|--------------|--------------------|-----------------------|
| T4 (16GB) | $0.17 | — | $0.59 |
| L4 (24GB) | $0.44 | — | $0.80 |
| A10G (24GB) | $0.44 | — | $1.10 |
| A100 80GB | $1.49 | $1.10 | $2.50 |
| H100 80GB | $2.49 | $2.49 | $3.95 |

### Throughput Per GPU

For text classification (RoBERTa/DeBERTa ~350M params):

| GPU | Throughput | Daily Capacity | Can Serve Users |
|-----|-----------|----------------|-----------------|
| T4 | ~150-300 req/s | 13M-26M scans | 26K-130K users |
| A10G | ~300-600 req/s | 26M-52M scans | 52K-260K users |

For image classification (ViT ~100M params):

| GPU | Throughput | Daily Capacity | Can Serve Users |
|-----|-----------|----------------|-----------------|
| T4 | ~400-800 req/s | 35M-69M scans | 100K-200K users |

### The Math: API vs Self-Hosted (10K Users)

| Approach | Monthly Cost | Per-User Cost | Accuracy |
|----------|-------------|---------------|----------|
| API-only (Pangram + SightEngine) | $297,000 | $29.70 | 99.85% text, 98.3% image |
| Self-hosted text + API images | $10,500 | $1.05 | ~90% text, 98.3% image |
| Fully self-hosted | $439 | $0.044 | ~90% text, ~85% image |
| Hybrid tiered | $1,850 | $0.19 | 95%+ (API for hard cases) |

**Self-hosting is cheaper at virtually any scale for text detection.** The crossover happens at ~15 active users. For images, SightEngine stays competitive until ~5,000 users.

### Tradeoffs of Self-Hosting

| Factor | API | Self-Hosted |
|--------|-----|-------------|
| Cost at scale | Extremely expensive | 100-1000x cheaper |
| Accuracy | 99.85% (Pangram) | ~90% (Binoculars/fine-tuned) |
| Engineering effort | Minimal | Significant (MLOps pipeline) |
| Latency | 200-500ms | 50-100ms (co-located) |
| Model updates | Automatic | Manual retraining needed |
| SLA | Provider guarantees | You're on your own |

### Best Open Source Models for Self-Hosting

**Text Detection:**

| Model | Approach | Notes |
|-------|----------|-------|
| desklib/ai-text-detector-v1.01 | Fine-tuned DeBERTa-v3-large | Leads RAID benchmark |
| Binoculars | Dual-model perplexity comparison | Zero-shot, works across models |
| ELECTRA-based discriminators | Replaced token detection | 110M params, efficient |

**Image Detection:**

| Model | Architecture | Notes |
|-------|-------------|-------|
| prithivMLmods/Deep-Fake-Detector-v2 | ViT (google/vit-base-patch16-224) | Fine-tuned on real/deepfake |
| dima806/ai_vs_real_image_detection | CNN-based | General AI vs real |
| CNNSpot / F3Net / UnivFD | Various | Established forensic baselines |

**Video Detection:** Weakest modality. No single reliable open-source model. Best approach: frame-by-frame image detection + temporal consistency analysis.

### Recommendation: Phased Approach

1. **Now (Month 1-3):** Keep current API stack for demos and low-volume free tier. Implement content-hash caching using existing `content_sightings` table.
2. **Month 3-6:** Add client-side statistical detection (already built) as Tier 1 filter. Deploy fine-tuned text classifier on RunPod/Modal T4 ($122-164/mo).
3. **Month 6-12:** Add client-side ONNX model via Transformers.js. Deploy image classifier. Reserve APIs for Tier 3 (ambiguous cases only).
4. **Month 12+:** Train proprietary models on crowd-sourced provenance data. This is your long-term moat.

---

## 6. The Detection Arms Race: What You're Up Against

### Frontier Text Models (Feb 2026)

| Model | Why It's Hard to Detect |
|-------|------------------------|
| GPT-5.2 (OpenAI) | Lower perplexity variance, 6.2% hallucination rate (human-like) |
| Claude Opus 4.5 (Anthropic) | Extended thinking, 80.9% SWE-bench (structured but natural) |
| Gemini 3 Pro (Google) | #1 user preference on LMArena, natural conversational style |
| LLaMA 4 (Meta) | Open-weight — users fine-tune to produce unique distributions |
| DeepSeek V3/R1 | Cost-efficient, popular, and diverse output styles |

### The Humanizer Problem

AI humanizer tools (BypassGPT, StealthWriter, Undetectable.ai, etc.) can bypass most detectors in 90%+ of cases. GPTZero drops to 18% detection on humanized text. **Pangram is the only commercial detector maintaining near-100% robustness against humanizers** — this is a critical reason to keep Pangram in your stack even at higher cost.

### Frontier Image Models (Feb 2026)

| Model | Realism Level | Watermarking |
|-------|--------------|-------------|
| Flux 2 Max | Highest overall photorealism | C2PA + visible labels |
| Midjourney v7 | Best for people/portraits | C2PA content credentials |
| DALL-E 4 (via GPT-4o) | Very high, reliable | C2PA content credentials |
| Google Imagen 3 | High, strong text rendering | **SynthID** (your differentiator) |
| SD 3.5 + LoRAs | High with tuning | **None** (biggest gap) |

### Frontier Video Models (Feb 2026)

| Model | Max Duration | Key Advance |
|-------|-------------|-------------|
| Sora 2 Pro | 20s+ | Narrative coherence, complex interactions |
| Kling 3.0 | Multi-shot | Subject consistency across camera angles |
| Veo 3.1 | 8s+ | Lip sync, body language |
| Runway Gen-4 | Variable | Stylized creativity |

Video detection is the **weakest link** in the detection chain. No single tool achieves reliable detection across all generators.

### Watermarking Landscape

| Provider | Text | Image | Video | Status |
|----------|------|-------|-------|--------|
| Google SynthID | Gemini outputs | Imagen outputs | Veo outputs | Deployed at scale, text model open-sourced |
| OpenAI | Built but NOT deployed | C2PA metadata | N/A | May be forced by EU AI Act (Aug 2026) |
| Meta | None | None | Video Seal (open-source) | Video Seal is MIT licensed |
| C2PA Standard | Metadata only | Metadata only | Metadata only | Growing adoption, ISO pending |

**Critical insight:** Only 38% of AI image generators implement adequate watermarking. Text watermarking is even lower. The EU AI Act mandates machine-readable markings starting August 1, 2026 — this regulatory pressure is a tailwind for Baloney.

### What Detection Approaches Are Most Robust

1. **Watermark detection** (when available) — highest confidence, deterministic
2. **Ensemble methods** (multiple signals per modality) — what Baloney does
3. **Frequency-domain analysis** (DCT coefficients) — generator fingerprints differ from cameras
4. **Provenance/metadata** (EXIF, C2PA, content hashing) — hard to forge
5. **Statistical analysis** (at length) — 300+ words consistently improves accuracy

**Your SynthID detection is a genuine differentiator.** As Gemini 3 Pro leads user-preference rankings, more content will carry SynthID watermarks, making your detection more valuable over time.

---

## 7. Legal & Ethical Constraints

### Data Collection Rules

| What You Can Collect | Conditions |
|---------------------|-----------|
| Text user actively selects for scanning | Disclosed in privacy policy |
| Images user explicitly requests to analyze | Disclosed in privacy policy |
| Scan results and detection scores | Standard data retention |
| Browsing metadata (URLs, timestamps) | Disclosed AND consented to |
| Content for model training | **Separate, granular, opt-in consent required** |

| What You Cannot Do | Why |
|-------------------|-----|
| Passively collect all browsing content | GDPR, CCPA, Chrome Web Store policy |
| Sell individual-level data | FTC enforcement (Avast: $16.5M fine) |
| Sell data to ad platforms or data brokers | Chrome Web Store Limited Use policy |
| Train on user data without explicit consent | GDPR Article 6, proposed AI Accountability Act |
| Auto-label content publicly | Defamation risk, false positive harm |

### Key Regulations

| Regulation | Effective | Impact on Baloney |
|-----------|-----------|-------------------|
| GDPR (EU) | Active | Consent for processing, right to erasure, DPIA required |
| CCPA/CPRA (California) | Jan 2026 updates | Right to delete, opt-out of sale/sharing, GPC signal recognition |
| EU AI Act Article 50 | Aug 1, 2026 | Mandates watermarking — tailwind for detection market |
| Colorado AI Act | Jun 30, 2026 | Duty of care for "high-risk AI systems" |
| California SB 942 | Aug 2026 | Mandates free AI detection tools from large platforms |

### The False Positive Problem

This is the #1 ethical risk. Stanford research found AI detectors misclassify **61% of essays by non-native English speakers** as AI-generated. Real consequences include:
- Students receiving zeros or academic integrity charges
- Content creators having work dismissed
- Lawsuits from affected individuals

**Mitigations you already have:**
- Method breakdown shows WHY content was flagged (transparency)
- Confidence scores, not binary labels
- Selection-based scanning (user intent, not passive surveillance)

**Mitigations you need:**
- Prominent disclaimers that results are probabilistic, not definitive
- Published bias metrics on the evaluation page
- Feedback mechanism for false positives
- Never present results as conclusive proof

### Chrome Web Store Compliance Checklist

- [ ] Privacy policy published and linked from listing
- [ ] Limited Use compliance statement on baloney.app
- [ ] `<all_urls>` permission justified (AI detection requires cross-site access)
- [ ] No data transferred to ad platforms or data brokers
- [ ] No employee access to user content (except security/support with consent)
- [ ] Marquee promo image (1400x560) with no policy violations

### Precedent Cases to Know

| Case | What Happened | Lesson |
|------|--------------|--------|
| **FTC v. Avast (2024)** | $16.5M fine for selling browsing data from extensions | "Web browsing data is sensitive. Full stop." — FTC |
| **Honey/PayPal (2024-25)** | Class action lawsuits, lost 6M users | Transparency matters; deceptive practices destroy trust |
| **287 Extensions (Feb 2026)** | Found leaking browsing data (37.4M users affected) | Chrome Web Store review is imperfect; self-regulate |

### Can You Train on User Data?

**Yes, but only with proper consent:** Separate opt-in (not bundled with ToS), plain language explanation, easy withdrawal, data deletion upon withdrawal. Follow Grammarly's model: training is opt-out for free users, opt-in for enterprise, using de-identified aggregated samples.

### Can You Sell Aggregate Data?

**Safest:** Sell API access to detection capability (like Pangram/SightEngine do).
**Safe:** Publish aggregate reports (AI Slop Index style) with no individual data.
**Risky:** B2B data licensing of platform analytics (legal if truly anonymized, but under increasing scrutiny).
**Dangerous:** Any sale of individual browsing/scanning data — don't do this.

---

## 8. Growth Strategy

### Distribution Channels (Priority-Ordered)

| Channel | Expected Impact | Effort | Timeline |
|---------|----------------|--------|----------|
| **UW-Madison campus** | 200-500 installs | Low | Week 1-2 |
| **Product Hunt launch** | 500-2,000 installs in 48hrs | Medium | Week 3-4 |
| **Hacker News "Show HN"** | 500-3,000 installs | Low | Same day as PH |
| **Reddit** (r/artificial, r/Chrome, r/datascience) | 200-500 installs | Low | Week 3-4 |
| **CS clubs at other universities** | 100-300 installs per school | Medium | Month 2-3 |
| **TikTok/X demo videos** | Viral potential (0 to 50K+) | Medium | Ongoing |
| **Chrome Web Store Featured badge** | 2x organic installs | Low (apply) | Month 2-3 |
| **Localization (10-15 languages)** | 30-50% growth from international | Low (AI translate) | Month 2 |

### Realistic Growth Timeline

| Milestone | Timeline | Requirement |
|-----------|----------|-------------|
| Chrome Web Store published | Week 1-2 | Polish, screenshots, promo image |
| 100 users | Week 2-4 | Campus + friends |
| 1,000 users | Month 1-2 | Product Hunt + HN + Reddit |
| Featured badge | Month 2-3 | Apply after good reviews |
| $1,000 MRR | Month 3-5 | 5K free users x 2% conversion x $9.99 |
| 10,000 users | Month 4-8 | Sustained marketing + localization |
| 100,000 users | Month 12-24+ | Viral loop or press coverage required |

**Benchmark:** 86.3% of Chrome extensions have fewer than 1,000 users. Reaching 10,000 puts you in the top ~15%.

### Viral Mechanics

1. **Shareable scan results:** "Share this result" button generates `baloney.app/scan/abc123` — non-users see result + install CTA
2. **Referral program:** "Invite a friend, both get 10 extra scans/month" (Dropbox model — 3M users in 30 days)
3. **Social proof badges:** "Verified by Baloney" badge for social profiles
4. **Content provenance is inherently viral:** More users = more valuable crowd-sourced database = more reason to join

### Getting Featured on Chrome Web Store

1. Fill out Google's nomination form (select "I want to nominate my extension to receive a Featured badge")
2. Requirements: marquee promo image (1400x560), no policy violations, no paywalls for core functionality
3. Google editorial reviews for: CWS best practices, intuitive UX, latest platform APIs (Manifest V3 — you have this)
4. One developer reported doubling installs just by getting featured

---

## 9. Business Models Beyond Subscriptions

### Model 1: Freemium SaaS (Primary)

The bread-and-butter model. Free tier hooks users, paid tier captures value.

| Metric | Benchmark |
|--------|-----------|
| Median free-to-paid conversion (B2B SaaS) | 2-5% |
| Chrome extension conversion benchmark | ~5% |
| Most conversions occur | Within first 30 days |

Real-world examples:
- Bluedot (AI Chrome extension): $1,500 MRR with 500 DAU, 2 months post-launch
- Easy Folders: $3,700 MRR, $42,000 total revenue, 6 months post-launch

### Model 2: B2B API Licensing

Sell detection-as-a-service to other platforms:

| Tier | Price | Volume |
|------|-------|--------|
| Starter API | $99/mo | 10,000 scans |
| Business API | $499/mo | 100,000 scans |
| Enterprise | Custom | Unlimited, SLA, support |

Potential customers: LMS platforms, CMS tools, newsrooms, social media companies.

### Model 3: Aggregate Data Products

Sell insights about AI content prevalence (NOT individual user data):
- "AI Slop Index" reports — platform-level AI content rates
- Trend analytics — time-series data on AI content growth
- Industry benchmarks — per-vertical AI content analysis

This is the SimilarWeb/Nielsen model: aggregate, obfuscated insights. Legal if properly anonymized.

### Model 4: White-Label / OEM

License detection capability to existing platforms:
- LMS integration (Canvas, Blackboard) — direct integration into assignment submission
- CMS plugins (WordPress, Medium) — content verification
- Newsroom tools — editorial fact-checking workflows

Revenue share typically 20-40% of sales volume.

### Model 5: Proprietary Model Training

Long-term moat: use crowd-sourced provenance data (with consent) to train proprietary detection models that outperform general-purpose open-source alternatives. This is the flywheel:

```
More users --> More scan data --> Better models --> Better detection --> More users
```

Legal requirements: separate opt-in consent for training data contribution, clear disclosure, easy withdrawal.

### Model 6: Grants and Research Funding

Surprisingly viable for AI safety tools:

| Funder | Amount | Notes |
|--------|--------|-------|
| AI Safety Fund (Anthropic, Google, Microsoft, OpenAI) | $10M+ pool | New grantees Dec 2025 |
| Coefficient Giving / Open Philanthropy | ~$40M available | Technical AI safety RFP, rolling apps |
| Foresight AI for Science & Safety | $10K-$100K | SF/Berlin program, includes compute |
| UK AI Security Institute | Up to 200K GBP | Challenge Fund for AI risk research |
| Survival & Flourishing Fund | Varies | 1-week decision on Speculation Grants |

---

## 10. Authentication & Payment Implementation

### Auth: Use Supabase Auth (Zero New Dependencies)

You already have Supabase. Adding auth requires:

```
Extension popup --> "Sign in" button --> Opens baloney.app/auth
    --> Supabase Auth (email/password + Google OAuth)
    --> Token returned --> Stored in chrome.storage.local
    --> Sent with all API requests
```

| Provider | Free Tier | Cost After | Why Supabase Wins |
|----------|-----------|-----------|-------------------|
| **Supabase Auth** | 50,000 MAU | $0.00325/MAU | Already in your stack, cheapest |
| Clerk | 10,000 MAU | $0.02/MAU | 6x more expensive |
| Auth0 | 25,000 MAU | $0.07/MAU | 21x more expensive |
| Firebase Auth | 50,000 MAU | Complex | Wrong ecosystem |

### Payment: Two Options

**Option A — ExtensionPay (Fastest, <1 hour setup)**
- Open-source library built for Chrome extensions
- Handles auth + payment via Stripe
- Supports freemium, monthly, yearly, free trials
- Has earned extension creators $500K+ total

**Option B — Stripe + Your Backend (More control)**
- User clicks "Upgrade" in extension opens `baloney.app/pricing`
- Stripe Checkout handles payment, webhook updates `profiles.plan` in Supabase
- More work but you own the entire flow

**Recommendation:** Start with ExtensionPay for speed, migrate to Stripe + your backend when you hit $1K MRR and need more control.

### Implementation Steps

1. Add `supabase.auth` to extension (new tab for sign-in/sign-up)
2. Store session token in `chrome.storage.local`
3. Add `user_id` to all API requests (replace hardcoded `DEMO_USER_ID`)
4. Add `plan` column to `profiles` table (free/pro/team)
5. Add scan counting middleware to API routes
6. Add ExtensionPay or Stripe Checkout for payment
7. Add rate limiting based on plan tier

---

## 11. Metrics That Matter

### KPIs That Impress Employers and Investors

| Metric | Good | Great | Exceptional |
|--------|------|-------|-------------|
| DAU/MAU ratio | >20% | >25% | >40% |
| Day-1 retention | >40% | >50% | >65% |
| Month-1 retention | >25% | >40% | >50% |
| Monthly churn | <7% | <5% | <3% |
| Free-to-paid conversion | >2% | >5% | >10% |
| Chrome Web Store rating | >4.0 | >4.5 | >4.8 |
| NPS | >30 | >50 | >70 |

### How to Track and Showcase

1. **Chrome Web Store Analytics:** Built-in metrics (impressions, installs, uninstalls by day)
2. **Supabase Dashboard:** You have scan data — build a public `/stats` page showing total scans, unique users, AI content detected
3. **Open Startup Page:** Create `baloney.app/open` showing real-time MRR, user count, scan volume. Transparency builds trust AND is a growth lever.
4. **GitHub README:** User count badge, weekly installs, rating badge
5. **PostHog/Plausible:** Free analytics for extension usage patterns

### Revenue Benchmarks for Chrome Extensions

- $1,000 MRR is the first real milestone
- Top-performing extensions achieve $5+ revenue per user per month
- Bluedot hit $1,500 MRR with 500 DAU in 2 months
- Easy Folders hit $3,700 MRR in 6 months

---

## 12. Funding & Accelerators

### AI Safety Grants (Most Relevant)

| Funder | Amount | Deadline | Fit |
|--------|--------|----------|-----|
| Coefficient Giving | Up to $40M pool | Rolling | High — AI safety research |
| Foresight AI | $10K-$100K | Rolling | High — includes compute |
| AI Safety Fund | Pool $10M+ | Announced Dec 2025 | Medium — may require institutional affiliation |
| UK AI Security Institute | Up to 200K GBP | Open | Medium — UK-focused but accepts international |
| Survival & Flourishing | Varies | 1-week decisions | Low effort to apply |

### Accelerators

| Program | Focus | Investment | Notes |
|---------|-------|-----------|-------|
| **Y Combinator** | General (AI safety welcome) | $500K for 7% | Standard deal; AI trust & safety is a hot thesis |
| **Fifty Years** | AI safety startups specifically | Varies | 12-14 week program |
| **Menlo + Anthropic Fund** | AI startups (trust & safety tooling) | Seed to Series A, $100M pool | Directly relevant |
| **Neo** | Student founders | Community + funding | Explicitly for undergrad/grad students |

### Anthropic Fellows Program

**Directly relevant and immediately actionable:**
- July 2026 cohort accepting applications
- 4-month research fellowship
- $3,850/week stipend
- $15K/month compute budget
- No PhD required
- Over 40% of fellows subsequently join Anthropic full-time
- Your AI detection work is directly aligned with their mission

---

## 13. Concrete Roadmap

### Phase 1: Ship & Launch (Weeks 1-4)

| Week | Action | Deliverable |
|------|--------|------------|
| 1 | Publish on Chrome Web Store; polish listing + screenshots | Live CWS listing |
| 1 | Add privacy policy to baloney.app | Legal compliance |
| 2 | Add Supabase Auth (replace hardcoded DEMO_USER_ID) | Real user accounts |
| 2 | Open-source extension repo (keep backend private) | GitHub repo public |
| 3 | Launch on Product Hunt (Tue/Wed, 12:01 AM PT) | Launch day |
| 3 | Post "Show HN" on Hacker News | Same-day double launch |
| 3 | Post on Reddit (r/artificial, r/Chrome, r/InternetIsBeautiful) | Distribution |
| 4 | Apply for Chrome Web Store Featured badge | Badge application |

**Target: 1,000 users**

### Phase 2: Monetize (Months 2-3)

| Action | Deliverable |
|--------|------------|
| Add ExtensionPay or Stripe payment flow | Paywall live |
| Implement scan counting (10 free/day, 100 pro/day) | Rate limiting |
| Add `plan` column to profiles, rate limit middleware | Tier enforcement |
| Build `baloney.app/open` public metrics page | Transparency |
| Localize CWS listing into 10-15 languages | International growth |
| Add shareable scan results (`baloney.app/scan/:id`) | Viral mechanic |
| Apply for Anthropic Fellows Program | Career development |

**Target: 5,000 users, $500+ MRR**

### Phase 3: Scale Detection (Months 3-6)

| Action | Deliverable |
|--------|------------|
| Deploy fine-tuned text classifier on RunPod T4 ($122/mo) | Self-hosted Tier 2 |
| Implement content-hash caching layer | 60% scan reduction |
| Add client-side ONNX model via Transformers.js | Browser Tier 1 |
| Build tiered detection pipeline (client, self-hosted, API) | Cost reduction |
| Apply for AI safety grants (Coefficient Giving, Foresight) | Funding |

**Target: 10,000 users, $2,000+ MRR**

### Phase 4: Proprietary Advantage (Months 6-12)

| Action | Deliverable |
|--------|------------|
| Train proprietary models on crowd-sourced provenance data | Model moat |
| Launch B2B API tier ($99-499/mo) | Enterprise revenue |
| Publish AI Slop Index aggregate reports | Data product |
| Deploy image classifier on self-hosted GPU | Further cost reduction |
| Explore white-label partnerships (LMS, CMS) | B2B pipeline |

**Target: 50,000 users, $10,000+ MRR**

### Phase 5: Venture Scale (Year 2+)

| Action | Deliverable |
|--------|------------|
| Apply to YC, Fifty Years, or Menlo+Anthropic fund | Institutional backing |
| Hire first engineer (or bring on co-founder) | Team scaling |
| EU AI Act compliance features (Aug 2026 mandate) | Market timing |
| Multi-platform expansion (Firefox, Safari, mobile) | TAM expansion |

**Target: 100,000+ users, sustainable business or acquisition offer**

---

## Appendix A: Decision Matrix

| Factor | Open Source | Product | Open-Core (Recommended) |
|--------|-----------|---------|------------------------|
| Career signal (ML/Research) | Strong | Medium | Strong |
| Career signal (SWE/Product) | Medium | Strong | Strong |
| Revenue potential | None | High | High |
| User growth speed | Slower | Faster | Fastest |
| Engineering effort | Lower | Higher | Highest (but phased) |
| Competitive moat | None | Data + models | Data + models + community |
| Community trust | Highest | Medium | High |
| Investor interest | Low | High | Highest |
| Time to signal | 3-6 months | 3-6 months | 3-6 months |

## Appendix B: Key Numbers

| Metric | Value | Source |
|--------|-------|-------|
| AI detection market size (2025) | $580M | MarketsandMarkets |
| Market CAGR | 28.8% | MarketsandMarkets |
| GPTZero ARR | ~$16M | Sacra |
| GPTZero users | 10M+ | GPTZero |
| Turnitin revenue | $203M | Sacra |
| Chrome extensions with <1K users | 86.3% | ExtensionFast |
| Median freemium conversion | 2-5% | First Page Sage |
| Pangram accuracy | 99.85% | arXiv:2402.14873 |
| SightEngine accuracy | 98.3% | ARIA benchmark |
| Baloney AUC | 0.982 | Internal evaluation |
| SynthID content watermarked | 10B+ | Google |
| AI generators with adequate watermarking | 38% | arXiv:2503.18156 |
| Non-native English speaker false positive rate | 61% | Stanford HAI |
| Anthropic Fellows full-time conversion | 40%+ | Anthropic |
| RunPod T4 monthly cost | $122 | RunPod |
| Hybrid architecture cost per user (10K users) | $0.19/mo | Calculated |
| EU AI Act watermark mandate | Aug 1, 2026 | EU Regulation 2024/1689 |

## Appendix C: Sources

### Market & Competition
- [MarketsandMarkets AI Detector Market](https://www.marketsandmarkets.com/Market-Reports/ai-detector-market-199981626.html)
- [Sacra GPTZero Profile](https://sacra.com/c/gptzero/)
- [Sacra Turnitin Profile](https://sacra.com/c/turnitin/)
- [Coherent Market Insights AI Content Detection](https://www.coherentmarketinsights.com/industry-reports/ai-content-detection-software-market)

### Pricing & APIs
- [Pangram API Pricing](https://www.pangram.com/pricing)
- [SightEngine Pricing](https://sightengine.com/pricing)
- [GPTZero API](https://gptzero.me/developers)
- [Hive AI Pricing](https://thehive.ai/pricing)
- [RunPod Pricing](https://www.runpod.io/pricing)
- [Modal Pricing](https://modal.com/pricing)
- [Lambda Labs Pricing](https://lambda.ai/pricing)

### Legal & Compliance
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/policies)
- [Chrome Web Store Limited Use Policy](https://developer.chrome.com/docs/webstore/program-policies/limited-use)
- [FTC v. Avast Order](https://www.ftc.gov/news-events/news/press-releases/2024/06/ftc-finalizes-order-avast-banning-it-selling-or-licensing-web-browsing-data-advertising-requiring-it)
- [GDPR Article 22](https://gdpr-info.eu/art-22-gdpr/)
- [CCPA 2026 Compliance Guide](https://secureprivacy.ai/blog/ccpa-requirements-2026-complete-compliance-guide)
- [EU AI Act Article 50](https://artificialintelligenceact.eu/article/50/)
- [Stanford: AI Detectors Bias](https://hai.stanford.edu/news/ai-detectors-biased-against-non-native-english-writers)

### Detection & Models
- [RAID Benchmark](https://raid-bench.xyz/)
- [ARIA Image Detection Benchmark](https://sightengine.com/best-ai-image-detectors-benchmark)
- [AI Detector Arena](https://aidetectarena.com/)
- [Pangram Technical Report (arXiv:2402.14873)](https://arxiv.org/html/2402.14873v3)
- [SynthID at Internet Scale (arXiv:2510.09263)](https://arxiv.org/html/2510.09263v1)
- [Missing the Mark: Watermarking (arXiv:2503.18156)](https://arxiv.org/html/2503.18156v3)
- [Meta Video Seal](https://ai.meta.com/research/publications/video-seal-open-and-efficient-video-watermarking/)
- [Binoculars (HuggingFace)](https://huggingface.co/blog/dmicz/binoculars-text-detection)
- [desklib/ai-text-detector-v1.01](https://huggingface.co/desklib/ai-text-detector-v1.01)

### Growth & Strategy
- [ExtensionFast $1K MRR Guide](https://www.extensionfast.com/blog/how-to-get-to-1000-mrr-with-your-chrome-extension)
- [ExtensionPay](https://extensionpay.com/)
- [Chrome Web Store Discovery](https://developer.chrome.com/docs/webstore/discovery/)
- [First Page Sage Freemium Rates](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/)
- [Product Hunt Launch Guide](https://www.marketingideas.com/p/how-to-successfully-launch-on-product)

### Career & Funding
- [Breaking Into AI 2026](https://dataexec.io/p/breaking-into-ai-in-2026-what-anthropic-openai-and-meta-actually-hire-for)
- [Anthropic Hiring Traits](https://www.entrepreneur.com/business-news/anthropic-engineers-can-make-up-to-560000-heres-the-unusual-trait-an-exec-looks-for-in-new-hires)
- [Anthropic Fellows Program 2026](https://alignment.anthropic.com/2025/anthropic-fellows-program-2026/)
- [AI Safety Funding Directory](https://www.aisafety.com/funding)
- [Coefficient Giving RFP](https://coefficientgiving.org/funds/navigating-transformative-ai/request-for-proposals-technical-ai-safety-research/)
- [Frontier Model Forum AI Safety Fund](https://www.frontiermodelforum.org/ai-safety-fund/)

---

## Appendix D: Post-Research Strategic Revisions

*Added February 23, 2026 after reviewing a comprehensive technical landscape report on AI content detection across platforms.*

### The Lab-to-Wild Accuracy Gap

SOTA detection systems lose **45-50% of their accuracy** when deployed on real social media content compared to laboratory benchmarks (Deepfake-Eval-2024, TrueMedia.org). This means Baloney's reported AUC of 0.982 is a lab number — real-world performance on social media is likely 0.75-0.85. This is universal across all detectors, not a Baloney-specific flaw. The implication: **stop competing on accuracy numbers, compete on honesty.** Show confidence intervals, show when methods disagree, and say "insufficient data" when you can't determine reliably.

### Architectural Revisions

**1. CLIP-based detection should replace frequency/DCT for images at scale**

The current pipeline uses SightEngine + frequency/DCT + metadata. Research confirms frequency-domain features are the most vulnerable to JPEG compression — exactly what every social media platform applies. CLIP-based detectors (UnivFD: linear probe on ViT-L/14, trained on ProGAN only, generalizes to 19 generators) survive compression because they operate at semantic level. When self-hosting (Phase 3), the image model should be CLIP-based.

**2. Binoculars over fine-tuned classifiers for text**

SCALING.md originally recommended fine-tuned DeBERTa (leads RAID benchmark). However, fine-tuned classifiers generalize poorly to new models. Binoculars (Hans et al., ICML 2024) computes perplexity/cross-perplexity ratio between two LLMs — >90% detection at 0.01% FPR, zero-shot, works across all models. Requires two ~7B models (A10G at $317/mo on RunPod instead of T4 at $122/mo), but is future-proof against new generators.

**3. Platform-specific compression-aware training**

Each social media platform compresses content differently. Upload ~50 test images/videos to each platform, download them back, measure compression parameters, then emulate that compression during model training. This recovers much of the 45-50% accuracy loss. Route detection through platform-specific models based on which site the extension detects (already have platform detection for 12 platforms in `background.js`). **Nobody else is doing this publicly — it's a concrete moat.**

**4. Short content honesty threshold**

Text detectors need 100-300+ tokens for reliable classification. Average tweet is ~40 tokens. Rather than guessing on short text, show "Too short to analyze reliably" for content under 100 tokens. Builds trust and differentiates from competitors who silently give bad results.

### Video Strategy: High-Precision, Low-Recall

Video detection is the weakest modality across the entire field. The strategy is to only flag when confident, and let ambiguous content pass without a verdict:

| Signal | Action | False Positive Risk |
|--------|--------|-------------------|
| SynthID/C2PA watermark found | Flag confidently | Zero |
| SightEngine high confidence (>0.85) | Flag with method breakdown | Low |
| SightEngine medium confidence (0.5-0.85) | Show "Unable to determine" | N/A |
| No signal | Silence — no dot, no badge | N/A |

The absence of a verdict is better than a wrong one. Users learn that when Baloney flags a video, it means something.

### Detection Scope: All Content, User Decides

The extension detects all content types — photorealistic images, stylized art, animated films, edited photos, text. The product does not filter by "intent to deceive" because the extension can't know intent. Instead:

- **Detect accurately** across all content types
- **Present honestly** with confidence scores and method breakdowns
- **Let the user decide** what matters to them

A user seeing a flagged AI animated short may not care. A user seeing a flagged news photo will care deeply. Both are valid detections. The Information Diet Score and method breakdown already let users contextualize results for themselves.

What the extension **does** skip (technical filtering, not philosophical):
- Tiny images, icons, SVGs, ads (not content, just UI)
- Known logos and avatars (waste of API calls)
- Text under 100 tokens (insufficient data for reliable analysis)

### Data Collection Revisions

**1. Platform compression fingerprints (new priority)**

Store compression characteristics of content per-platform. This enables platform-specific model training and cross-platform re-upload detection (different compression artifacts = different platform of origin). Minimal privacy concern — it's metadata about compression, not content.

**2. Cross-platform provenance (validated)**

The technical landscape report validates the SHA-256 provenance approach. Coordinated disinformation campaigns reuse synthetic content across platforms. The `content_sightings` table is building cross-platform disinformation detection capability. No competitor has this.

**3. Adversarial feedback data (highest value)**

Every user correction ("this is wrong, I wrote this") is an adversarial training sample — the hardest data to collect and most valuable for improving robustness against humanizers and evasion techniques.

### Revised Positioning

| Before | After |
|--------|-------|
| "98.2% AUC" | "Trained on real social media content, not lab data" |
| "Multi-modal detection" | "Layered defense: watermarks + forensics + provenance + you" |
| "Works everywhere" | "Built for where detection doesn't exist: X, Reddit, Substack" |
| "Ensemble of 3-4 APIs" | "Platform-aware detection tuned for how each site compresses content" |
| Binary AI/Human verdicts | "Honest confidence with method-level transparency" |

**X/Twitter is the beachhead.** The report confirms X has no dedicated detection system and is not a C2PA member. Every other major platform has something. X has Community Notes covering ~1 in 500,000 tweets. The marketing angle: "X won't detect AI content for you. We will."

### Key Research References

- Deepfake-Eval-2024 (Chandra et al., TrueMedia.org, March 2025) — 45-50% accuracy drop on social media
- UnivFD (Ojha et al., CVPR 2023) — CLIP-based detection generalizing across 19 generators
- Binoculars (Hans et al., ICML 2024) — >90% detection at 0.01% FPR, zero-shot
- AEROBLADE (Ricker et al., CVPR 2024) — Training-free detection via autoencoder reconstruction, AP 0.991-0.999
- SynthID-Text (Dathathri et al., Nature 634:818-823, October 2024) — Production text watermarking on 20M+ Gemini responses
- RAID Benchmark (Dugan et al., ACL 2024) — 6M+ generations, 11 LLMs, 12 adversarial attacks
- Sadasivan et al. (arXiv:2303.11156) — Theoretical limits on detection as LLMs improve
- Liang et al. (Patterns, July 2023) — AI detectors biased against non-native English writers
- Meta Seal suite (Fernandez et al., 2023-2025) — Open-source watermarking across all modalities

---

## Appendix E: Solving the Generalization Gap — The Data Moat

*Added February 23, 2026.*

### Why Lab Models Fail on Social Media

Lab models are trained on: `Generator output → Detection model`

Real world is: `Generator output → Screenshot/save → Upload → Platform compression → CDN resizing → User's browser → Detection model`

Every step between generation and detection degrades the signals lab models rely on. **Nobody has a large-scale dataset of AI content as it actually appears on social media.** That's the gap — and the opportunity.

### The Extension Sees Content in Its Deployed State

Every other detection company gets content submitted to an API in its original form. Baloney's extension sees it how users actually encounter it — after platform compression, after resizing, after CDN processing. That's fundamentally different data.

### Moat 1: Social-Media-Native Training Dataset

With user opt-in, the extension extracts **feature vectors** (not raw content) from content as the platform serves it:

```
Content on Twitter → Extension extracts:
  - CLIP embedding (768-dim vector, not the image itself)
  - Compression artifact signature
  - Frequency-domain features
  - Platform ID
  - Detection result from current models

User corrects result → Now you have a LABELED sample
```

Over time this builds a dataset of "what AI content looks like on Twitter/Instagram/Reddit after platform processing." Train on this and you've solved the generalization gap. The dataset is un-replicable because it requires browser-level access to platform-served content at scale.

### Moat 2: User Corrections as Adversarial Gold

Every user correction — "wrong, I wrote this" or "wrong, this is obviously AI" — is a labeled adversarial sample. These are the hardest and most expensive samples to collect:

- **False positives on human content** → teaches the model what human writing looks like on social media
- **False negatives on AI content** → teaches the model what evasion looks like in the wild
- **Corrections on humanized text** → adversarial robustness data nobody else has

At 10K users with even a 2% correction rate: hundreds of adversarial labels per day. That compounds.

### Moat 3: Cross-Platform Normalization

The `content_sightings` table tracks the same SHA-256 hash across platforms. When the same image appears on Twitter AND Instagram:

- Twitter version has Twitter's compression artifacts
- Instagram version has Instagram's compression artifacts
- Same underlying content, different platform processing

This paired data enables a **platform normalization layer** — strip platform-specific artifacts before detection. Nobody else can build this because nobody else sees the same content served by multiple platforms.

### Moat 4: Social Graph Signals (Orthogonal to Content Analysis)

The extension has access to signals completely independent of pixel/text analysis:

- **Propagation velocity**: AI disinformation content often appears simultaneously across multiple platforms. The provenance table detects this.
- **Engagement anomalies**: Visible in the DOM — likes, replies, shares. AI content may have different engagement signatures.
- **Account-level patterns**: Same account posting 50 images/day, all flagged AI → signal even when individual detection is uncertain.
- **Temporal first-seen**: Content appearing on 8 platforms within 1 hour is suspicious regardless of detection score.

These social signals break ties when pixel/text-level detection is uncertain (the 0.4-0.6 confidence zone). No API-based competitor has access to any of this.

### Moat 5: Continuous Drift Tracking

Generators update constantly. GPT-5 text looks different than GPT-4. Midjourney v7 images differ from v6. Lab datasets go stale within months.

The extension sees the **current** distribution of AI content as it evolves. When a new generator starts evading detection, users correct false negatives in real-time. Retrain on fresh data before any lab-based competitor even knows the distribution has shifted.

### The Revised Flywheel

```
Users browse social media with extension
    → Extension extracts features from platform-served content
    → Users correct wrong predictions (adversarial labels)
    → Cross-platform hashes create paired training data
    → Train platform-specific, compression-aware models
    → Better real-world accuracy than any lab-trained model
    → Users trust results more → tell friends → more users
    → More data → better models → wider gap over competitors
```

The moat isn't "we have more data." It's "we have the **only** dataset of AI content as it actually appears on social media, labeled by real users in adversarial conditions, paired across platforms." That dataset cannot exist without the extension installed at scale. It's structurally un-replicable.

### Why the Free Tier Is Strategic, Not Charitable

The first 10K users aren't just customers — they're building a dataset that makes the product better for user 10,001. Every free user contributes data (with consent) that makes the paid product more accurate. This is the same flywheel that made Google Search, Waze, and Tesla Autopilot dominant — the product improves because people use it.

---

*Generated February 22, 2026. Updated February 23, 2026 with strategic revisions from technical landscape analysis and data moat strategy. Research conducted via parallel web search agents covering market analysis, API pricing, legal/ethical frameworks, detection technology, and growth strategy.*
