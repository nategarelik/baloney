# backend/app/main.py
# Baloney AI Detection API — Mac Studio Local Inference Backend
#
# Zero API dependency. All models run locally on Apple Silicon MPS.
# Text: 5-model ensemble (DeBERTa + 2x RoBERTa + MiniLM + Statistical)
# Image: 4-signal ensemble (ViT + SDXL-detector + FFT + EXIF)
# Phishing: 80+ feature extraction (unchanged)
#
# Endpoints:
#   POST /api/analyze          — Single text detection (full ensemble)
#   POST /api/analyze-batch    — Batch text detection
#   POST /api/analyze-image    — Image detection (file upload)
#   POST /api/analyze-image-b64 — Image detection (base64, used by frontend)
#   POST /api/detect-phishing  — Phishing classification
#   GET  /health               — Health check with model status

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import base64
import logging
import os
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load ALL models on startup for instant inference."""
    t0 = time.time()

    # Load text models (DeBERTa + RoBERTa-OpenAI + RoBERTa-ChatGPT + MiniLM)
    from app.services.text_detector import load_all_models as load_text_models
    logger.info("Loading text detection models (5-model ensemble)...")
    load_text_models()

    # Load image models (ViT + SDXL-detector)
    from app.services.image_detector import load_all_image_models
    logger.info("Loading image detection models (4-signal ensemble)...")
    load_all_image_models()

    total = time.time() - t0
    logger.info(f"All models loaded in {total:.1f}s. Ready for inference.")
    yield


app = FastAPI(
    title="Baloney Detection API",
    description="Self-hosted AI content detection — 9-model ensemble on Apple Silicon",
    version="2.0.0",
    lifespan=lifespan,
)

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("ALLOWED_ORIGINS", "https://baloney.app").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


# ── Request/Response Models ───────────────────────────────────────

class TextRequest(BaseModel):
    text: str
    url: str | None = None

class BatchTextRequest(BaseModel):
    texts: list[str]
    url: str | None = None

class ImageBase64Request(BaseModel):
    image: str  # base64 encoded image (with or without data URI prefix)

class PhishingRequest(BaseModel):
    html: str
    url: str | None = None


# ── Routes ────────────────────────────────────────────────────────

@app.get("/health")
def health():
    """Health check — confirms all models are loaded."""
    from app.services.text_detector import MODEL_ID as TEXT_MODEL, DEVICE as TEXT_DEVICE
    from app.services.image_detector import DEVICE as IMG_DEVICE

    return {
        "status": "ok",
        "version": "2.0.0",
        "text_model": TEXT_MODEL,
        "text_device": str(TEXT_DEVICE),
        "image_device": str(IMG_DEVICE),
        "models_loaded": {
            "text": [
                "deberta-v3-large (RAID #1)",
                "superannotate-ai-detector (14 LLMs, 98-99% acc)",
                "roberta-chatgpt (HC3 dataset)",
                "minilm-v2 (sentence embeddings)",
                "statistical (12 features)",
            ],
            "image": [
                "siglip-deepfake-v1 (94.44% acc)",
                "vit-deepfake-v2 (92.12% acc, 56k test)",
                "fft (spectral analysis)",
                "exif (metadata forensics)",
            ],
        },
        "total_models": 9,
    }


@app.post("/api/analyze")
def analyze_text(req: TextRequest):
    """
    Analyze text for AI generation using full 5-model ensemble.
    Returns per-model scores, ensemble final_score, and statistical features.
    """
    from app.services.text_detector import predict_text

    result = predict_text(req.text)

    return {
        "final_score": result["ai_probability"],
        "classification": result["classification"],
        "ml_detection": result,
        "statistical_analysis": result.get("statistical_analysis", {}),
        "text_length": len(req.text),
        "ensemble": True,
        "model_count": result["model_count"],
        "device": result["device"],
        "inference_ms": result["inference_ms"],
    }


@app.post("/api/analyze-batch")
def analyze_batch(req: BatchTextRequest):
    """Analyze multiple texts using the full ensemble."""
    from app.services.text_detector import predict_texts_batch
    results = predict_texts_batch(req.texts)
    return {"results": results, "count": len(results)}


@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """Analyze image for AI generation via file upload. Full 4-signal ensemble."""
    from app.services.image_detector import detect_image
    image_bytes = await file.read()
    result = detect_image(image_bytes)
    return result


@app.post("/api/analyze-image-b64")
def analyze_image_b64(req: ImageBase64Request):
    """
    Analyze image for AI generation via base64 input.
    Used by the Next.js frontend (sends base64 data URI).
    Full 4-signal local ensemble — no API calls.
    """
    from app.services.image_detector import detect_image

    # Strip data URI prefix if present
    image_data = req.image
    if "," in image_data:
        image_data = image_data.split(",", 1)[1]

    image_bytes = base64.b64decode(image_data)
    result = detect_image(image_bytes)
    return result


@app.post("/api/detect-phishing")
def detect_phishing(req: PhishingRequest):
    """Classify a webpage as phishing, suspicious, or legitimate."""
    from app.services.phishing_detector import classify_phishing
    result = classify_phishing(req.html, req.url or "")
    return result
