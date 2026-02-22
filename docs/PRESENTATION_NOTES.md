# Baloney — Presentation Notes (MadData26)

## 5-Minute Presentation Outline

| Time | Section | Key Message |
|------|---------|-------------|
| 0:00-0:30 | Hook | "Ever been fooled by AI?" |
| 0:30-1:30 | The Problem | AI content is everywhere, trust is eroding |
| 1:30-3:00 | Live Demo | Show extension + dashboard in action |
| 3:00-4:00 | How It Works | Multi-model ensemble, Bayesian stats |
| 4:00-4:30 | What Makes Us Different | 6 differentiators |
| 4:30-5:00 | What's Next + Close | SaaS vision, call to action |

---

## Talking Points Per Section

### The Hook (30s)
- "Raise your hand if you've shared something online this week without checking if it was AI-generated"
- The cost of verifying truth now exceeds the cost of producing lies
- Frame as "information hygiene" — like hand-washing for the digital age

### The Problem (60s)
- [PLACEHOLDER: Mnookin email deepfake incident — user to fill in details]
- [PLACEHOLDER: neetcode tweet about AI-generated coding content — user to provide text]
- AI content has gone from novelty to default — harder to distinguish, easier to produce
- The average person encounters 50+ pieces of AI content per day without knowing
- No existing tool handles text + images + video in one package, in the browser, for free

### Live Demo Script (90s)

1. **Extension on X/Twitter**: Open a page with images and text posts
2. **Detection dots**: Point out colored dots appearing on images (auto-scanned)
3. **Hover a dot**: Show "78% AI" tooltip expanding on hover
4. **Click dot**: Sidepanel opens with full analysis (verdict, confidence, reasoning)
5. **Text selection**: Highlight a text post → "Scan with Baloney" popup appears
6. **Insight popup**: Show WHY explanations — "Sentence lengths are very uniform, typical of AI writing"
7. **Colored underlines**: Grammarly-style underlines appear on scanned text
8. **Content modes**: Toggle to Blur mode → AI content blurs with "Click to Reveal" overlay
9. **Analyze page**: Paste text → full detection breakdown (trust score gauge, sentence heatmap, score breakdown)
10. **Dashboard**: Show real-time stats updating, AI Rate by Site chart
11. **AI Slop Index**: Platform report cards with letter grades (A+ through F)
12. **Information Diet Score**: Personal gamification — "Vigilant" level with 462 points

### Technical Depth (60s)
- **Text detection**: 4-method weighted ensemble
  - RoBERTa (OpenAI detector) — 50% weight, the industry standard
  - MiniLM sentence embeddings — 20% weight, catches semantic patterns
  - Statistical features (burstiness, TTR, perplexity) — 30% weight, model-agnostic
- **Image detection**: 4-signal pipeline
  - ViT AI-image-detector — 55% weight
  - SDXL-detector — secondary signal for diffusion models
  - FFT/DCT frequency analysis — 25% weight, catches GAN artifacts
  - EXIF metadata analysis — 20% weight, checks for missing camera data
- **Bayesian posterior adjustment**: Don't just trust the model — weight by prior accuracy
- **60% confidence floor**: Below threshold → "inconclusive" (minimize false positives)
- **Content provenance**: SHA-256 hashing tracks content across platforms

### What Makes Us Different (30s)
1. **Multi-modal ensemble** — not one model, 3-4 methods per modality
2. **Selection-based UX** — intentional detection, not passive surveillance
3. **Content Provenance** — SHA-256 crowd-sourced truth across platforms
4. **Information Diet Score** — gamification of AI awareness (unique concept)
5. **AI Slop Index** — platform report cards nobody else provides
6. **Open architecture** — real HuggingFace models with graceful fallback

### What's Next + Close (30s)
- SaaS platform for publishers and newsrooms
- API for developers to integrate detection
- Enterprise dashboard for organizations
- More models, more modalities (audio detection)
- "We're making truth accessible — one scan at a time"

---

## Demo Recovery Plan

| Problem | Recovery |
|---------|----------|
| Extension not loading | Use Analyze page directly (works independently) |
| API slow/down | Feed page has curated ground-truth fallback data |
| Dashboard empty | Seed endpoint creates 535 demo scans instantly |
| Sidepanel not opening | Falls back to new tab with full analysis |
| HuggingFace rate limited | Mock detectors activate automatically with realistic outputs |

---

## Quotes & References

- [PLACEHOLDER: Mnookin email quote — user to provide]
- [PLACEHOLDER: neetcode tweet text — user to provide]
- "The cost of verifying truth now exceeds the cost of producing lies"
- "Information hygiene — like hand-washing for the digital age"
- "We don't tell you what to think — we give you the tools to decide for yourself"

---

## Competitor Landscape

| Tool | Modalities | Browser Extension | Free | Crowd-Sourced | Gamification |
|------|-----------|-------------------|------|---------------|-------------|
| GPTZero | Text only | No | Freemium | No | No |
| Originality.ai | Text | No | Paid per check | No | No |
| Hive Moderation | Text + Image | No (API) | Enterprise | No | No |
| **Baloney** | **Text + Image + Video** | **Yes** | **Yes** | **Yes (Provenance)** | **Yes (Diet Score)** |

---

## Hackathon Scoring Considerations

- **Innovation**: Content Provenance + Information Diet Score are novel concepts
- **Technical complexity**: Multi-model ensemble with Bayesian weighting, 17 API routes, 7 tables, 11 views
- **Completeness**: Full stack — extension + web app + API + database + real ML models
- **Presentation**: Live demo with real detection on real websites
- **Impact**: Addresses real societal problem (AI misinformation at scale)

---

## Audience-Specific Angles

**For technical judges**: Emphasize the ensemble approach, Bayesian stats, SHA-256 provenance
**For business judges**: Emphasize the SaaS opportunity, API monetization, market gap
**For design judges**: Show the warm Baloney theme, detection dots UX, Grammarly-style underlines
**For impact judges**: Frame as digital literacy tool, information hygiene, trust infrastructure
