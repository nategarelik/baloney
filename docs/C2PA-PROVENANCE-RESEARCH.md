# C2PA and Content Provenance Research Report

**Date:** 2026-03-22
**Status:** Research complete, integration plan ready

---

## Executive Summary

C2PA is at spec v2.2. The ecosystem is maturing -- 5,000+ CAI members, Pixel 10 and Galaxy S25 signing natively, Cloudflare preserving credentials across 20% of web properties, and EU AI Act + CA SB 942 mandates hitting August 2026. Baloney's current implementation is a lightweight JUMBF byte scanner that detects manifest *presence* but does not validate signatures, parse trust chains, or detect soft binding watermarks. Clear upgrade path using mature open-source libraries.

---

## Key Finding: The Stripping Problem

>95% of social media platforms strip C2PA metadata on upload (Instagram, Facebook, X, YouTube, LinkedIn, Pinterest, Threads). Only Cloudflare Images preserves credentials. This makes **soft binding** (invisible watermarks that survive re-encoding) the critical technology.

---

## Integration Roadmap

### Phase 1: Quick Wins (1-2 weeks)

**A. Server-side C2PA validation** -- Replace JUMBF byte scanner with `c2pa-node-v2`:
- Cryptographic signature validation, trust chain checking, signer identification
- Cost: Free (MIT). Impact: "presence detection" -> "cryptographic validation"

**B. Browser C2PA validation** -- `@contentauth/c2pa-web` (WASM) in Chrome extension:
- Validates manifests *before* social media strips them
- Works on news sites, photographer portfolios, direct camera uploads

### Phase 2: Soft Binding Detection (2-4 weeks)

**Adobe TrustMark** (MIT license, most practical):
- Encodes 100-bit payload into images, survives re-encoding
- Python server-side decoder + ONNX browser decoder
- When detected, payload looks up original C2PA manifest from repository

### Phase 3: Multi-Watermark Detection (1-2 months)

- **Meta Seal** (MIT): PixelSeal, VideoSeal, AudioSeal, TextSeal -- detects Meta AI content
- **SynthID** upgrade: production detector (currently using dummy model)
- Each watermark system only detects its own marks -- ensemble is essential

### Phase 4: Provenance Score (2-3 months)

Two-dimensional signal: "How likely is this AI?" AND "How strong is the provenance chain?"
- C2PA valid signature + trusted signer = high provenance
- Soft binding watermark detected = moderate provenance
- SynthID/Meta Seal watermark = high AI confidence
- Camera EXIF + device attestation = high authenticity

---

## Key Libraries

| Library | Language | Purpose | License |
|---------|----------|---------|---------|
| c2pa-rs | Rust | Core SDK | MIT |
| c2pa-node-v2 | Node.js | Server-side validation | MIT |
| c2pa-web (WASM) | TypeScript | Browser validation | MIT |
| c2pa-python | Python | FastAPI backend | MIT |
| @trustnxt/c2pa-ts | Pure TypeScript | No-WASM alternative | Apache 2.0 |
| Adobe TrustMark | Python/JS/Rust | Soft binding watermark | MIT |
| Meta Seal | Python | Multi-modal watermark detection | MIT |

---

## Regulatory Context

**EU AI Act Article 50** (August 2, 2026): Providers must mark AI content in machine-readable format. C2PA is the de facto standard.

**California SB 942** (August 2, 2026): Requires hidden watermarks with provider name + timestamp + unique ID in AI-generated image/video/audio. Must provide free detection tool. $5,000/day/violation.

Baloney aligns perfectly as a compliance verification tool.

---

## Accuracy Assessment

| Method | Reliability | Coverage |
|--------|-------------|----------|
| C2PA manifest validation | Very High (cryptographic) | Low (~5% of social media content) |
| Soft binding (TrustMark) | Moderate-High | Growing (needs adoption) |
| SynthID Image | High | Google AI content only |
| Meta Seal | High | Meta AI content only |
| ML detection (SightEngine) | High (98.3%) | Universal |
| Statistical analysis | Low-Moderate | Universal |

**The fundamental limitation:** No single method provides universal coverage. The ensemble approach is correct -- provenance signals are additional inputs, not replacements for ML/statistical detection.

---

## Sources

- [C2PA Spec v2.2](https://spec.c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification.html)
- [c2pa-rs](https://github.com/contentauth/c2pa-rs) | [c2pa-node-v2](https://github.com/contentauth/c2pa-node-v2) | [c2pa-js](https://github.com/contentauth/c2pa-js)
- [Adobe TrustMark](https://github.com/adobe/trustmark) | [Meta Seal](https://github.com/facebookresearch/meta-seal)
- [Cloudflare Content Credentials](https://blog.cloudflare.com/preserve-content-credentials-with-cloudflare-images/)
- [Google Pixel 10 C2PA](https://security.googleblog.com/2025/09/pixel-android-trusted-images-c2pa-content-credentials.html)
- [EU AI Act Article 50](https://artificialintelligenceact.eu/article/50/) | [CA SB 942](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB942)
