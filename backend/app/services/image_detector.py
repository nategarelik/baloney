# backend/app/services/image_detector.py
# Hybrid: HuggingFace Inference API for CLIP + local FFT + EXIF analysis

import httpx
import numpy as np
import base64
import os
import io
import logging

from PIL import Image
from PIL.ExifTags import TAGS

logger = logging.getLogger(__name__)

HF_API = "https://api-inference.huggingface.co/models"


def _get_hf_token() -> str | None:
    return os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_KEY")


# ── CLIP via HuggingFace Inference API ────────────────────────────

async def clip_detect(image_bytes: bytes) -> dict:
    """Zero-shot CLIP classification via HF Inference API."""
    token = _get_hf_token()
    if not token:
        return {"clip_score": 0.5, "success": False, "error": "No HF token configured"}

    b64 = base64.b64encode(image_bytes).decode("utf-8")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "inputs": {"image": b64},
        "parameters": {
            "candidate_labels": [
                "a real photograph taken with a camera",
                "an AI generated synthetic digital image",
            ]
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(
                f"{HF_API}/openai/clip-vit-base-patch32",
                headers=headers,
                json=payload,
            )

            # Handle cold start (model loading on HF side)
            if resp.status_code == 503:
                import asyncio
                wait = resp.json().get("estimated_time", 20)
                await asyncio.sleep(min(wait, 30))
                resp = await client.post(
                    f"{HF_API}/openai/clip-vit-base-patch32",
                    headers=headers,
                    json=payload,
                    timeout=60.0,
                )

            resp.raise_for_status()
            result = resp.json()

            ai_score = 0.0
            for item in result:
                label = item.get("label", "")
                if "AI generated" in label or "synthetic" in label:
                    ai_score = item["score"]

            return {"clip_score": round(ai_score, 4), "success": True}
        except Exception as e:
            logger.error(f"CLIP API error: {e}")
            return {"clip_score": 0.5, "success": False, "error": str(e)}


# ── FFT Frequency Analysis (runs locally, no API) ────────────────

def frequency_analysis(image_bytes: bytes) -> dict:
    """
    AI-generated images have different frequency domain signatures.
    Diffusion models produce less high-frequency content.
    GANs produce spectral peaks from upsampling.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("L")  # Grayscale
        img = img.resize((256, 256))
        pixel_array = np.array(img, dtype=np.float32)

        # 2D FFT
        f_transform = np.fft.fft2(pixel_array)
        f_shift = np.fft.fftshift(f_transform)
        magnitude = np.log1p(np.abs(f_shift))

        # Radial average — compare low-freq vs high-freq energy
        center = np.array(magnitude.shape) // 2
        Y, X = np.ogrid[: magnitude.shape[0], : magnitude.shape[1]]
        distances = np.sqrt((X - center[1]) ** 2 + (Y - center[0]) ** 2)

        max_radius = int(np.max(distances))
        radial_profile = np.zeros(max_radius)
        for r in range(max_radius):
            mask = (distances >= r) & (distances < r + 1)
            if mask.any():
                radial_profile[r] = magnitude[mask].mean()

        # Split into low/mid/high frequency bands
        third = max_radius // 3
        low_energy = radial_profile[:third].mean() if third > 0 else 0
        mid_energy = radial_profile[third : 2 * third].mean() if third > 0 else 0
        high_energy = radial_profile[2 * third :].mean() if third > 0 else 0

        total_energy = low_energy + mid_energy + high_energy + 1e-9
        high_ratio = high_energy / total_energy

        # AI images tend to have LOWER high-frequency energy ratio
        # Real photos: high_ratio typically 0.15-0.30
        # AI images: high_ratio typically 0.05-0.15
        freq_ai_score = max(0, min(1, 1 - (high_ratio / 0.25)))

        # Spectral slope (steeper = more AI-like)
        if len(radial_profile) > 10:
            x = np.arange(len(radial_profile))
            slope = np.polyfit(x, radial_profile, 1)[0]
            slope_signal = max(0, min(1, abs(slope) / 0.15))
        else:
            slope_signal = 0.5

        combined = 0.6 * freq_ai_score + 0.4 * slope_signal

        return {
            "freq_ai_score": round(float(combined), 4),
            "high_freq_ratio": round(float(high_ratio), 4),
            "spectral_slope": round(float(slope_signal), 4),
            "success": True,
        }
    except Exception as e:
        logger.error(f"FFT analysis error: {e}")
        return {"freq_ai_score": 0.5, "success": False, "error": str(e)}


# ── EXIF Metadata Check (local, instant) ──────────────────────────

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

        signals = [has_camera, has_gps, has_exposure]
        real_signals = sum(signals)

        # More camera metadata = more likely real
        if real_signals >= 2:
            score = 0.15
        elif real_signals == 1:
            score = 0.35
        else:
            score = 0.6

        return {
            "exif_ai_score": round(score, 4),
            "has_camera_data": has_camera,
            "has_gps": has_gps,
            "has_exposure_data": has_exposure,
            "camera": str(tags.get("Make", "unknown")),
            "success": True,
        }
    except Exception:
        return {"exif_ai_score": 0.5, "has_camera_data": False, "success": False}


# ── Combined Image Detection ─────────────────────────────────────

async def detect_image(image_bytes: bytes) -> dict:
    """Ensemble of CLIP + FFT + EXIF for final image AI score."""
    # Run CLIP async, others sync
    clip_result = await clip_detect(image_bytes)
    fft_result = frequency_analysis(image_bytes)
    exif_result = check_exif(image_bytes)

    # Weighted ensemble
    clip_score = clip_result.get("clip_score", 0.5)
    fft_score = fft_result.get("freq_ai_score", 0.5)
    exif_score = exif_result.get("exif_ai_score", 0.5)

    # Adjust weights if CLIP failed
    if clip_result.get("success"):
        weights = {"clip": 0.50, "fft": 0.25, "exif": 0.25}
    else:
        weights = {"clip": 0.0, "fft": 0.55, "exif": 0.45}

    final = (
        weights["clip"] * clip_score
        + weights["fft"] * fft_score
        + weights["exif"] * exif_score
    )

    return {
        "ai_score": round(final, 4),
        "classification": (
            "ai_generated" if final > 0.60
            else "uncertain" if final > 0.35
            else "likely_real"
        ),
        "methods": {
            "clip": clip_result,
            "frequency": fft_result,
            "exif": exif_result,
        },
    }
