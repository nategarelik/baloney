# Baloney — Post-Hackathon: Next Steps & Scale Assessment

> Written after MadData26. This document covers everything needed to decide how, whether, and at what cost to take Baloney beyond the MVP.

---

## Table of Contents

1. [What We Built](#what-we-built)
2. [API Usage Rights & Costs](#api-usage-rights--costs)
3. [Chrome Web Store TOS Requirements](#chrome-web-store-tos-requirements)
4. [Data Collection & Privacy Obligations](#data-collection--privacy-obligations)
5. [Ethical Concerns](#ethical-concerns)
6. [Known Bugs & Technical Debt](#known-bugs--technical-debt)
7. [Payment Architecture for Monetization](#payment-architecture-for-monetization)
8. [Deployment Options: Business vs Open Source vs Both](#deployment-options-business-vs-open-source-vs-both)
9. [Production Readiness: MVP → Production Gap Analysis](#production-readiness-mvp--production-gap-analysis)
10. [Scaling Feasibility Assessment](#scaling-feasibility-assessment)
11. [Recommended Roadmap](#recommended-roadmap)
12. [Summary](#summary)

---

## What We Built

Baloney is a real-time AI content detection platform consisting of:

- **Chrome Extension (MV3)** — passive detection while browsing, Grammarly-style text selection analysis
- **Next.js Dashboard** — personal analytics, the AI Slop Index, community platform metrics
- **Detection Pipeline (v5.0)** — cascading API ensemble: SynthID → Pangram → SightEngine → statistical fallbacks
- **Supabase Backend** — 7 tables, 11 views, 4 RPC functions; SHA-256 provenance tracking; opt-in community data

The core innovation is not any single detector but the **ensemble architecture with early-exit prioritization** and the **network effect data flywheel** — every user is a sensor.

---

## API Usage Rights & Costs

### Pangram Labs (Text Detection — 99.85% accuracy)

| Item | Detail |
|------|--------|
| Free tier | 4 requests/day (exhausted immediately at scale) |
| Paid plans | Subscription-based; volume pricing is enterprise-negotiated |
| Commercial use | Allowed under subscription |
| Reselling | No explicit reseller rights in public TOS; enterprise agreement required |
| Data rights | Does NOT train on submitted data. Content deleted within 30 days of account closure. No third-party sharing. |
| Key risk | At 1,000 users doing 10 text scans/day = 10,000 calls/day. Free tier is immediately exhausted. **Contact Pangram for enterprise pricing before any public launch.** |

---

### SightEngine (Image/Video Detection — 98.3% accuracy)

| Plan | Monthly Cost | Included Ops | Overage Rate |
|------|-------------|-------------|-------------|
| Free | $0 | 2,000 (500/day) | N/A |
| Starter | $29 | 10,000 | $0.002/op |
| Growth | $99 | 40,000 | $0.002/op |
| Pro | $399 | 200,000 | $0.0015/op |
| Enterprise | Custom | Custom | Negotiated |

- **Commercial use:** Permitted under subscription
- **Reselling:** TOS prohibits making the API available directly to third parties; building products that call SightEngine behind the scenes is allowed
- **Data retention:** Images processed and discarded; not stored long-term

**Cost model at scale:**

| Users | Daily Scans/User | Monthly Ops | Est. Cost |
|-------|-----------------|-------------|-----------|
| 100 | 5 | ~15,000 | ~$29 |
| 1,000 | 5 | ~150,000 | ~$320 |
| 10,000 | 5 | ~1,500,000 | ~$2,350 |
| 100,000 | 5 | ~15,000,000 | Enterprise ($5k–$20k+) |

---

### Google SynthID (Watermark Detection)

| Component | Cost | License |
|-----------|------|---------|
| SynthID Text (HuggingFace model) | Free to self-host | Apache 2.0 |
| SynthID Image (Vertex AI endpoint) | ~$0.001–$0.003/image | Standard GCP ToS |

- **Commercial use:** Fully permitted
- **Key risk:** Our Railway-hosted SynthID backend is on a free tier; at scale it needs a dedicated GPU instance. The Vertex AI image endpoint accrues real GCP costs.
- **Opportunity:** SynthID text is the highest-value signal at zero per-call cost. Invest in a robust self-hosted deployment.

---

### Total Cost Estimate at 10,000 Users

| Service | Monthly Cost (est.) |
|---------|-------------------|
| Pangram (text) | $500–$2,000 (enterprise TBD) |
| SightEngine (image/video) | ~$2,350 |
| Google Vertex AI (SynthID image) | ~$500–$1,500 |
| Supabase Pro | $25 |
| Vercel Pro | $20–$150 |
| Railway (SynthID backend) | $20–$100 |
| **Total** | **~$3,400–$6,100/month** |

**This is not sustainable without monetization.** API costs scale faster than user growth at current pricing. Long-term you need either (a) user revenue, (b) proprietary models to replace the commercial APIs, or (c) favorable enterprise API contracts.

---

## Chrome Web Store TOS Requirements

### Mandatory Before Submission

1. **Privacy Policy** — Must be publicly hosted and linked in the listing. Must disclose: what data is collected (UUID, scan metadata, content hashes), where it goes (Supabase), retention periods, opt-in community sharing mechanics, and that raw content is never stored.

2. **Permissions Justification** — `<all_urls>` host permission (used for image fetching) requires explicit disclosure in the listing description.

3. **Data Use Disclosure** — Google's "Data Use" section in the developer dashboard must accurately declare user activity collection and website content interaction (hashed only).

4. **Manifest V3** — Already using MV3. ✓

5. **Single Purpose** — "AI content detection while browsing" is clear and defensible. ✓

6. **Developer Verification** — Two-step verification required on the developer account.

### Things That Could Cause Rejection

- `<all_urls>` without clear justification in the listing description
- Missing or vague privacy policy
- Ambiguous data collection disclosure (be explicit that content is hashed, not stored raw)
- Any runtime loading of external scripts (MV3 largely prevents this, but verify)

### Chrome Web Store One-Time Developer Fee
$5 one-time registration fee.

---

## Data Collection & Privacy Obligations

### What We Currently Collect

| Field | Purpose | Stored? |
|-------|---------|---------|
| User UUID | Aggregate stats, personal history | Yes |
| Content type | Analytics | Yes |
| Platform (Instagram, X, etc.) | Slop Index | Yes |
| Verdict + confidence | Personal/community analytics | Yes |
| SHA-256 hash of content | Provenance tracking | Yes |
| Source domain | Platform attribution | Yes |
| Scan duration | Performance monitoring | Yes |
| Timestamp | Time-series analytics | Yes |
| Raw text/images | N/A | **Never stored** |

### Privacy Obligations by Jurisdiction

| Regulation | Applies When | Key Requirements |
|-----------|-------------|-----------------|
| **GDPR** (EU) | Any EU users | Right to erasure, data minimization, explicit consent, DPA |
| **CCPA** (California) | CA users + scale thresholds | Right to opt-out of data sale, category disclosure |
| **COPPA** (US) | Under-13 users | Parental consent; add age gate |

**Immediate actions:**
- Add `/privacy` and `/terms` pages on baloney.app
- The random UUID is a persistent identifier — GDPR treats this as personal data. Make it regeneratable (clear local storage = new identity).
- Community sharing is opt-in off by default — correct. Prominently disclose this in onboarding.

---

## Ethical Concerns

AI detection is high-stakes. These concerns are real, not hypothetical.

### 1. False Positives on Human Content

Current text accuracy is 67.3% with 97% specificity — meaning ~3% of human content gets falsely flagged. At 10,000 users doing 50 text scans/day = ~15,000 false positives per day.

**Specific risk:** Non-native English speakers write in patterns that AI detectors consistently misclassify. Academic studies show significantly higher false positive rates on ESL writing. If teachers use Baloney as evidence of academic dishonesty, false positives cause real harm.

**Mitigations:**
- Frame all verdicts as probability, never certainty ("likely AI-assisted" not "confirmed AI-generated")
- Show confidence intervals prominently
- Explicitly disclaim in UI and docs that results must not be used as sole evidence in consequential decisions
- Test and publish accuracy specifically on ESL text
- Add a "I wrote this" reporting button for calibration

### 2. The Arms Race Problem

Pangram's 99.85% and SightEngine's 98.3% accuracy are benchmarks against today's models. As generators improve, these numbers will decline without continuous retraining by the API providers.

**Mitigations:**
- Do not advertise static accuracy numbers in marketing — link to a live benchmark page
- Build a scheduled evaluation pipeline against new model outputs
- SynthID watermark detection is more durable (cryptographic signal, not stylometric) — lean into this

### 3. Adversarial Use of the Detection Pipeline

The "why this is AI" signal breakdown in the UI tells bad actors exactly which signals to evade. The Slop Index data could be used to calibrate AI content to avoid detection.

**Mitigations:**
- Rate-limit access to community analytics
- Consider removing or abstracting the per-signal breakdown from the public-facing UI
- The content hash system partially mitigates this — re-posting identical detected content is flagged immediately

### 4. Profiling and Surveillance

If someone's content is consistently flagged as AI-generated, their reputation could be harmed through aggregated community data.

**Mitigations:**
- Community data is aggregated by platform, not by creator (never build creator-level analytics)
- SHA-256 hashes are one-way — content cannot be reconstructed
- Write this explicitly into the Privacy Policy and Terms of Service

### 5. Weaponization for Harassment

The extension could be used to "call out" content creators in harassment campaigns ("the AI detector confirmed this is fake").

**Mitigations:**
- UI language matters enormously — maintain uncertainty framing everywhere
- Add Terms of Service prohibiting use of results to harass individuals
- Consider a report/dispute mechanism for content creators

---

## Known Bugs & Technical Debt

### Bug 1 — Detection Config Desync (Medium priority)
**Location:** `extension/content.js`, `extension/sidepanel.js`
**Issue:** Color thresholds hardcoded in the extension (`0.65` high, `0.35` medium) rather than sourced from `frontend/src/lib/detection-config.ts`. ~40 TODOs mark these locations. If thresholds change in the frontend, the extension shows inconsistent colors.
**Fix:** Expose config via an API route; extension fetches on startup. Or create a shared config JSON file.

### Bug 2 — Service Worker State Loss (Medium priority)
**Location:** `extension/background.js`
**Issue:** MV3 service workers terminate after 5 minutes of inactivity. In-memory state (ongoing scan queues, rate limit counters) is lost silently. A scan initiated just before worker death will fail without user feedback.
**Fix:** Move all mutable state to `chrome.storage.session`. Add scan job recovery on worker startup.

### Bug 3 — DOM Selector Fragility (Medium-High priority)
**Location:** `extension/content.js`
**Issue:** Platform-specific DOM selectors break when X, Instagram, Reddit, TikTok, YouTube update their UI. This is an ongoing maintenance burden.
**Fix:** Platform detection layer with versioned selectors. Error reporting when selectors fail to match — you need to know when a platform update breaks detection.

### Bug 4 — Statistical Fallback Not Disclosed to User (High priority — ethical)
**Location:** `frontend/src/lib/real-detectors.ts`, extension UI
**Issue:** When Pangram is rate-limited (which happens after 4 calls/day on free tier), the 67.3%-accurate statistical fallback runs silently. Users think they're getting 99.85% accuracy when they're getting 67.3%.
**Fix:** Add a detection method indicator in both the extension and dashboard. This is an ethical requirement, not just a UX improvement.

### Bug 5 — Seed Endpoint Active in Production (High priority — security)
**Location:** `frontend/src/app/api/seed/route.ts`
**Issue:** Endpoint generating 500 synthetic scan records is live. If the `SEED_SECRET` leaks, the database can be flooded with fake data.
**Fix:** Add `if (process.env.NODE_ENV === 'production') return 405`. Remove entirely before public launch.

### Bug 6 — Reality Defender Integration Commented Out (Low priority)
**Location:** `frontend/src/lib/real-detectors.ts`
**Issue:** Dead code for deepfake escalation pipeline on ambiguous image scores (0.4–0.7 range).
**Fix:** Complete integration or delete dead code.

### Bug 7 — Video Detection Timeout Handling (Medium priority)
**Location:** `frontend/src/app/api/detect/video/route.ts`
**Issue:** SightEngine's synchronous video endpoint has a 60s limit. Large files or slow connections silently timeout with no user feedback.
**Fix:** Explicit timeout handling with user-facing error state. Consider async job queue for long videos.

---

## Payment Architecture for Monetization

### Option A: Freemium SaaS (Stripe + Supabase)

**Flow:** Stripe Checkout → Webhook → Supabase plan tier column → API middleware enforces limits

**Suggested tiers:**
| Tier | Price | Scans/Month |
|------|-------|-------------|
| Free | $0 | 100 |
| Individual | $5/month | 1,000 |
| Pro | $15/month | 10,000 + API access |
| Team | $49/month | 50,000 + team dashboard |

**Implementation effort:** 2–3 weeks. Stripe Checkout, webhook handler in Next.js, rate limit middleware.
**Key dependency:** You need Pangram enterprise pricing before setting your own plan prices. Do not launch paid tiers before this.

### Option B: B2B API (Stripe Metered Billing + API Keys)

Sell detection-as-a-service to media companies, trust & safety teams, advertisers, academic researchers.

**Pricing model:** $0.01–$0.05 per detection call depending on modality. This covers API costs plus margin at volume.
**Implementation:** API key generation (Unkey.dev or custom), Stripe Metered Billing, per-key rate limits.
**Why this is the better path early:** B2B customers have predictable volume, can be contracted with SLAs, and can support higher per-call pricing than consumers will accept.

### Option C: Data Licensing (AI Slop Index)

License aggregate platform-level AI prevalence data to media companies, academic researchers, brand safety platforms.

**Pricing:** Annual licenses at $5,000–$50,000/year depending on scope.
**Requirement:** Statistically meaningful data per platform before the product has commercial value. Need thousands of scans per platform first.

---

## Deployment Options: Business vs Open Source vs Both

### Option 1: Closed-Source SaaS

**Pros:** Full control, full revenue from all tiers, community data is proprietary moat.
**Cons:** High API costs require significant revenue before profitability. Privacy-sensitive use case (browser extension reading browsing activity) faces trust deficit without code transparency. Crowded market.
**Feasibility:** Moderate. B2B API and enterprise sales are the viable paths; consumer subscriptions alone will not cover API costs.

---

### Option 2: Fully Open Source

**Pros:** Maximum trust for privacy-sensitive use case, community contributions, academic credibility.
**Cons:** Cannot open-source API keys. Community data flywheel breaks if everyone self-hosts. No revenue to cover your API costs. Evasion becomes easier.

**What can be safely open-sourced:**
- Chrome extension
- Next.js frontend
- Statistical fallback detectors (no API dependency)
- Supabase schema and migrations
- Evaluation methodology and benchmark dataset

**What cannot be open-sourced:**
- API keys (obviously)
- Proprietary ensemble weights (if these are a competitive moat)

**Feasibility:** High for partial open-source. Users bring their own API keys — common model for open-source AI tools.

---

### Option 3: Open Core (Recommended)

```
Open Source (MIT):
├── Chrome Extension
├── Next.js Dashboard (UI/UX)
├── Statistical fallback detectors
├── Supabase schema
└── Evaluation methodology / benchmark dataset

Hosted SaaS (proprietary):
├── Managed Pangram + SightEngine + SynthID API access
├── AI Slop Index (community aggregate data)
├── Content provenance network (crowd-sourced verdicts)
└── B2B API with SLA
```

**Why this works:** Open source builds trust for a browser extension that reads your browsing. The hosted SaaS provides the value that self-hosters cannot replicate: community network effects (the Slop Index requires centralized aggregation) and managed API access (removing the friction of obtaining Pangram/SightEngine keys).

**Comparable models:** uBlock Origin (open) + Ghostery (commercial). Plausible Analytics (open source + hosted SaaS). VS Code (open) + GitHub Copilot (paid).

**Feasibility: High. This is the recommended path.**

---

## Production Readiness: MVP → Production Gap Analysis

### Critical Blockers (must fix before any public launch)

| Gap | Effort |
|-----|--------|
| No privacy policy — Chrome Store will reject without one | 2–3 days |
| No rate limiting on API routes — trivial to abuse/bankrupt the API budget | 3–5 days |
| Mac Studio backend is a personal machine — single point of failure | 1–2 weeks |
| `/api/seed` endpoint active in production | 1 day |
| Statistical fallback runs silently when Pangram is rate-limited | 2–3 days |

### High Priority (first month post-launch)

| Gap | Effort |
|-----|--------|
| No authentication system (UUID only) | 2–3 weeks |
| No error monitoring (Sentry) | 3–5 days |
| No CI/CD pipeline | 1 week |
| SynthID Railway backend on free tier | 2–3 days |
| No end-to-end or unit tests | 2–4 weeks |
| Extension service worker crash recovery incomplete | 1–2 weeks |
| No Terms of Service | 2–3 days |

### Medium Priority (months 2–3)

| Gap | Effort |
|-----|--------|
| GDPR compliance (right to erasure, consent flows) | 2–3 weeks |
| DOM selector fragility and versioning | Ongoing |
| Database indexing strategy (no indexes defined currently) | 3–5 days |
| Load testing | 3–5 days |
| Staging environment | 3–5 days |
| Input sanitization on text detection endpoint | 2–3 days |

---

## Scaling Feasibility Assessment

### Technical Scalability

| Component | Scalability | Risk |
|-----------|------------|------|
| Next.js on Vercel | Excellent — auto-scales | Low |
| Supabase Postgres | Good — add indexes, shard at 10M+ rows | Medium |
| SynthID text backend (Railway) | Poor — free tier GPU, not production-ready | High |
| Pangram API | Unknown — volume pricing not public | High |
| SightEngine API | Good — clear paid tiers with overage pricing | Medium |
| Chrome Extension | Good — MV3 architecture is solid | Medium (DOM fragility) |

**Primary constraint is API rate limits and cost, not infrastructure.**

### Market Scalability

| Milestone | Feasibility | Requirements |
|-----------|------------|-------------|
| 10,000 users (6 months) | Realistic | Good ProductHunt/HN launch, Chrome Store listing |
| 100,000 users (12–18 months) | Requires effort | Press coverage, institutional partnerships, Slop Index press |
| 1,000,000 users (2–3 years) | Requires proprietary models | Cannot run on third-party APIs at this cost; need own ML models |

### Competitive Landscape

| Competitor | Strength | Baloney Differentiator |
|------------|----------|----------------------|
| GPTZero | Brand, education focus | Passive browsing detection, community data |
| Copyleaks | Enterprise relationships | Real-time browsing, multi-modal |
| Originality.ai | SEO content focus | Extension-native, no upload friction |
| Winston AI | Document UX | Broader use case, community Slop Index |
| Turnitin | Institutional lock-in | Consumer + B2B focus |

**Genuine moat:** No competitor does passive real-time detection during normal browsing at this quality. The AI Slop Index as a crowd-sourced platform accountability metric is novel and has genuine public interest value.

**Long-term risk:** If OpenAI, Google, and Meta embed C2PA provenance natively in generated content, watermark detection becomes table stakes. The statistical detection ensemble and community data network remain valuable regardless.

---

## Recommended Roadmap

### Phase 0 — Legal & Infrastructure (Weeks 1–2)
- [ ] Write and publish Privacy Policy at `baloney.app/privacy`
- [ ] Write and publish Terms of Service at `baloney.app/terms`
- [ ] Disable `/api/seed` endpoint in production (`NODE_ENV` guard)
- [ ] Add IP-based rate limiting to all `/api/detect/*` routes
- [ ] Move Mac Studio backend to cloud (Railway, Render, or Fly.io)
- [ ] Set up Sentry error monitoring
- [ ] Set up GitHub Actions CI (lint + type-check on PR)

### Phase 1 — Chrome Web Store (Weeks 2–4)
- [ ] Complete developer account and two-step verification
- [ ] Write store listing with screenshots and permissions justification
- [ ] Fix detection config desync (40+ hardcoded threshold TODOs)
- [ ] Add detection method indicator to extension UI ("using statistical fallback")
- [ ] Submit extension for review

### Phase 2 — Authentication (Weeks 3–6)
- [ ] Integrate Supabase Auth (email magic link + Google OAuth)
- [ ] Migrate UUID tracking to authenticated sessions (anonymous fallback for privacy-first users)
- [ ] Build "delete my data" flow (GDPR right to erasure)
- [ ] User settings page: sharing preferences, scan history, data export

### Phase 3 — Stability (Months 2–3)
- [ ] End-to-end tests (Playwright) for core detection flows
- [ ] Unit tests for detection pipeline logic
- [ ] Load testing against API routes
- [ ] Platform DOM selector versioning system
- [ ] SynthID backend: dedicated GPU instance
- [ ] Database indexing audit

### Phase 4 — Monetization (Month 3–4)
- [ ] Contact Pangram for enterprise API pricing (long sales cycle — start early)
- [ ] Stripe Checkout for individual/pro plans
- [ ] B2B API with key management and metered billing
- [ ] Beta B2B customers: newsrooms, brand safety teams, academic labs

### Phase 5 — Open Core (Month 4–6)
- [ ] Publish extension + frontend + statistical detectors under MIT
- [ ] Developer docs for self-hosting
- [ ] Submit evaluation methodology to arXiv
- [ ] Publish AI Slop Index as weekly public metric
- [ ] Evaluate YC or similar if pursuing venture scale

---

## Summary

| Question | Answer |
|----------|--------|
| **Can this be a business?** | Yes. B2B API and enterprise data licensing are the viable paths. Consumer subscriptions alone won't cover API costs at scale. |
| **Can this be open source?** | Yes, partially. Extension, frontend, and statistical detectors are safe to open-source. Managed API access and community data are the proprietary value. |
| **Should we do both?** | **Yes — open core is recommended.** Builds trust for a privacy-sensitive browser extension, enables community contributions, keeps the community data network as the SaaS moat. |
| **Is the MVP production-ready?** | No. Critical gaps: no privacy policy, no rate limiting, Mac Studio backend is a personal machine. ~4–6 weeks of focused work to reach launch baseline. |
| **What's the biggest risk?** | API cost structure. At 10k users the monthly API bill is $3,400–$6,100. Need either strong monetization or proprietary models before this scale. |
| **What's the biggest opportunity?** | The AI Slop Index. An independent, crowd-sourced, platform-level AI content accountability metric has no real competitor and genuine public interest value. Build and publish this aggressively. |
