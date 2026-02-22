# backend/app/services/image_detector.py
# Baloney Image AI Detection — 4-Model Local Ensemble on Apple Silicon MPS
#
# Models (all run locally, zero API dependency):
#   1. ViT AI-image-detector  (umm-maybe/AI-image-detector) — ViT fine-tuned for AI images
#   2. SDXL Detector          (Organika/sdxl-detector) — SDXL/Midjourney/DALL-E 3 era
#   3. FFT Frequency Analysis — spectral domain artifact detection
#   4. EXIF Metadata Analysis — camera data forensics
#
# Designed for Mac Studio M2 Ultra with MPS acceleration.

import torch
import numpy as np
import io
import logging
import time

from PIL import Image
from PIL.ExifTags import TAGS
from transformers import AutoModelForImageClassification, AutoFeatureExtractor

logger = logging.getLogger(__name__)


# ── Device Selection ─────────────────────────────────────────────
def get_device() -> torch.device:
    if torch.backends.mps.is_available():
        return torch.device("mps")
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


DEVICE = get_device()
logger.info(f"Image detector using device: {DEVICE}")


# ── Model Registry ───────────────────────────────────────────────

IMAGE_MODEL_IDS = {
    "vit_ai_detector": "umm-maybe/AI-image-detector",
    "sdxl_detector": "Organika/sdxl-detector",
}

# Ensemble weights (sum to 1.0)
IMAGE_ENSEMBLE_WEIGHTS = {
    "vit": 0.35,
    "sdxl": 0.25,
    "fft": 0.22,
    "exif": 0.18,
}

# Singletons
_image_models: dict = {}
_feature_extractors: dict = {}


# ── Model Loading ────────────────────────────────────────────────

def load_all_image_models():
    """Load all image detection models into memory on the target device."""
    global _image_models, _feature_extractors

    # 1. ViT AI-image-detector
    if "vit" not in _image_models:
        mid = IMAGE_MODEL_IDS["vit_ai_detector"]
        logger.info(f"Loading {mid}...")
        t0 = time.time()
        _feature_extractors["vit"] = AutoFeatureExtractor.from_pretrained(mid)
        _image_models["vit"] = AutoModelForImageClassification.from_pretrained(mid)
        _image_models["vit"].eval().to(DEVICE)
        logger.info(f"  ViT AI-detector loaded in {time.time()-t0:.1f}s")

    # 2. SDXL Detector
    if "sdxl" not in _image_models:
        mid = IMAGE_MODEL_IDS["sdxl_detector"]
        logger.info(f"Loading {mid}...")
        t0 = time.time()
        _feature_extractors["sdxl"] = AutoFeatureExtractor.from_pretrained(mid)
        _image_models["sdxl"] = AutoModelForImageClassification.from_pretrained(mid)
        _image_models["sdxl"].eval().to(DEVICE)
        logger.info(f"  SDXL detector loaded in {time.time()-t0:.1f}s")

    logger.info("All image detection models loaded and ready.")


# ── Individual Model Predictions ─────────────────────────────────

def _predict_vit(pil_image: Image.Image) -> float:
    """ViT AI-image-detector: fine-tuned to detect AI-generated images. Returns AI probability 0-1."""
    model = _image_models["vit"]
    extractor = _feature_extractors["vit"]

    inputs = extractor(images=pil_image, return_tensors="pt")
    pixel_values = inputs["pixel_values"].to(DEVICE)

    with torch.no_grad():
        outputs = model(pixel_values=pixel_values)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=-1)

    # Find "artificial"/"Fake"/"LABEL_1" label
    labels = model.config.id2label
    ai_idx = None
    for idx, label in labels.items():
        if label.lower() in ("artificial", "fake", "label_1", "ai"):
            ai_idx = int(idx)
            break

    if ai_idx is not None:
        return probs[0][ai_idx].item()

    # Invert human label
    for idx, label in labels.items():
        if label.lower() in ("human", "real", "label_0"):
            return 1.0 - probs[0][int(idx)].item()

    return probs[0][-1].item()


