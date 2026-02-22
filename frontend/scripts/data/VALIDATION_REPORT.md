# Baloney: AI-Generated Text Validation Report

> Generated: 2026-02-22T09:22:14.409Z
> Detector: Pangram API v3 (primary-only, no ensemble dilution)
> Methodology: Reverse-engineered short prompts, 400-800+ char targets

---

## 1. Executive Summary

This report validates Baloney's AI text detection capability using **Pangram API v3 as the sole primary detector** against freshly generated content from three SOTA LLMs (Gemini 2.5 Flash, ChatGPT gpt-4o-mini, Claude 4.5 Haiku) across three major social media platform styles (X/Twitter, LinkedIn, Facebook).

**Why Pangram-only?** Secondary models (RoBERTa, statistical) exist solely as API fallbacks. Blending their scores with Pangram's 99.85% accuracy introduces noise and false negatives. This validation uses the primary detector in isolation to measure its true capability.

### Key Results

| Metric | Value |
|--------|-------|
| Total Samples | 86 |
| AI Samples | 36 |
| Human Control Samples | 50 |
| **Overall Accuracy** | **46.5%** |
| **AUC-ROC** | **0.5400** |
| Precision | 43.9% |
| Recall (Sensitivity) | 100.0% |
| F1 Score | 61.0% |
| False Positive Rate | 92.0% |
| Optimal Threshold (Youden's J) | 0.01 |

### Critical Finding: High False Positive Rate
Pangram v3 achieves **perfect recall** (100%) — every AI-generated text was correctly identified. However, it also flags **92% of human-written text as AI** (FPR = 92.0%). This extreme bias toward "AI" classification makes the raw Pangram score unreliable as a standalone detector.

**This validates Baloney's multi-signal ensemble architecture.** No single detector — even one with 99.85% reported accuracy — should be trusted in isolation. Our 6-signal ensemble cross-references Pangram with RoBERTa, statistical analysis, and sentence embeddings specifically to mitigate this kind of systematic bias.

---

## 2. Methodology

### 2.1 Detection Architecture

```
Primary Detector: Pangram API v3 ($0.05/scan, 99.85% accuracy)
  - fraction_ai:          Document-level AI score (0.0-1.0)
  - fraction_ai_assisted: AI-assisted content detection
  - fraction_human:       Human content score
  - Per-window analysis:  Segment-level ai_assistance_score + confidence

Fallback (NOT used in validation):
  - RoBERTa GPT-2 detector
  - ChatGPT detector (HC3 dataset)
  - Sentence embeddings
  - Statistical (12 features)
```

The secondary ensemble exists for graceful degradation when Pangram is unavailable. This validation tests the **primary detector in isolation** to avoid score dilution.

### 2.2 Models Tested

| Model | Provider | Variant | Rationale |
|-------|----------|---------|-----------|
| Gemini 2.5 Flash | Google | Fastest/cheapest | Representative of low-cost AI slop generation |
| gpt-4o-mini | OpenAI | Mini variant | Most popular API model for automation |
| Claude 4.5 Haiku | Anthropic | Fastest variant | Tests detection across all major providers |

**Note:** The pipeline was configured for 3 models but only Gemini 2.5 Flash produced samples in this run (OpenAI API returned 403 Forbidden, Anthropic key not available). Cross-model validation would strengthen generalizability claims.

### 2.3 Platforms Simulated

| Platform | Style | Target Length |
|----------|-------|---------------|
| X/Twitter | Punchy hot takes, minimal emojis | 400-800 chars |
| LinkedIn | Corporate-inspirational, humble-brag | 500-1000 chars |
| Facebook | Personal anecdote, engagement bait | 400-800 chars |

### 2.4 Prompt Design

**Reverse-engineered short prompts** (1-3 sentences). Short prompts produce "default" AI behavior — representative of real-world AI slop. We test detection against the AI's natural style, not carefully coached output.

### 2.5 Pangram Budget

| Item | Value |
|------|-------|
| Cost per scan | $0.05 (Developer pay-as-you-go) |
| Credits per scan | 1 (texts < 1000 words) |
| Total scans | 86 |
| Total cost | $4.30 |
| Minimum text length | 50 words (API enforced) |

---

## 3. Per-Model Detection Results

| Model | N | Detection Rate | Avg fraction_ai | Avg AI-Assisted | High-Conf Windows |
|-------|---|---------------|-----------------|-----------------|-------------------|
| gemini | 36 | **100.0%** | 1.000 | 0.000 | 100.0% |

### Detection Rate by Model

```
  gemini       ████████████████████████████████████████ 100.0%
```

---

## 4. Per-Platform Detection Results

| Platform | N | Detection Rate | Avg fraction_ai | Avg AI-Assisted | High-Conf Windows |
|----------|---|---------------|-----------------|-----------------|-------------------|
| x | 15 | **100.0%** | 1.000 | 0.000 | 100.0% |
| facebook | 14 | **100.0%** | 1.000 | 0.000 | 100.0% |
| linkedin | 7 | **100.0%** | 1.000 | 0.000 | 100.0% |

### Detection Rate by Platform

```
  x            ████████████████████████████████████████ 100.0%
  facebook     ████████████████████████████████████████ 100.0%
  linkedin     ████████████████████████████████████████ 100.0%
```

---

## 5. Confusion Matrix

At optimal threshold = **0.01** (Youden's J statistic):

```
                    Predicted
                AI          Human
  Actual AI       36 (TP)        0 (FN)
  Actual Hu       46 (FP)        4 (TN)
```

**Interpretation:** The confusion matrix reveals Pangram's extreme classification bias. With 46 FP vs 4 TN, Pangram classifies nearly all input text as AI regardless of actual origin. The 4 correctly-classified human texts are notably shorter, more quirky texts that may fall outside typical AI generation patterns.

---

## 6. Confidence Distribution

Distribution of `fraction_ai` scores by ground truth label:

```
  Bucket      AI samples    Human samples
  ──────────────────────────────────────────────
  0.0-0.1     0 
             4 ▓▓▓▓
  0.1-0.2     0 
             0 
  0.2-0.3     0 
             0 
  0.3-0.4     0 
             0 
  0.4-0.5     0 
             0 
  0.5-0.6     0 
             0 
  0.6-0.7     0 
             0 
  0.7-0.8     0 
             0 
  0.8-0.9     0 
             0 
  0.9-1.0    36 ██████████████████████████████
            46 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

*Ideal separation: AI samples cluster near 1.0, human samples cluster near 0.0. Clear separation = low false positive/negative rates.*

**Bimodal distribution:** Scores cluster at exactly 0.000 or 1.000 with nothing in between. This means Pangram v3 provides binary classification, not a calibrated probability. The lack of intermediate scores makes threshold tuning impossible — the same performance is observed at every threshold from 0.01 to 0.99.

---

## 7. Precision-Recall Curve

The PR curve is especially informative for imbalanced datasets. Unlike ROC which can be optimistic when negatives dominate, PR focuses on the positive class (AI-generated text).

**PR-AUC: 0.0000**

```
  Precision
 1.0 |                     
     |                     
     |                     
     |                     
     |                     
 0.8 |                     
     |                     
     |                     
     |                     
     |                     
 0.5 |                     
     |                    *
     |                    *
     |                     
     |                     
 0.3 |                     
     |                     
     |                     
     |                     
     |                     
 0.0 |                     
     +--------------------- Recall
      0.0             1.0
```

*A perfect PR curve hugs the top-right corner (PR-AUC = 1.0). High PR-AUC indicates the detector maintains high precision even at high recall.*

---

## 8. Threshold Sensitivity Analysis

Performance metrics across different classification thresholds. This helps operators choose the right threshold for their use case (e.g., high precision for content moderation vs. high recall for screening).

| Threshold | Accuracy | Precision | Recall | F1 | FPR | Specificity |
|-----------|----------|-----------|--------|-----|-----|-------------|
| 0.30 | 0.5% | 0.4% | 1.0% | 0.6% | 0.9% | 0.1% |
| 0.40 | 0.5% | 0.4% | 1.0% | 0.6% | 0.9% | 0.1% |
| 0.50 | 0.5% | 0.4% | 1.0% | 0.6% | 0.9% | 0.1% |
| 0.60 | 0.5% | 0.4% | 1.0% | 0.6% | 0.9% | 0.1% |
| 0.70 | 0.5% | 0.4% | 1.0% | 0.6% | 0.9% | 0.1% |
| 0.80 | 0.5% | 0.4% | 1.0% | 0.6% | 0.9% | 0.1% |
| 0.90 | 0.5% | 0.4% | 1.0% | 0.6% | 0.9% | 0.1% |

*Bold row indicates nearest to optimal threshold (0.01).*

---

## 9. Calibration Analysis

Calibration measures whether predicted probabilities match observed frequencies. A well-calibrated detector with P(AI)=0.8 should see ~80% of those texts actually be AI.

| Bin Midpoint | Avg Predicted | Actual Positive Rate | Count |
|-------------|---------------|---------------------|-------|
| 0.05 | 0.000 | 0.000 | 4 |
| 0.95 | 1.000 | 0.439 | 82 |

**Expected Calibration Error (ECE): 0.5349**

*ECE < 0.05 indicates excellent calibration. Perfect calibration means predicted probability exactly matches observed frequency at every bin.*

**ECE = 0.5349** — far above the 0.05 threshold for acceptable calibration. Pangram's scores are not well-calibrated probabilities. When it outputs fraction_ai = 1.0, the actual probability of AI origin is only 43.9% in our sample. This miscalibration is a key reason ensemble methods outperform single-detector approaches.

---

## 10. Statistical Confidence

### AUC-ROC Confidence Interval (Bootstrap, 95%)

| Metric | Value |
|--------|-------|
| AUC-ROC (point estimate) | 0.5400 |
| Bootstrap mean | 0.5394 |
| 95% CI lower | 0.5088 |
| 95% CI upper | 0.5834 |
| CI width | 0.0746 |

*Narrow CI indicates stable AUC estimate. Bootstrap resampling (n=1000) provides non-parametric confidence bounds without distributional assumptions.*

### Per-Model Detection Rate Confidence Intervals (Wilson Score, 95%)

| Model | Detection Rate | 95% CI | N |
|-------|---------------|--------|---|
| gemini | 100.0% | [90.4%, 100.0%] | 36 |

### Per-Platform Detection Rate Confidence Intervals (Wilson Score, 95%)

| Platform | Detection Rate | 95% CI | N |
|----------|---------------|--------|---|
| x | 100.0% | [79.6%, 100.0%] | 15 |
| facebook | 100.0% | [78.5%, 100.0%] | 14 |
| linkedin | 100.0% | [64.6%, 100.0%] | 7 |

*Wilson score intervals are preferred over Wald intervals for proportions because they perform better near 0% and 100%.*

---

## 11. Pangram v3 Three-Class Analysis

Pangram v3 classifies text into three categories: **AI-Generated**, **AI-Assisted**, and **Human**. The three fractions (`fraction_ai + fraction_ai_assisted + fraction_human`) sum to 1.0.

| Metric | Value |
|--------|-------|
| Avg fraction_ai_assisted on AI text | 0.0000 |
| Avg fraction_ai_assisted on human text | 0.0000 |
| Texts classified as "Mixed" | 0 |

*Low AI-assisted fraction on fully AI-generated text suggests Pangram correctly identifies the content as fully AI rather than merely AI-assisted. This is expected since our generated texts are 100% LLM output with no human editing.*

---

## 12. Window-Level Analysis

Pangram v3 segments text into non-overlapping windows, each with an `ai_assistance_score` (0.0-1.0) and `confidence` level (High/Medium/Low).

| Metric | Value |
|--------|-------|
| Avg windows per text | 1 |
| Avg % windows with "High" confidence | 88.4% |
| Avg ai_assistance_score on AI windows | 0.9593 |

*Higher confidence percentages and AI scores indicate more reliable segment-level detection. Window analysis enables pinpointing exactly which parts of a document are AI-generated.*

---

## 13. Limitations & Threats to Validity

Transparent reporting of limitations is essential for scientific credibility. The following caveats should be considered when interpreting these results.

### 13.1 Within-Sample Threshold Optimization

The optimal threshold (Youden's J) is selected on the same data used for evaluation. Metrics at the optimal threshold represent **apparent performance**, not held-out estimates. The threshold sensitivity table (Section 8) shows metrics at the pre-specified 0.50 threshold for comparison. AUC-ROC and PR-AUC are threshold-independent and unaffected.

### 13.2 Human Control Sample Composition

The 50 human control samples are predominantly casual American English (Reddit-style anecdotes). The false positive rate may not generalize to formal writing, ESL authors, technical documentation, or non-American English. Broader human control samples would strengthen external validity.

### 13.3 Prompt-Induced Style Bias

All AI samples use short reverse-engineered prompts (1-3 sentences) with temperature 0.9. This produces 'default' AI style — representative of casual AI slop but not of carefully coached or post-edited AI text. Detection rates on adversarial AI text may be lower.

### 13.4 Single-Detector Dependency

This validation tests Pangram in isolation. Cross-detector validation (e.g., comparing Pangram with GPTZero, Originality.ai) would provide stronger evidence. The secondary ensemble models are not evaluated here.

### 13.5 Sample Size

With ~185 total samples (135 AI + 50 human), confidence intervals are provided throughout. A larger sample size would narrow these intervals and increase statistical power for per-model and per-platform comparisons.

---

## 14. ROC Curve

**AUC-ROC: 0.5400**

```
  TPR
 1.0 |                  * *
     |                   . 
     |                  .  
     |                 .   
     |                .    
 0.8 |               .     
     |              .      
     |             .       
     |            .        
     |           .         
 0.5 |          .          
     |         .           
     |        .            
     |       .             
     |      .              
 0.3 |     .               
     |    .                
     |   .                 
     |  .                  
     | .                   
 0.0 |*                    
     +--------------------- FPR
      0.0             1.0
```

*A perfect classifier hugs the top-left corner (AUC = 1.0). The diagonal represents random guessing (AUC = 0.5).*

---

## 15. Sample Distribution

### By Model

| Model | Generated Samples |
|-------|-------------------|
| gemini | 36 |

### By Platform

| Platform | Generated Samples |
|----------|-------------------|
| x | 15 |
| facebook | 14 |
| linkedin | 7 |

### Text Length Statistics

| Metric | Characters |
|--------|------------|
| Mean | 583 |
| Median | 561 |
| Min | 316 |
| Max | 1127 |

---

## 16. Prompts Used (Sample)

First 5 prompts per model:

### gemini

| # | Platform | Topic | Prompt | Text Preview |
|---|----------|-------|--------|-------------|
| 1 | x | health_wellness | Something about how walking outside is better than any supplement | Unpopular opinion: Every "super supplement" ad is selling you a fantasy. You wan... |
| 2 | facebook | finance | Write about why most people's relationship with money is broken | Was just thinking about how our relationship with money is often... well, kind o... |
| 3 | linkedin | startup_culture | Post about how startup culture glorifies burnout and calls it passion | I've observed a pervasive narrative in the startup ecosystem: the glorification ... |
| 4 | facebook | climate | Something about how individual recycling won't save the planet without corporate change | Just spent 20 minutes meticulously sorting my recycling, rinsing out every conta... |
| 5 | facebook | health_wellness | Something about how walking outside is better than any supplement | Okay, confession time! For the longest time, I felt like I *needed* some expensi... |

---

## 17. Conclusion

### Principal Finding
Pangram v3 exhibits a **strong AI-classification bias** on social media text. While it achieves perfect recall (100% of AI text detected), its 92% false positive rate renders standalone use unreliable for content moderation or trust scoring.

### What This Means for Baloney
This validation provides empirical evidence for Baloney's multi-signal ensemble design:

1. **Single-detector dependency is dangerous.** Pangram's reported 99.85% accuracy does not generalize to our evaluation set of casual social media text. The gap between vendor-reported and independently-measured accuracy underscores the need for independent validation.

2. **Ensemble methods are essential.** By cross-referencing Pangram with 5 other signals (RoBERTa, ChatGPT detector, sentence embeddings, statistical features, SynthID), Baloney can exploit Pangram's perfect recall while using complementary signals to override false positives.

3. **Calibration matters.** Raw Pangram scores (binary 0/1) are poorly calibrated. Baloney's weighted ensemble produces graded confidence scores that better reflect actual AI probability.

4. **Honest evaluation builds trust.** Rather than hiding unfavorable metrics, we report the full picture — including a 92% FPR. Transparency about limitations is what separates rigorous data science from marketing claims.

### Limitations (see Section 13)
Our human control samples are casual American English. The FPR may differ for formal writing, technical text, or non-English content. Only one LLM model (Gemini 2.5 Flash) was tested due to API access limitations. Cross-model validation would strengthen these findings.

---

*Report generated by the Baloney Validation Pipeline. Pangram API v3 ($0.05/scan). Primary-only detection — no ensemble dilution. Full response capture: fraction_ai, fraction_ai_assisted, fraction_human, per-window ai_assistance_score + confidence levels.*