# AI Content Detection Landscape — Research Reference

> Compiled February 2026 for MadData26 hackathon. Covers video compression on social platforms, all known detection tools/models/APIs, and practical integration guidance.

---

## Table of Contents

1. [Baloney's Current Approach & Test Results](#baloneys-current-approach--test-results)
2. [Social Media Video Compression](#social-media-video-compression)
3. [Detection Software Catalog](#detection-software-catalog)
4. [Quick Reference Table](#quick-reference-table)
5. [Platform Video Delivery Details](#platform-video-delivery-details)

---

## Baloney's Current Approach & Test Results

### Text Detection (Current)

**Method:** Multi-signal ensemble via HuggingFace Inference API (`frontend/src/lib/real-detectors.ts`)
- **Method A (50% weight):** `openai-community/roberta-base-openai-detector` — RoBERTa fine-tuned on GPT-2 outputs for binary AI/human classification
- **Method B (20% weight):** `sentence-transformers/all-MiniLM-L6-v2` — Sentence embeddings for inter-sentence uniformity analysis (EditLens-inspired)
- **Method D (30% weight):** Statistical features — burstiness, type-token ratio, perplexity proxy, repetition score, readability

**Results:** RoBERTa was trained on GPT-2 outputs (2019-era). It struggles significantly with modern LLM outputs (GPT-4o, Claude, Gemini, DeepSeek). The statistical features provide some signal but are easily defeated by post-processing. The MiniLM embedding uniformity approach is a proxy measure — not a direct detection method. Overall, text detection accuracy on modern LLM content is estimated at 60-75%, well below the 90%+ needed for reliable results.

**Key limitation:** No minimum text length enforcement. Below ~50 words, results are essentially random. Industry standard minimums: Turnitin requires 300 words, GPTZero recommends 200+, Originality.ai requires 100+.

### Image Detection (Current)

**Method:** Multi-signal ensemble
- **Method E (55% weight):** `umm-maybe/AI-image-detector` — ViT-based classifier trained on AI-generated vs real images
- **Method F (25% weight):** Frequency/FFT analysis — local variance uniformity and high-frequency energy proxy
- **Method G (20% weight):** Metadata/EXIF analysis — marker detection, camera make/model identification

**Results:** The ViT model (`umm-maybe/AI-image-detector`) was created in **October 2022** and trained on pre-2022 generators. It was never exposed to Midjourney v5+, SDXL, Stable Diffusion 3, DALL-E 3, Flux, or any 2024-2025 generator. A comprehensive February 2026 benchmark (arXiv:2602.07814) evaluating 16 SOTA detection methods across 291 generators found:

| Generator | Best Detector Accuracy |
|-----------|----------------------|
| Flux Dev | 21% |
| Firefly v4 | 18% |
| Midjourney v7 | 24% |
| DALL-E 3 | 31% |
| Older generators (ProGAN, StyleGAN2) | 82-87% |

Our ViT model, being older than even the "best" detectors tested, likely performs at or below chance on modern AI-generated images. The FFT and metadata methods provide marginal supplementary signal but cannot compensate for the core model's obsolescence.

**Key limitation:** The model is 3+ years old and effectively blind to modern generators.

### Video Detection (Current)

**Method:** Poster frame or single captured frame → image detection pipeline

**Results:** Subpar for two compounding reasons:
1. **Single-frame analysis misses temporal artifacts** — AI-generated videos have inter-frame inconsistencies (identity drift, physics violations, temporal flicker) that are invisible in a single frame
2. **Social media compression destroys frame-level artifacts** — Platforms re-encode video at 2-8 Mbps H.264/H.265, wiping the pixel-level GAN/diffusion fingerprints that the ViT model looks for
3. **The underlying image model is outdated** — even if we got a clean frame, the ViT model can't detect modern generators

Multi-frame analysis with temporal consistency checking would dramatically improve results (estimated 55-70% → 70-85%), and semantic-level detection (physics violations, anatomical anomalies) would survive compression.

### Fallback Detection (Mock)

When `HUGGINGFACE_API_KEY` is not set or API fails, `mock-detectors.ts` provides:
- Image: 35% AI (confidence 0.78-0.96), 55% human, 10% inconclusive — fixed distributions, not real detection
- Text: Real `text_stats` computation + mock verdict with caveats

---

## Social Media Video Compression

Every major platform aggressively re-encodes uploaded video, destroying most forensic artifacts.

### What Gets Destroyed

- **GAN/diffusion fingerprints** — wiped by DCT quantization
- **Temporal micro-jitter** — masked by encoder motion estimation
- **All metadata** — EXIF, C2PA, timestamps stripped by every platform
- **High-frequency spectral artifacts** — quantized away
- **Content hashes** — SHA-256 completely changes after re-encoding

### What Survives

| Signal | Robustness | Why |
|--------|-----------|-----|
| Physics violations (gravity, object permanence) | Very High | Semantic, not pixel-level |
| Anatomical anomalies (hands, teeth, ears) | Very High | Compression can't fix bad anatomy |
| Lighting inconsistency (shadows, specular) | High | Macroscopic brightness patterns survive |
| Inter-frame identity drift (faces morphing) | High | AI "reinvents" details per frame |
| Optical flow plausibility | Moderate | Large-scale flow survives, sub-pixel doesn't |
| Compression fingerprinting | Moderate | AI content compresses differently than real |
| Pixel-level artifacts | Very Low | Mostly destroyed |

### Platform Comparison

| Platform | Delivery | Codec | Max Resolution | Typical Bitrate (1080p) | Compression Level | C2PA Preserved? |
|----------|----------|-------|---------------|------------------------|-------------------|-----------------|
| **X (Twitter)** | HLS (.m3u8 + .ts segments) | H.264 | 1080p | ~2-3 Mbps | Very aggressive | No |
| **Instagram** | Progressive MP4 / DASH | H.264, VP9, AV1 (mobile) | 1080p (1080x1920 Reels) | ~3.5-8 Mbps | Moderate-aggressive | No |
| **Facebook** | DASH (.mpd) mixed-codec | H.264, VP9, AV1 | 1080p | ~4-8 Mbps | Moderate (popular content gets better encoding) | No |
| **LinkedIn** | HLS / Progressive MP4 | H.264 | 1080p | ~5-8 Mbps | Moderate | Extracted & displayed (unique), but stripped from file |

### Chrome Extension Frame Extraction

| Method | X | Instagram | Facebook | LinkedIn |
|--------|---|-----------|----------|----------|
| `canvas.drawImage(video)` | Works (blob MSE same-origin) | May be tainted (cross-origin CDN) | Works (blob MSE same-origin) | Works for blob; may taint for direct CDN |
| Poster/thumbnail `<img>` | `pbs.twimg.com` (JPEG/WebP) | `scontent.cdninstagram.com` (JPEG) | `scontent.fbcdn.net` (JPEG) | `media.licdn.com` (JPEG) |
| `captureVisibleTab()` | Always works | Always works | Always works | Always works |

**Best strategy:** Try `canvas.drawImage()` first (highest quality). Fall back to poster image URL. Last resort: `captureVisibleTab()` + crop.

### Key DOM Details

- **X:** `<video src="blob:...">` via MSE/hls.js. CDN: `video.twimg.com`. Cannot get direct URL from DOM — need network interception.
- **Instagram:** React SPA. Short clips may have direct `scontent.cdninstagram.com` URLs. Longer content uses blob MSE. URLs are signed and ephemeral.
- **Facebook:** Deeply nested React. Always `blob:` URLs via DASH MSE. MutationObserver needed for dynamic elements. Up to 35 encodings per popular video (7 resolutions x 5 CRF values).
- **LinkedIn:** Standard HTML5 video. Most C2PA-friendly platform — displays provenance badge when present. Less aggressive SPA architecture.

---

## Detection Software Catalog

---

### Open-Source Video-Native Models

These analyze temporal/motion patterns across frames — designed specifically for video.

---

#### ReStraV (Representation Straightening Video)

| Field | Details |
|-------|---------|
| **Type** | Open-source research model |
| **Cost** | Free |
| **Link** | [GitHub](https://github.com/ChristianInterno/ReStraV) — [arXiv:2507.00583](https://arxiv.org/abs/2507.00583) |
| **Created** | July 2025 (NeurIPS 2025, Google DeepMind) |
| **Trained on** | Evaluated on VidProM benchmark. Largely training-free — uses pre-trained DINOv2 embeddings with lightweight classifier |
| **Approach** | Based on "perceptual straightening" — natural videos trace straighter paths in neural representation space vs synthetic. Processes frames through DINOv2, analyzes trajectory curvature |
| **Detects** | Generator-agnostic (detects fundamental physical/perceptual properties, not generator-specific artifacts) |
| **Accuracy** | 97.17% accuracy, 98.63% AUROC on VidProM |
| **Compression robustness** | Operates on high-level representations, not pixel artifacts — inherently more resilient |
| **Compute** | ~48ms per video end-to-end. Single consumer GPU. **Most efficient method available** |
| **Drawbacks** | As generators improve temporal coherence, the straightening gap may narrow. Less effective on very short clips |
| **Production ready?** | Research prototype with code. Extreme efficiency makes it highly suitable for production adaptation |

---

#### DeMamba

| Field | Details |
|-------|---------|
| **Type** | Open-source research model |
| **Cost** | Free |
| **Link** | [GitHub](https://github.com/chenhaoxing/DeMamba) — [arXiv:2405.19707](https://arxiv.org/abs/2405.19707) |
| **Created** | May 2024 |
| **Trained on** | GenVideo benchmark (1M+ AI-generated and real videos, 11+ generator types) |
| **Approach** | Mamba structured state space model. Uses CLIP/XCLIP encoders, spatially groups features, models intra-group consistency across spatial-temporal dimensions |
| **Detects** | Sora, Runway, Pika, Stable Video Diffusion, ModelScope, and others in GenVideo |
| **Accuracy** | SOTA on GenVideo benchmark (1M+ video scale) |
| **Compression robustness** | Explicitly evaluated via "degraded video classification task" for quality degradation during dissemination |
| **Compute** | GPU required. Comparable to running ViT-L model. Single GPU sufficient |
| **Drawbacks** | Primarily evaluated on GenVideo; real-world social media generalization not fully proven. Mamba architecture adds complexity |
| **Production ready?** | Research prototype with public code and weights |

---

#### UNITE (Universal Network for Identifying Tampered and Synthetic Videos)

| Field | Details |
|-------|---------|
| **Type** | Open-source research model |
| **Cost** | Free |
| **Link** | [GitHub](https://github.com/Rohit-Kundu/UNITE) — [CVPR 2025](https://openaccess.thecvf.com/content/CVPR2025/html/Kundu_Towards_a_Universal_Synthetic_Video_Detector_From_Face_or_Background_CVPR_2025_paper.html) |
| **Created** | December 2024 (CVPR 2025, Google Research / UC Riverside) |
| **Trained on** | FaceForensics++, DeMamba GenVideo, plus task-irrelevant data for generalization |
| **Approach** | Transformer on SigLIP-So400M foundation model features. Attention-diversity loss prevents over-focusing on faces. Handles face manipulations, background manipulations, AND fully AI-generated T2V/I2V |
| **Detects** | Face-swap, face reenactment, background manipulation, AND fully AI-generated video (Sora, Runway, Pika, SVD). 100% accuracy on background-only manipulations |
| **Accuracy** | 95-99% on unseen manipulation methods in cross-generator testing |
| **Compression robustness** | SigLIP features provide some inherent robustness. Not explicitly tested under heavy social media compression |
| **Compute** | GPU required. SigLIP-So400M is a large model — A100/V100 recommended |
| **Drawbacks** | Large model footprint. Real-world social media compression testing not emphasized |
| **Production ready?** | Research prototype with code and weights |

---

#### NVIDIA Forensic-Oriented Augmentation (FOA)

| Field | Details |
|-------|---------|
| **Type** | Research model (code TBD) |
| **Cost** | Free (research) |
| **Link** | [NVIDIA Publication](https://research.nvidia.com/publication/2025-11_seeing-what-matters-generalizable-ai-generated-video-detection-forensic) — [arXiv:2506.16802](https://arxiv.org/abs/2506.16802) |
| **Created** | June 2025 (NeurIPS 2025) |
| **Trained on** | Custom training with forensic-oriented wavelet-based augmentation. Does NOT require large multi-generator datasets |
| **Approach** | Wavelet decomposition augmentation replaces specific frequency bands to exploit forensic cues |
| **Detects** | NOVA, FLUX, and other recent generators. **1st place in SAFE Synthetic Video Detection Challenge 2025** (unknown test models, varying resolution/bitrate/framerate) |
| **Accuracy** | Significant improvement over SOTA. Winner of SAFE 2025 (most realistic evaluation conditions) |
| **Compression robustness** | **Specifically designed for robustness** — SAFE Challenge involves varying resolution, bitrate, frame rate simulating real social media |
| **Compute** | Research-grade GPU likely required |
| **Drawbacks** | Code/weights may not yet be publicly released |
| **Production ready?** | No, but SAFE 2025 win suggests strong real-world applicability |

---

### Commercial APIs

Production-ready services with REST APIs.

---

#### SightEngine

| Field | Details |
|-------|---------|
| **Type** | Commercial API |
| **Cost** | From $29/month. Free tier available |
| **Link** | [Product](https://sightengine.com/detect-ai-generated-videos) — [API Docs](https://sightengine.com/docs/ai-generated-video-detection) — [Pricing](https://sightengine.com/pricing) |
| **Created** | AI video detection ~2024 |
| **Trained on** | Proprietary |
| **Approach** | Automatic frame extraction, per-frame AI classification, aggregated per-video score |
| **Detects** | Sora, Veo, Runway, Pika, Midjourney (video), Kling |
| **Accuracy** | 91.3% overall (ranked #2). 1.2% false positive rate. Best on Ideogram v3 (98%), weakest on Hunyuan (75%) |
| **Compression robustness** | Designed for real-world content at scale |
| **Compute** | API only — no local compute |
| **Drawbacks** | Black box. Accuracy varies by generator. Per-frame billing for video |
| **Production ready?** | Yes. Enterprise-grade with SLA |

---

#### Hive Moderation

| Field | Details |
|-------|---------|
| **Type** | Commercial API / SaaS |
| **Cost** | Enterprise pricing. $50 free credits to start |
| **Link** | [Product](https://thehive.ai/apis/ai-generated-content-classification) — [Pricing](https://thehive.ai/pricing) |
| **Created** | ~2023-2024 |
| **Trained on** | Proprietary, continuously updated |
| **Approach** | Returns confidence scores AND identifies likely generative engine used |
| **Detects** | Midjourney, Sora, ChatGPT/DALL-E, Stable Diffusion |
| **Accuracy** | 85-93%. **~25% false positive rate on genuine art** |
| **Drawbacks** | Enterprise-only for full features. High false positive rate |
| **Production ready?** | Yes |

---

#### Reality Defender

| Field | Details |
|-------|---------|
| **Type** | Commercial API / SDK |
| **Cost** | Free tier: 50 detections/month. SDK powered by NVIDIA |
| **Link** | [Product](https://www.realitydefender.com/) |
| **Created** | Founded 2018 (YC W22). Real Suite November 2025 |
| **Detects** | Face-swap deepfakes, AI-generated video, audio deepfakes |
| **Accuracy** | 90-95% |
| **Drawbacks** | Free tier very limited. Full capability requires enterprise agreement |
| **Production ready?** | Yes. Government and financial institution deployments |

---

#### Sensity AI

| Field | Details |
|-------|---------|
| **Type** | Commercial API / SaaS |
| **Cost** | $29-100+/month. No free plan |
| **Link** | [sensity.ai](https://sensity.ai/) — [API Docs](https://docs.sensity.ai/) |
| **Created** | Founded 2018 (originally Deeptrace Labs) |
| **Approach** | Multi-layered forensic analysis: visual artifacts, file structure, metadata, audio signals |
| **Detects** | Face swaps, reenactment, lipsync, GANs, diffusion models (SD, Midjourney, DALL-E, Flux, Gemini) |
| **Accuracy** | 95-98% |
| **Drawbacks** | No free tier. Black box |
| **Production ready?** | Yes. Government agencies, cybersecurity firms |

---

#### Deep Media (DeepID)

| Field | Details |
|-------|---------|
| **Type** | Commercial API |
| **Cost** | Enterprise pricing |
| **Link** | [API Docs](https://deepmedia.ai/documentation/deep-id-api) |
| **Created** | ~2020-2021 |
| **Approach** | Multi-modal (video, audio, image). Returns heatmaps and probability scores. Kubernetes-deployable |
| **Accuracy** | Not publicly disclosed. Trusted by U.S. government, Air Force Research Lab |
| **Drawbacks** | No public pricing or free tier |
| **Production ready?** | Yes. Government-grade |

---

### Watermark & Provenance Systems

These verify labeled content — they cannot detect unlabeled AI content.

---

#### Google SynthID (Video)

| Field | Details |
|-------|---------|
| **Type** | Proprietary watermark detector |
| **Cost** | Free consumer portal |
| **Link** | [deepmind.google/models/synthid](https://deepmind.google/models/synthid/) |
| **Created** | Video watermarking October 2024. Detector portal 2025 |
| **Approach** | Embeds imperceptible watermarks into every video frame during generation. 10B+ pieces watermarked |
| **Detects** | **Only Google AI tools:** Veo, Gemini, Imagen. Also NVIDIA Cosmos via partnership |
| **Compression robustness** | Designed to survive cropping, compression, format conversion |
| **Drawbacks** | **Completely useless for non-Google content.** Watermark must be embedded at generation time |

---

#### Meta Video Seal

| Field | Details |
|-------|---------|
| **Type** | Open-source (MIT license) |
| **Cost** | Free |
| **Link** | [GitHub](https://github.com/facebookresearch/videoseal) — [Meta Research](https://ai.meta.com/research/publications/video-seal-open-and-efficient-video-watermarking/) |
| **Created** | December 2024 |
| **Approach** | Frequency-domain watermark per frame. Survives blurring, cropping, compression, transcoding |
| **Drawbacks** | Only detects watermarked content. Requires generator/platform adoption |

---

#### C2PA / Content Credentials

| Field | Details |
|-------|---------|
| **Type** | Open standard + SDK |
| **Cost** | Free |
| **Link** | [c2pa.org](https://c2pa.org/) — [contentcredentials.org](https://contentcredentials.org/) |
| **Created** | Standard 2021. C2PA 2.1 with watermark support: 2025 |
| **Backed by** | Microsoft, Adobe, Intel, BBC, Sony, OpenAI, Google, Meta, Amazon |
| **Drawbacks** | Not detection — verification. Metadata stripped by all platforms except LinkedIn. Requires adoption |

---

### Frame-Level Image Detectors (Applicable to Video)

Apply per-frame. Miss temporal artifacts but simpler to deploy.

---

#### DRCT (Diffusion Reconstruction Contrastive Training)

| Field | Details |
|-------|---------|
| **Type** | Open-source — ICML 2024 Spotlight |
| **Cost** | Free |
| **Link** | [GitHub](https://github.com/beibuwandeluori/DRCT) |
| **Created** | May 2024 |
| **Trained on** | DRCT-2M: 16 types of diffusion models |
| **Approach** | Generates hard samples via diffusion reconstruction, then contrastive training. Enhances any backbone by 10%+ |
| **Drawbacks** | Image-only — no temporal info for video |

---

#### UnivFD (Universal Fake Image Detector)

| Field | Details |
|-------|---------|
| **Type** | Open-source — CVPR 2023 |
| **Cost** | Free |
| **Link** | [GitHub](https://github.com/WisconsinAIVision/UniversalFakeDetect) |
| **Created** | February 2023 |
| **Trained on** | ProGAN only, generalizes via CLIP features |
| **Approach** | Frozen CLIP features + linear classifier |
| **Accuracy** | +15.07 mAP over prior SOTA for cross-generator generalization |
| **Compute** | Very lightweight — consumer GPU or CPU |
| **Drawbacks** | Image-only |

---

#### Effort (Orthogonal Subspace Decomposition)

| Field | Details |
|-------|---------|
| **Type** | Open-source — ICML 2025 Oral |
| **Cost** | Free |
| **Link** | [GitHub](https://github.com/YZY-stack/Effort-AIGI-Detection) |
| **Created** | 2025 |
| **Approach** | Plug-and-play into any ViT/CLIP. Decomposes features to separate content from forensic artifacts |
| **Accuracy** | Top performance in DeepfakeBench |
| **Drawbacks** | Image-only |

---

#### DistilDIRE

| Field | Details |
|-------|---------|
| **Type** | Open-source — ICML 2024 |
| **Cost** | Free |
| **Link** | [GitHub](https://github.com/miraflow/DistilDIRE) |
| **Created** | June 2024 |
| **Approach** | Distilled from DIRE — approximates diffusion reconstruction error without full diffusion model |
| **Accuracy** | 99.0% on SD v1, 98.4% on ADM |
| **Compute** | Single consumer GPU, near real-time |
| **Drawbacks** | Image-only. May lose edge cases vs full DIRE |

---

#### AIDE (AI-Generated Image Detection Expert)

| Field | Details |
|-------|---------|
| **Type** | Open-source |
| **Cost** | Free |
| **Link** | Referenced in [benchmark](https://arxiv.org/html/2602.07814) |
| **Created** | ~2024 |
| **Approach** | Mixture-of-experts: low-level pixel statistics + high-level semantics |
| **Accuracy** | +3.5% over SOTA on AIGCDetectBenchmark, +4.6% on GenImage |
| **Drawbacks** | Image-only. 20-60% variance between training data variants |

---

#### umm-maybe/AI-image-detector (Currently used by Baloney)

| Field | Details |
|-------|---------|
| **Type** | Open-source (HuggingFace) |
| **Cost** | Free |
| **Link** | [HuggingFace](https://huggingface.co/umm-maybe/AI-image-detector) |
| **Created** | **October 2022** |
| **Trained on** | Pre-2022 generators. Did NOT include Midjourney 5, SDXL, DALL-E 3 |
| **Accuracy** | 94.2% on own test set. **Severely degraded on modern generators (likely <30%)** |
| **Drawbacks** | **OUTDATED.** Creator recommends updated version. Effectively blind to 2024-2025 generators |

---

### Face-Swap Deepfake Detectors

Detect manipulated faces in real video — NOT fully AI-generated video.

---

#### GenConViT

| Field | Details |
|-------|---------|
| **Type** | Open-source |
| **Cost** | Free |
| **Link** | [GitHub](https://github.com/erprogs/GenConViT) |
| **Created** | July 2023 |
| **Accuracy** | 95.8% avg. DFDC: 98.7%, FF++: 95.3%, Celeb-DF: 90.7% |
| **Drawbacks** | Face-swap only. NOT for fully AI-generated video |

---

#### FTCN / AltFreezing / TALL / STIL

| Model | Created | Venue | Key Idea |
|-------|---------|-------|----------|
| FTCN | Aug 2021 | ICCV 2021 | Spatial kernel=1, forces temporal-only learning |
| AltFreezing | 2023 | CVPR 2023 Highlight | Alternating freeze of spatial/temporal weights |
| TALL/TALL++ | 2023/2024 | ICCV 2023 / IJCV 2024 | Thumbnail grid layout enables 2D classifiers on temporal data |
| STIL | Sep 2021 | ACM MM 2021 | Plug-and-play spatial+temporal inconsistency modules |

All face-swap only. Not for fully AI-generated video.

---

#### Intel FakeCatcher

| Field | Details |
|-------|---------|
| **Type** | Commercial (limited) |
| **Created** | November 2022 |
| **Approach** | Unique — detects blood flow (PPG) in facial pixels. Synthetic faces lack PPG signals |
| **Accuracy** | Claims 96% |
| **Drawbacks** | Requires visible faces. PPG destroyed by heavy compression. Not generally available |

---

### Free SaaS / Consumer Tools

| Tool | Cost | Detects | Accuracy | Caveat |
|------|------|---------|----------|--------|
| [Treql](https://treql.com/) | Free | Sora, DALL-E 3, Flux, Midjourney, Runway, Pika | Claims 99.2% | Unverified |
| [ScreenApp](https://screenapp.io/features/ai-video-detector) | Free | Face swaps, lip-sync | Claims 95% | Deepfakes only, not fully AI-gen |
| [TruthScan](https://truthscan.com/) | $49.99+/mo | Broad | Claims 99%, tests show ~96% | Made by creators of Undetectable AI |
| [Deepware](https://scanner.deepware.ai/) | $8/mo | Face-swap | 80-85% | Low accuracy, face-swap only |
| [AIorNot](https://www.aiornot.com) | Free tier | Broad | Not disclosed | Limited documentation |
| [Attestiv](https://attestiv.com/) | Free 5/mo | Broad | Not disclosed | Very limited free tier |

---

### Research-Only (No Public Code)

| Tool | Status | Notable |
|------|--------|---------|
| OpenAI Internal Detector | Not public | 98.8% on DALL-E 3, only 5-10% on others |
| Microsoft Video Authenticator | Limited partners | 85-90%, aging (2020) |

---

### Benchmarks & Datasets

| Benchmark | Size | Generators | Year |
|-----------|------|------------|------|
| GenVidBench | 6.78M videos | 11 AI video generators | 2025 |
| GenVideo | 1M+ videos | Broad T2V/I2V | 2024 |
| VidProM | Large-scale | Multiple video generators | 2024-2025 |
| SAFE 2025 Challenge | Realistic | Unknown test models, varied quality | 2025 |
| FaceForensics++ | 1,000 videos x 5 methods | Face manipulation | 2019 |
| DFDC | 100k+ clips | Face-swap | 2020 |
| Celeb-DF v2 | 5,639 videos | DeepFake methods | 2020 |
| DRCT-2M | 2M images | 16 diffusion models | 2024 |
| DeepfakeBench | 36 methods, 9 datasets | Comprehensive | 2023-2025 |

---

## Quick Reference Table

| Tool | Type | Video-Native? | Fully AI-Gen? | Accuracy | Cost | Production? |
|------|------|:---:|:---:|----------|------|:---:|
| **ReStraV** | Open-source | Yes | Yes | 97.2% | Free | No |
| **DeMamba** | Open-source | Yes | Yes | SOTA GenVideo | Free | No |
| **UNITE** | Open-source | Yes | Yes | 95-99% | Free | No |
| **NVIDIA FOA** | Research | Yes | Yes | 1st SAFE 2025 | Free | No |
| **SightEngine** | API | Yes | Yes | 91.3% | $29+/mo | Yes |
| **Hive** | API | Yes | Yes | 85-93% | Enterprise | Yes |
| **Reality Defender** | API/SDK | Yes | Yes | 90-95% | Free 50/mo | Yes |
| **Sensity** | API | Yes | Yes | 95-98% | $29+/mo | Yes |
| **Deep Media** | API | Yes | Yes | N/A | Enterprise | Yes |
| **GenConViT** | Open-source | Yes | No (face) | 95.8% | Free | No |
| **DRCT** | Open-source | No (frame) | Yes | +10% | Free | No |
| **UnivFD** | Open-source | No (frame) | Yes | +15 mAP | Free | No |
| **Effort** | Open-source | No (frame) | Yes | Top bench | Free | No |
| **DistilDIRE** | Open-source | No (frame) | Yes | 99.0% | Free | No |
| **SynthID** | Watermark | Yes | Google only | Very high | Free | Google only |
| **Meta Video Seal** | Watermark | Yes | Marked only | High | Free (OSS) | Yes |
| **C2PA** | Provenance | Yes | Labeled only | 100% | Free | Yes |

---

## Key Takeaways

1. **"Deepfake detection" is not "AI-generated video detection."** Most tools before 2024 only handle face-swap. Only DeMamba, UNITE, ReStraV, NVIDIA FOA, and the commercial APIs handle fully synthetic video (Sora, Veo, Kling, etc.).

2. **Compression is the achilles heel.** Social media re-encoding destroys pixel-level forensic artifacts. NVIDIA FOA (wavelet-based, SAFE 2025 winner) is specifically designed for this. ReStraV's high-level representation approach is inherently more robust.

3. **Commercial accuracy claims are inflated.** Independent benchmarks (SAFE 2025) reveal more realistic performance. Hive's 25% false positive rate on art is a cautionary example.

4. **Watermarks are complementary, not substitutes.** SynthID only works on Google content. C2PA metadata stripped by every platform except LinkedIn. They cannot detect unlabeled AI content.

5. **ReStraV is the efficiency standout.** 48ms per video with 97%+ accuracy. Most practical open-source candidate for production.

6. **Baloney's current approach is outdated.** The ViT image model is from 2022, the RoBERTa text model was trained on GPT-2. Both are effectively blind to modern AI generators. Upgrading to Pangram (text) and SightEngine or a modern open-source model (image/video) would dramatically improve detection quality.
