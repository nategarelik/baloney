# Baloney Evaluation Pipeline — Pragmatic Plan

## Context

MadData26 hackathon needs "big data" + statistical rigor. Current test suite: 31 text + 6 image samples (insufficient). Goal: evaluate detection accuracy on thousands of unseen samples, show honest results with confidence intervals, and present on the product page + dashboard. Budget: under $50. Hardware: 1x RTX 5080, 1x Mac Mini.

**The pitch:** "We evaluated our detection on 5,000+ unseen samples from established benchmarks AND fresh SOTA models. Here's what works, what doesn't, and what real-world accuracy actually looks like — with proper confidence intervals."

**Key strategic choice:** Use existing public datasets for scale. Generate a small fresh batch from SOTA fast models for the "unseen modern models" claim. Don't over-invest in custom dataset creation. Be honest about limitations — that's better data science than inflated accuracy.

---

## Dataset Plan

### Text (~4,000-5,000 samples total)

**RAID benchmark — instant download, free, 8M+ rows:**
- Source: `huggingface.co/datasets/liamdugan/raid`
- Pull stratified subset: 500 per model × 6 models (GPT-3, GPT-4, Llama 2, Cohere, Mistral, MPT) = 3,000 samples
- Include adversarial variants (paraphrased, backtranslated) — tests robustness
- Include varied domains: Reddit posts, news, recipes, poetry (tests domain sensitivity)
- Include SHORT text samples — deliberately stress-test the known weakness
- **Unseen verification:** RoBERTa trained on GPT-2 (2019). ChatGPT-detector trained on HC3 ChatGPT. So GPT-3/4/Llama/Cohere/Mistral/MPT outputs are genuinely unseen.

**Fresh SOTA fast models — 30 min on Mac Mini:**
- 200 from Gemini 2.5 Flash (free student plan) — tweets + Reddit-style
- 200 from Haiku 4.5 (free student plan) — tweets + LinkedIn-style
- 200 from GPT-5-mini or GPT-5-nano (cheap API, ~$1) — tweets + Reddit
- 50 from Sonnet 4.6 / GPT-5.2 (small sample of thinking models — less common but included for completeness)
- Prompts: mimic bot patterns — engagement replies, news rephrasing, hot takes
- Vary text length deliberately: 50% short (< 280 chars), 30% medium (280-800 chars), 20% long (800+ chars)
- **These didn't exist when ANY detector was trained — unchallengeable "unseen" claim**

**Human baseline: ~1,000 samples**
- RAID already includes human-written text (labeled)
- Supplement with 200-300 known human samples if needed

**Total: ~4,500-5,500 text samples**

### Images (~2,000-3,000 samples total)

