# Proprietary AI Content Detection: Research Report

**Date:** 2026-03-22
**Status:** Research complete, ready for implementation planning

---

## Executive Summary

Building proprietary detection models is feasible and strategically sound. Text detection is the easiest win (weeks), image detection is a solid medium-term project (1-2 months), and video detection is the hardest but has the weakest competitive landscape (quarter+). On-device inference is realistic for lightweight pre-screening models in both the Chrome extension and mobile app. The Mac Studio M2 Ultra can handle both training (via MLX/LoRA) and production inference for moderate scale.

---

## 1. Text Detection Models

### State of the Art (Trained Classifiers)

| Model | Approach | Accuracy | Notes |
|-------|----------|----------|-------|
| DeBERTa-v3-large fine-tuned | Supervised binary classification | 97-99% F1 | Best accuracy, handles latest LLMs, fast inference |
| RoBERTa-large-openai-detector | Fine-tuned on GPT-2 outputs | ~95% on GPT-2 | Degrades on newer models |
| Ghostbuster | Multi-model feature extraction + classifier | 99.0 F1 | No access to target model needed |

### Zero-Shot Approaches (No Training Data)

| Model | Approach | Accuracy | Notes |
|-------|----------|----------|-------|
| Binoculars | Contrasting two pre-trained LLMs | 90%+ at 0.01% FPR | No training data needed |
| Fast-DetectGPT | Probability curvature analysis | 0.95 AUROC | Needs source model access |

### Recommendation: Fine-tuned DeBERTa-v3-large