def _predict_sdxl(pil_image: Image.Image) -> float:
    """SDXL/Midjourney/DALL-E 3 detector. Returns AI probability 0-1."""
    model = _image_models["sdxl"]
    extractor = _feature_extractors["sdxl"]

    inputs = extractor(images=pil_image, return_tensors="pt")
    pixel_values = inputs["pixel_values"].to(DEVICE)

    with torch.no_grad():
        outputs = model(pixel_values=pixel_values)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=-1)

    labels = model.config.id2label
    ai_idx = None
    for idx, label in labels.items():
        if label.lower() in ("artificial", "fake", "label_1", "ai"):
            ai_idx = int(idx)
            break

    if ai_idx is not None:
        return probs[0][ai_idx].item()

    for idx, label in labels.items():
        if label.lower() in ("human", "real", "label_0"):
            return 1.0 - probs[0][int(idx)].item()

    return probs[0][-1].item()


# ── FFT Frequency Analysis (local, instant) ─────────────────────

def frequency_analysis(image_bytes: bytes) -> dict:
    """
    AI-generated images have different frequency domain signatures.
    Multi-signal analysis: radial FFT profile + spectral slope + DCT blocks.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("L")
        img = img.resize((256, 256))
        pixel_array = np.array(img, dtype=np.float32)

        # 2D FFT
        f_transform = np.fft.fft2(pixel_array)
        f_shift = np.fft.fftshift(f_transform)
        magnitude = np.log1p(np.abs(f_shift))

        # Radial average profile
        center = np.array(magnitude.shape) // 2
        Y, X = np.ogrid[: magnitude.shape[0], : magnitude.shape[1]]
        distances = np.sqrt((X - center[1]) ** 2 + (Y - center[0]) ** 2)
        max_radius = int(np.max(distances))
        radial_profile = np.zeros(max_radius)
        for r in range(max_radius):
            mask = (distances >= r) & (distances < r + 1)
            if mask.any():
                radial_profile[r] = magnitude[mask].mean()

        # Low/mid/high frequency bands
        third = max_radius // 3
        low_energy = radial_profile[:third].mean() if third > 0 else 0
        mid_energy = radial_profile[third : 2 * third].mean() if third > 0 else 0
        high_energy = radial_profile[2 * third :].mean() if third > 0 else 0
        total_energy = low_energy + mid_energy + high_energy + 1e-9
        high_ratio = high_energy / total_energy

        # AI images have LOWER high-frequency energy
        freq_ai_score = max(0, min(1, 1 - (high_ratio / 0.25)))

        # Spectral slope (steeper = more AI-like)
        if len(radial_profile) > 10:
            x = np.arange(len(radial_profile))
            slope = np.polyfit(x, radial_profile, 1)[0]
            slope_signal = max(0, min(1, abs(slope) / 0.15))
        else:
            slope_signal = 0.5

        # DCT-like block analysis on pixel data
        flat = pixel_array.flatten() / 255.0
        block_size = 64
        local_vars = []
        for i in range(0, len(flat) - block_size, block_size):
            block = flat[i:i+block_size]
            local_vars.append(np.var(block))

        if local_vars:
            avg_var = np.mean(local_vars)
            var_of_var = np.var(local_vars)
            uniformity_signal = max(0, min(1, 1 - var_of_var * 1000))
        else:
            uniformity_signal = 0.5

        combined = 0.45 * freq_ai_score + 0.30 * slope_signal + 0.25 * uniformity_signal

        return {
            "freq_ai_score": round(float(combined), 4),
            "high_freq_ratio": round(float(high_ratio), 4),
            "spectral_slope": round(float(slope_signal), 4),
            "block_uniformity": round(float(uniformity_signal), 4),
            "success": True,
        }
    except Exception as e:
        logger.error(f"FFT analysis error: {e}")
        return {"freq_ai_score": 0.5, "success": False, "error": str(e)}


# ── EXIF Metadata Check (local, instant) ────────────────────────

def check_exif(image_bytes: bytes) -> dict:
    """Real photos have camera EXIF data. AI images usually don't."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif_data = img._getexif()

        if exif_data is None:
            return {
                "exif_ai_score": 0.7,
                "has_camera_data": False,
                "reason": "No EXIF data",
                "success": True,
            }

        tags = {TAGS.get(k, k): v for k, v in exif_data.items()}

        has_camera = bool(tags.get("Make") or tags.get("Model"))
        has_gps = "GPSInfo" in tags
        has_exposure = bool(tags.get("ExposureTime") or tags.get("FNumber"))
        has_datetime = bool(tags.get("DateTime") or tags.get("DateTimeOriginal"))

        signals = [has_camera, has_gps, has_exposure, has_datetime]
        real_signals = sum(signals)

        if real_signals >= 3:
            score = 0.10
        elif real_signals >= 2:
            score = 0.20
        elif real_signals == 1:
            score = 0.35
        else:
            score = 0.6

        return {
            "exif_ai_score": round(score, 4),
            "has_camera_data": has_camera,
            "has_gps": has_gps,
            "has_exposure_data": has_exposure,
            "has_datetime": has_datetime,
            "camera": str(tags.get("Make", "unknown")),
            "model": str(tags.get("Model", "unknown")),
            "success": True,
        }
    except Exception:
        return {"exif_ai_score": 0.5, "has_camera_data": False, "success": False}


