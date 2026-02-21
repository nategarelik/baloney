# backend/app/main.py
# Baloney AI Detection API — FastAPI backend for Railway deployment
# Self-hosts DeBERTa-v3-large (#1 on RAID benchmark) for text detection
# Uses HuggingFace Inference API for CLIP image classification

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load DeBERTa model on startup so first request isn't slow."""
    from app.services.text_detector import load_model

    logger.info("Pre-loading DeBERTa AI detection model...")
    load_model()
    logger.info("Model ready. Accepting requests.")
    yield


app = FastAPI(
    title="Baloney Detection API",
    description="Self-hosted AI content detection backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response Models ───────────────────────────────────────

class TextRequest(BaseModel):
    text: str
    url: str | None = None

class BatchTextRequest(BaseModel):
    texts: list[str]
    url: str | None = None


# ── Routes ────────────────────────────────────────────────────────

@app.get("/health")
def health():
    """Health check — confirms model is loaded."""
    from app.services.text_detector import MODEL_ID
    return {"status": "ok", "model": MODEL_ID}


@app.post("/api/analyze")
def analyze_text(req: TextRequest):
    """
    Analyze text for AI generation.
    Returns ML score (DeBERTa) + statistical features, combined into final_score.
    """
    from app.services.text_detector import predict_text
    from app.services.statistical_features import compute_statistical_features

    ml_result = predict_text(req.text)
    stat_result = compute_statistical_features(req.text)

    # Ensemble: 75% ML (RAID #1 model), 25% statistical
    ml_score = ml_result["ai_probability"]
    stat_score = stat_result.get("stat_ai_score", ml_score)

    if stat_result.get("sufficient_text"):
        final = 0.75 * ml_score + 0.25 * stat_score
    else:
        final = ml_score

    return {
        "final_score": round(final, 4),
        "classification": (
            "ai_generated" if final >= 0.65
            else "mixed_or_uncertain" if final >= 0.35
            else "likely_human"
        ),
        "ml_detection": ml_result,
        "statistical_analysis": stat_result,
        "text_length": len(req.text),
    }


@app.post("/api/analyze-batch")
def analyze_batch(req: BatchTextRequest):
    """Analyze multiple texts in one request."""
    from app.services.text_detector import predict_texts_batch
    results = predict_texts_batch(req.texts)
    return {"results": results, "count": len(results)}


@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze image for AI generation.
    Ensemble: CLIP (HF API) + FFT frequency analysis + EXIF metadata.
    """
    from app.services.image_detector import detect_image
    image_bytes = await file.read()
    result = await detect_image(image_bytes)
    return result
