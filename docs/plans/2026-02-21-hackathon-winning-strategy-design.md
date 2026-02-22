# Baloney Hackathon Winning Strategy — Design Document
## MadData26 | Feb 21-22, 2026 | General Track

---

## Problem Statement

Baloney is a strong product with excellent social impact framing and a polished Chrome extension. However, the **Data Methods** judging criterion is underdeveloped: all detection models are off-the-shelf HuggingFace models with no custom training, limited evaluation, and 86.7% text / 83.3% image accuracy on small test sets.

## Vision

The internet was built as the ultimate information source. AI-generated content is eroding that foundation with no regulatory framework. Baloney gives individuals the power to see through disinformation and take control of their information diet.

## Strategy: Evaluation-Heavy Hybrid

Fine-tune a custom text detection model on established datasets, build a rigorous evaluation pipeline with publication-quality artifacts, then polish the product and craft a compelling presentation.

## Judging Criteria Coverage

| Criteria | Current | Target | How |
|----------|---------|--------|-----|
| **Presentation & Technique** | 7/10 | 9/10 | Polished demo + tight narrative + backup video |
| **Social Impact** | 8/10 | 9/10 | Frame as anti-disinformation tool, Information Diet, regulatory angle |
| **Data Methods** | 6/10 | 9/10 | Custom fine-tuned model, rigorous evaluation, benchmark comparisons |

## Phase 1: Model Training & Evaluation (Hours 1-5)

### 1a. Dataset Acquisition (30 min)
- HC3 dataset (26K human + 26K ChatGPT, 5 domains)
- RAID benchmark subset (11 LLMs, 11 domains)
- Curated test set of 200+ samples across content types

### 1b. Fine-Tune Custom Model (2 hours)
- Base: `roberta-base` or `distilbert-base-uncased`
- Training on HC3 with MPS acceleration on M4 Max (64GB)
- Hyperparameters: lr=2e-5, batch_size=16, epochs=3-5, warmup=0.1
- Save best checkpoint by validation F1

### 1c. Evaluation Pipeline (1.5 hours)
- ROC curves with AUC scores
- Precision-Recall curves at multiple thresholds
- Confusion matrices (overall + per-domain)
- Ablation study: each detection method's contribution
- Benchmark comparison vs GPTZero/Originality (from published numbers)
- Calibration plot (predicted probability vs actual frequency)
- Cross-domain evaluation (news, social, academic, creative)
- Statistical significance tests (McNemar's test, bootstrap CIs)

### 1d. Evaluation Artifacts (30 min)
- Generate matplotlib/seaborn charts for presentation
- Export as PNGs for slides
- Summary statistics table

## Phase 2: Deployment & Integration (Hours 5-7)

### 2a. Railway Backend
- Deploy fine-tuned model to Railway
- Set up inference endpoint with proper error handling
- Fallback chain: Railway custom model -> HuggingFace ensemble -> mock

### 2b. Frontend/Extension Integration
- Update API routes to prefer custom model
- Display model attribution ("Baloney Custom v1.0" vs "HuggingFace Ensemble")
- Add model performance badges to dashboard

## Phase 3: Product Polish (Hours 7-9)

### 3a. UX Improvements
- Integrate phishing detection into dashboard (already built, not exposed)
- Fix any rough edges in extension
- Ensure demo flow is smooth on target sites

### 3b. Data & Demo
- Seed realistic demo data showing compelling patterns
- Pre-scan demo pages for reliable demo flow
- Test extension on 5+ sites for reliability

## Phase 4: Presentation (Hours 9-11)

### 4a. Narrative Structure
- Hook: "47 things. 13 were AI. You didn't know."
- Problem: No visibility into AI content exposure, no regulations
- Solution: Baloney — auto-scan, score, filter, track
- Data Science: Custom model, rigorous evaluation, benchmark results
- Demo: Live extension + dashboard
- Impact: EU AI Act, platform accountability, individual empowerment
- Close: "Install it now. Take control of your information diet."

### 4b. Evaluation Slides
- ROC curve showing our model vs baselines
- Confusion matrix across domains
- Ablation chart showing each method's contribution
- Before/after accuracy improvement

### 4c. Backup
- Record full demo video at hour 10
- Screenshot slides for chart fallbacks

## Phase 5: Buffer & Submit (Hours 11-12)

- Rehearse twice
- Final submission: GitHub, Devpost, screenshots
- Verify all live URLs work

## Hardware

- **Training**: M4 Max, 64GB unified memory (local)
- **Deployment**: Railway (backend), Vercel (frontend)
- **Development**: Local Next.js dev server

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Model doesn't converge | Fall back to Approach B (evaluation-only on existing models) |
| Railway deployment fails | Deploy to Vercel serverless function or use HuggingFace Spaces |
| Dataset too large for training window | Use HC3 subset (10K samples) for faster iteration |
| Demo site changes break extension | Pre-select 3 stable demo sites, test all before presentation |