**Use public datasets — don't generate custom:**
- **CIFAKE** (HuggingFace): 120k images (60k real + 60k SD 1.4). Pull 2,000 sample subset.
- **Sora frames**: `LLinked/sora-watermark-dataset` — Sora-generated video frames. Pull 500.
- OR search HuggingFace for a more recent AI image detection dataset with Flux/DALL-E 3/Midjourney labels (check what's available at download time)
- Human baseline included in CIFAKE (real photos)

**Total: ~2,000-3,000 image samples**

### Video

- Use Sora watermark dataset frames if available
- Otherwise, skip video-specific evaluation — acknowledge as limitation
- The landscape doc already documents that single-frame video detection is fundamentally limited

---

## Evaluation Approach

### Run locally on 5080 (avoids HuggingFace API rate limits)

Download and run the same models Baloney uses in production:
- `openai-community/roberta-base-openai-detector` (~500MB) — Method A
- `Hello-SimpleAI/chatgpt-detector-roberta` (~500MB) — Method C
- `sentence-transformers/all-MiniLM-L6-v2` (~80MB) — Method B
- Methods D statistical features — already local, port to Python
- `umm-maybe/AI-image-detector` (~350MB) — Method E
- `Organika/sdxl-detector` (~350MB) — Method E2
- Methods F, G (frequency + metadata) — already local, port to Python

All models fit in < 4GB VRAM. 5080 handles easily. Batch process ~5,000 text + ~2,500 images in ~1-2 hours.

### Optional comparison baselines (subset of 500 samples)
- **SightEngine** ($29/mo) — commercial image detection baseline
- **Treql** (free) — claims 99.2%, verify independently
- **Pangram** ($12.50/mo, 600 scans) — commercial text detection baseline (shows gap between open-source and SOTA)

**Cost: $0-42 depending on which baselines to include**

### Cross-validation
- Run 100 samples through Vercel production API to confirm local inference matches

---

## Statistical Analysis

### Core metrics (all with 95% bootstrap CI, 10,000 iterations)
- Accuracy, Precision, Recall, F1, AUROC
- Per-generator breakdown: which AI models get caught vs. which fool the detector
- Per-text-length breakdown: accuracy at < 100 chars, 100-280 chars, 280-800 chars, 800+ chars

### Key analyses

**1. Self-reported vs. observed accuracy**
"RoBERTa claims 94.2% on its test set. On RAID unseen data, we measured X% (95% CI: [lower, upper])."
"On SOTA Feb 2026 models, we measured Y% (95% CI: [lower, upper])."

**2. Text length degradation curve**
Plot accuracy vs. text length (word count). Show exactly where detection falls off. This HONESTLY demonstrates the limitation and explains why Baloney shows lower confidence on short text. Industry standards (Turnitin: 300 words, GPTZero: 200+) exist for a reason.

**3. Bayesian PPV — "in the wild" accuracy**
Formula: `PPV = (sensitivity × prevalence) / (sensitivity × prevalence + (1 - specificity) × (1 - prevalence))`

Using real base rates:
- X/Twitter: ~66% automated content
- General social media: ~20-40% AI-assisted
- Curated feeds: ~5%

This shows that even with good accuracy, low base rates mean many false positives. And high base rates (Twitter) make detectors more useful than raw accuracy suggests.

**4. Method contribution analysis**
Isolate each method (A, C, B, D) and show individual vs. ensemble accuracy. Demonstrates that the ensemble approach adds value over any single model.

**5. Adversarial robustness (RAID has this built in)**
Compare accuracy on clean text vs. paraphrased vs. backtranslated. Shows which attacks defeat the detector.

### Sample size justification
- 3,000 RAID samples: 95% CI width of ±1.8% on accuracy
- 500 per generator: 95% CI width of ±4.4%
- 650 fresh SOTA samples: 95% CI width of ±3.8%
- All well above the n=385 minimum for ±5% CI at 95% confidence

---

## Dashboard & Product Page

### Product page (`frontend/src/app/product/page.tsx` — currently empty)
- "How It Works" — explain multi-signal ensemble
- "Our Evaluation" — methodology, dataset, key findings
- "Accuracy In The Wild" — Bayesian PPV explainer
- Show honest limitations alongside strengths

### Dashboard integration
- Evaluation accuracy chart with CI error bars (Recharts `<ErrorBar>` or `<Area>` for bands)
- Hover shows exact CI values in tooltip
- Per-generator accuracy heatmap
- Text length degradation curve
- Bayesian PPV interactive widget (base rate slider → PPV output)
- % of community content flagged as AI (existing data from Supabase scans)
- Transparency: show exactly how every number was calculated

### Data flow
- Python evaluation scripts → `frontend/src/data/evaluation-results.json`
- Dashboard components import static JSON
- Recharts visualizations with CI bands and hover details

---

## Implementation Phases

### Phase 1: Dataset (1 hour)
- Download RAID subset from HuggingFace (Python script)
- Generate 650 fresh SOTA text on Mac Mini (Gemini 2.5 Flash, Haiku 4.5, GPT-5-mini)
- Download CIFAKE image subset from HuggingFace
- Save all as labeled JSON

### Phase 2: Evaluation (1-1.5 hours)
- Install transformers + torch on 5080
- Batch run all text methods on full text dataset
- Batch run all image methods on full image dataset
- (Optional) Run 500 through SightEngine/Treql/Pangram

### Phase 3: Analysis (1 hour)
- Bootstrap CIs for all metrics (scipy + sklearn)
- Per-generator breakdown, text length curve, Bayesian PPV
- Self-reported vs. observed comparison
- Export to evaluation-results.json

### Phase 4: Dashboard + Product Page (1.5 hours)
- Build product page with evaluation methodology and results
- Add evaluation charts to dashboard with CI bands
- Bayesian PPV widget
- Claims vs. reality table

### Phase 5: Docs (15 min)
- Update `docs/AI_CITATION.md`
- Update `CLAUDE.md` with evaluation section

**Total: ~5-6 hours**

---

## Files to Create/Modify

**New Python scripts:**
- `evaluation/download_datasets.py`
- `evaluation/generate_fresh_text.py`
- `evaluation/run_evaluation.py`
- `evaluation/analyze.py`
- `evaluation/data/` (output directory)

**New frontend files:**
- `frontend/src/data/evaluation-results.json`
- `frontend/src/app/dashboard/EvaluationAccuracyChart.tsx`
- `frontend/src/app/dashboard/BayesianPPVWidget.tsx`
- `frontend/src/app/dashboard/CalibrationPlot.tsx`

**Modified:**
- `frontend/src/app/product/page.tsx` — rewrite with evaluation content
- `frontend/src/app/dashboard/page.tsx` — add evaluation section
- `docs/AI_CITATION.md` — evaluation pipeline disclosure
- `CLAUDE.md` — evaluation section

**Existing to reference:**
- `frontend/src/lib/real-detectors.ts` — detection logic to replicate locally
- `frontend/src/lib/constants.ts` — chart colors (CHART_COLORS, CHART_TOOLTIP_STYLE)
- `frontend/src/app/dashboard/AiRateBySiteChart.tsx` — existing Recharts patterns
- `frontend/src/__tests__/analysis-system.test.ts` — existing test methodology

---

## Verification
1. Local inference results match 100-sample cross-check against Vercel API
2. Bootstrap CIs converge (1k vs 10k iterations produce similar bounds)
3. Human samples classified as human at > 90% rate (sanity check)
4. `cd frontend && npx tsc --noEmit && npm run build` passes
5. Dashboard charts render with real evaluation data