# ── Combined Image Detection ───────────────────────────────────

def detect_image(image_bytes: bytes) -> dict:
    """
    Full 4-signal ensemble image detection. All local, no API calls.
    Returns detailed result with per-method scores and final ensemble score.
    """
    t0 = time.time()

    # Open image once, reuse
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Run ML models
    vit_score = _predict_vit(pil_image)
    sdxl_score = _predict_sdxl(pil_image)

    # Run signal analysis
    fft_result = frequency_analysis(image_bytes)
    exif_result = check_exif(image_bytes)

    fft_score = fft_result.get("freq_ai_score", 0.5)
    exif_score = exif_result.get("exif_ai_score", 0.5)

    # Weighted ensemble
    w = IMAGE_ENSEMBLE_WEIGHTS

    # Confidence-aware weighting for ML classifiers
    vit_confidence = abs(vit_score - 0.5) * 2
    sdxl_confidence = abs(sdxl_score - 0.5) * 2
    conf_total = vit_confidence + sdxl_confidence + 0.001

    vit_w = w["vit"] * (0.5 + vit_confidence / conf_total * 0.5)
    sdxl_w = w["sdxl"] * (0.5 + sdxl_confidence / conf_total * 0.5)
    total_w = vit_w + sdxl_w + w["fft"] + w["exif"]

    final_score = (
        vit_score * vit_w +
        sdxl_score * sdxl_w +
        fft_score * w["fft"] +
        exif_score * w["exif"]
    ) / total_w

    # Agreement bonus
    if (vit_score > 0.7 and sdxl_score > 0.7) or (vit_score < 0.3 and sdxl_score < 0.3):
        classifier_avg = (vit_score + sdxl_score) / 2
        final_score = final_score * 0.85 + classifier_avg * 0.15

    final_score = round(float(np.clip(final_score, 0, 1)), 4)
    duration_ms = round((time.time() - t0) * 1000)

    # Classification
    if final_score > 0.60:
        classification = "ai_generated"
    elif final_score > 0.35:
        classification = "uncertain"
    else:
        classification = "likely_real"

    return {
        "ai_score": final_score,
        "classification": classification,
        "model": "ensemble:vit-ai-detector+sdxl-detector+fft+exif",
        "model_count": 4,
        "device": str(DEVICE),
        "inference_ms": duration_ms,
        "methods": {
            "vit_ai_detector": {
                "score": round(vit_score, 4),
                "model": IMAGE_MODEL_IDS["vit_ai_detector"],
                "weight": round(vit_w / total_w, 3),
            },
            "sdxl_detector": {
                "score": round(sdxl_score, 4),
                "model": IMAGE_MODEL_IDS["sdxl_detector"],
                "weight": round(sdxl_w / total_w, 3),
            },
            "frequency": {
                **fft_result,
                "weight": round(w["fft"] / total_w, 3),
            },
            "exif": {
                **exif_result,
                "weight": round(w["exif"] / total_w, 3),
            },
        },
        "agreement": {
            "classifiers_agree": (vit_score > 0.7 and sdxl_score > 0.7) or (vit_score < 0.3 and sdxl_score < 0.3),
            "vit_confident": vit_confidence > 0.6,
            "sdxl_confident": sdxl_confidence > 0.6,
        },
    }
