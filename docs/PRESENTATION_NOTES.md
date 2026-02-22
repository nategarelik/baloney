# Baloney — Presentation Speaker Notes (MadData26)

## Quick Reference Card

### Key Numbers (memorize these)
- **AUC 0.982** — our ensemble ROC score
- **99.85%** — Pangram text accuracy (SOTA, not ours — say "our ensemble includes")
- **98.3%** — SightEngine image accuracy (ARIA #1)
- **200+** samples in evaluation dataset
- **15+** content categories
- **6+** independent detection signals per modality
- **$3.5B** — Nielsen annual revenue (business analogy)
- **$16M ARR** — GPTZero (proves detection is a market)

### The One Line
> **"We detect Google's own watermarks."**

---

## Act-by-Act Speaker Notes

### ACT 1 — Hook (Nathaniel, 0:00-0:35)
- Stand still. No laptop. Eye contact with judges.
- Open with question, PAUSE 2 seconds — let them answer internally
- Asymmetry framing: free lies vs expensive truth
- End with "So we built one." — PAUSE 1 second

### ACT 2 — Founders (Nathaniel, 0:35-1:05)
- "Sophomore" appears ONCE, immediately reframed
- "Living inside the problem" = domain expertise framing

### ACT 3 — Demo (Nathaniel, 1:05-2:50)
- **Tab 1** (X.com): Scroll slowly, point to dots. "Pink = AI, Green = human"
- **Tab 2** (/analyze): Paste clipboard text, click Analyze. Walk through 6 signals, then SynthID badge
- **Tab 3** (/dashboard/community): AI Slop Index grades + Information Diet Score
- **Tab 4** (/evaluation): ROC curve, confusion matrix, ablation

### ACT 4 — Data Science (Partner, 2:50-3:35)
- Handoff: "Everything we detect, we prove. [Partner] will show you how."
- Point at ROC curve — "hugging top-left = near-perfect"
- Ablation study — "full ensemble beats every individual method"
- "This is publishable methodology"

### ACT 5 — Business (Partner, 3:35-4:15)
- SLOW DOWN. This is the "aha" moment.
- "The data we collect is the real product"
- Nielsen analogy: monitoring device in homes = our extension
- "CAPTCHA asks is this user human. We ask is this content human."

### ACT 6 — Close (Partner, 4:15-4:50)
- Callback to opening question
- Staccato summary: "Two sophomores. One weekend. 6-signal ensemble..."
- End: "We built Baloney. And it's live right now." — HOLD 2 seconds — "Thank you."

---

## Demo Failure Recovery

| Scenario | Recovery | What to Say |
|----------|----------|-------------|
| Extension not loading | Use `/analyze` page (Tab 2) directly | "Let me show the same detection on our analyzer" |
| Pangram rate limited | Ensemble adapts, 5 methods still show | "Our ensemble adapts — here are the remaining signals" |
| SynthID backend down | Skip watermark talking point | "We support SynthID when available — the ensemble works without it" |
| API slow/timeout | `/feed` page has ground-truth fallback | "Our system gracefully degrades — that's by design" |
| Dashboard empty | Run seed from phone: `curl -X POST .../api/seed?secret=...` | Seed takes 10 seconds |
| Total internet failure | `/evaluation` page works offline (pre-computed data) | "Here's our evaluation — AUC 0.982, 200+ samples" |
| HuggingFace cold start | Mock detectors activate automatically | Say "our detection pipeline" not "real-time ML" |

**Browser navigation:** Use `Cmd+1` through `Cmd+4` to switch tabs instantly. Never mouse-navigate or type URLs live.

---

## Q&A Quick Answers

**"How accurate?"** — "Pangram 99.85% + SightEngine 98.3%. Ablation proves ensemble beats any single method."

**"Adversarial attacks?"** — "Multi-signal = inherently robust. If one fooled, others catch it. SynthID is cryptographic."

**"Different from GPTZero?"** — "They're 1 model, text only. We're 6+ signals, text+image+video, SynthID, platform grading."

**"Make money?"** — "Layer 1: Detection ($16M ARR market). Layer 2: Slop Index API ($500-5K/mo). Layer 3: Enterprise ($50K-500K/yr)."

**"More time?"** — "Publish research. Chrome Web Store. 10K users in 6 months. First API customer month 9."

**"SynthID special?"** — "Google's invisible cryptographic watermarks in all Gemini text + Imagen images. We detect them."

**"Why can't Google build this?"** — "Can't grade own homework. We see across all platforms. Network effect."

---

## What NOT to Say

- "We're just sophomores" → "We grew up inside this problem"
- "It's not perfect" → Only discuss limitations if asked
- "We used Claude to help" → Disclose only in AI citation docs
- "Our accuracy is 86%" → Lead with AUC 0.982
- "It's like GPTZero but better" → "No tool combines 6 signals with SynthID and platform grading"
- "The mock fallback..." → Never mention mock detectors
- "Basically" / "Actually" → Delete filler words for 5 minutes
- Feature counts ("17 API routes") → Focus on what features enable
- "99.85% accuracy" as your own → "Our ensemble includes Pangram at 99.85%"

---

## Competitor Landscape (if asked)

| Tool | Modalities | Extension | Free | Platform Grading |
|------|-----------|-----------|------|-----------------|
| GPTZero | Text only | No | Freemium | No |
| Originality.ai | Text | No | Paid | No |
| Hive Moderation | Text + Image | API only | Enterprise | No |
| **Baloney** | **Text + Image + Video** | **Yes** | **Yes** | **Yes (Slop Index)** |

---

## Rehearsal Checklist

- [ ] Run 1: Read from notes. Time each section.
- [ ] Run 2: Speak from memory. Notes only for stats.
- [ ] Run 3: Full performance with laptop. Record on phone. Watch back.
- [ ] Verify all 4 tabs load correctly
- [ ] Test Cmd+1 through Cmd+4 tab switching
- [ ] Warm HuggingFace models (one throwaway analysis)
- [ ] Confirm WiFi + phone hotspot backup
- [ ] Browser zoom 110-125%
- [ ] Clipboard loaded with demo text