- ~400M params, 97%+ accuracy when fine-tuned
- Inference: ~40ms per sample on M2 Ultra via MLX
- Fine-tune with LoRA on M2 Ultra in hours
- ONNX export for browser/mobile deployment
- Pre-trained checkpoint: [abhi099k/ai-text-detector-deberta-v3-large](https://huggingface.co/abhi099k/ai-text-detector-deberta-v3-large)

**Ensemble strategy:** DeBERTa classifier + Binoculars zero-shot + existing 12-feature statistical + SynthID watermark detector

### Key Datasets

- [artem9k/ai-text-detection-pile](https://huggingface.co/datasets/artem9k/ai-text-detection-pile) -- GPT-2/3/ChatGPT long-form
- [ahmadreza13/human-vs-Ai-generated-dataset](https://huggingface.co/datasets/ahmadreza13/human-vs-Ai-generated-dataset) -- 3.6M rows
- Critical gap: None contain GPT-5, Claude 4, or Gemini 3 outputs -- must generate own

### Adversarial Robustness

Paraphrasing reduces detection rates 64-99%. Mitigations:
- Train on paraphrased AI text as negative examples
- PIFE framework (Perturbation-Invariant Feature Engineering)
- Ensemble with statistical features (harder to fool than neural classifiers alone)

---

## 2. Image Detection Models

### State of the Art

| Model | Approach | Accuracy | Source |
|-------|----------|----------|--------|
| AIDE (ICLR 2025) | CLIP + frequency + noise experts | SOTA (+3.5%) | [GitHub](https://github.com/shilinyan99/AIDE) |
| FIRE (CVPR 2025) | Frequency-guided reconstruction error | Robust | [arXiv](https://arxiv.org/abs/2412.07140) |
| NPR (CVPR 2024) | Neighboring pixel relationships | 93.3% across 28 generators | CVPR 2024 |
| UnivFD (CVPR 2023) | CLIP-ViT + linear probe | +15% mAP over prior | [GitHub](https://github.com/WisconsinAIVision/UniversalFakeDetect) |
| DIRE (ICCV 2023) | Diffusion reconstruction error | Robust to blur/JPEG | [GitHub](https://github.com/ZhendongWang6/DIRE) |

### Recommendation: AIDE + UnivFD Ensemble

1. Start with UnivFD -- freeze CLIP-ViT, train single linear layer (minutes on M2 Ultra)
2. Add AIDE -- hybrid features for best accuracy
3. Keep existing FFT frequency analysis (complementary)
4. Add NPR for upsampling artifact detection

**Key finding:** Ensemble detectors dominate (78% mean vs 37-72% single models). Mean accuracy declines with generator release year -- continuous retraining essential.

### Datasets

- DRCT-2M -- 1M+ images from 16 diffusion types
- [GenImage++](https://huggingface.co/datasets/Lunahera/genimagepp) -- NeurIPS 2025 benchmark
- [AIGCDetectBenchmark](https://github.com/Ekko-zn/AIGCDetectBenchmark) -- 17 detection methods

---

## 3. Video Detection

| Approach | Accuracy | Source |
|----------|----------|--------|
| CNN-BiLSTM-Transformer | 98% on benchmarks | PMC |
| GenConViT | 95.8% avg, 99.3% AUC | [GitHub](https://github.com/erprogs/GenConViT) |
| DFD-FCG (CVPR 2025) | Generalizes to unseen | [GitHub](https://github.com/aiiu-lab/DFD-FCG) |
| Temporal frequency analysis | Catches flicker/drift | ICCV 2025 |

### Recommendation: Hybrid Frame + Temporal

1. Frame-level image detection using AIDE/UnivFD
2. Temporal consistency analysis (optical flow, flicker)
3. GenConViT for dedicated video analysis (95.8% accuracy)

---

## 4. On-Device Inference

### Chrome Extension (MV3)

- Use offscreen document as inference runtime (service workers terminate after ~30s)
- Transformers.js v4 with WebGPU backend
- Sweet spot: sub-100MB quantized models (INT8/INT4)
- DeBERTa-base: ~85M params -> ~45MB INT4 ONNX
- Reference: [transformers.js-chrome](https://github.com/tantara/transformers.js-chrome)

### Mobile (Expo/React Native)

| Framework | Backend | Recommendation |
|-----------|---------|----------------|
| react-native-executorch | Meta ExecuTorch (CoreML/XNNPACK) | Best for Expo |
| onnxruntime-react-native | ONNX Runtime (CoreML/NNAPI) | Production-ready |

- react-native-executorch by Software Mansion (Expo ecosystem)
- CoreML on iOS Neural Engine: ~15-30ms for 100M param model
- Requires custom dev client (already needed for expo-share-intent)

### Mac Studio M2 Ultra (Server)

| Metric | M2 Ultra | RTX 4090 |
|--------|----------|----------|
| BERT inference | ~25ms | ~23ms |
| Memory bandwidth | 800 GB/s | 1 TB/s |
| Max model size | 192GB unified | 24GB VRAM |

MLX is the clear winner for Apple-native training and inference.

---

## 5. Cost Analysis

### Break-Even: Self-Hosted vs API

| Monthly Scans | API Cost (Pangram + SightEngine) | Self-Hosted | Savings |
|--------------|--------------------------------|-------------|---------|
| 1,000 | $79 | $25 | $54/mo |
| 10,000 | $699 | $35 | $664/mo |
| 100,000 | $5,800 | $75 | $5,725/mo |

Self-hosted wins at virtually any volume above free tiers.

---

## 6. Implementation Roadmap

### Phase 1: Weeks 1-3 (Text Detection)
- Download/evaluate DeBERTa checkpoints from HuggingFace
- Generate 100K training samples from GPT-5, Claude 4, Gemini 3 + human text
- Fine-tune DeBERTa-v3-large with LoRA on M2 Ultra (~4 hours)
- Integrate Binoculars as secondary signal
- A/B test against Pangram, then cut over

### Phase 2: Weeks 4-6 (Image Detection)
- Train UnivFD linear probe on DRCT-2M (30 minutes)
- Implement NPR detector
- Train AIDE model (~24 hours)
- Calibrate ensemble with temperature scaling
- A/B test against SightEngine

### Phase 3: Weeks 7-10 (Browser + Mobile)
- Export quantized DeBERTa-base to ONNX INT4 (~45MB)
- Chrome extension offscreen document with Transformers.js v4
- react-native-executorch for mobile pre-screening
- On-device = pre-screen; server = authoritative

### Phase 4: Weeks 11-16 (Video + Hardening)
- Temporal consistency analysis
- GenConViT integration
- Adversarial training data
- Automated monthly retraining pipeline

---

## 7. Competitive Intelligence

| Competitor | Approach | Accuracy | Weaknesses |
|-----------|----------|----------|------------|
| GPTZero | 7-component pipeline | 98%+ | Weaker on non-English |
| Originality.ai | Neural + statistical ensemble | 98-100% | 10-15% FPR in some studies |
| Turnitin | Deep learning classifier | 92-100% | Struggles with paraphrased AI |

All top detectors use ensemble approaches. GPTZero's RL-based adversarial training is worth adopting.

---

## Key Repositories

| Repo | Purpose |
|------|---------|
| [shilinyan99/AIDE](https://github.com/shilinyan99/AIDE) | SOTA image detection (ICLR 2025) |
| [WisconsinAIVision/UniversalFakeDetect](https://github.com/WisconsinAIVision/UniversalFakeDetect) | CLIP image detection |
| [ahans30/Binoculars](https://github.com/ahans30/Binoculars) | Zero-shot text detection |
| [vivek3141/ghostbuster](https://github.com/vivek3141/ghostbuster) | Feature-based text detection |
| [erprogs/GenConViT](https://github.com/erprogs/GenConViT) | Video deepfake detection |
| [SCLBD/DeepfakeBench](https://github.com/SCLBD/DeepfakeBench) | Video detection benchmark |
| [google-deepmind/synthid-text](https://github.com/google-deepmind/synthid-text) | Watermark detection |
| [huggingface/transformers.js](https://github.com/huggingface/transformers.js) | Browser ML inference |
| [software-mansion/react-native-executorch](https://github.com/software-mansion/react-native-executorch) | Mobile ML inference |
| [scu-zjz/ForensicHub](https://github.com/scu-zjz/ForensicHub) | Unified detection benchmark |
