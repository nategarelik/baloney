"""
Baloney SynthID Text Watermark Detection Backend
Detects Google Gemini SynthID watermarks in text using HuggingFace Transformers.
Runs on Railway as a FastAPI service.
"""

import os
import logging
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("synthid-backend")

app = FastAPI(title="Baloney SynthID Text Detector", version="1.0.0")

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("ALLOWED_ORIGINS", "https://baloney.app").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# Global detector state
detector = None
tokenizer = None
detector_loaded = False
load_error = None


def load_detector():
    """Load the SynthID Text detector model on startup."""
    global detector, tokenizer, detector_loaded, load_error
    try:
        from transformers import (
            AutoTokenizer,
            BayesianDetectorModel,
            SynthIDTextWatermarkLogitsProcessor,
            SynthIDTextWatermarkDetector,
        )

        logger.info("Loading SynthID Text detector model...")

        # Load the dummy detector for demo purposes
        # In production, use a privately trained detector with real Gemini keys
        detector_model = BayesianDetectorModel.from_pretrained(
            "joaogante/dummy_synthid_detector"
        )

        logits_processor = SynthIDTextWatermarkLogitsProcessor(
            **detector_model.config.watermarking_config, device="cpu"
        )

        # The detector config references google/gemma-2b-it (gated model).
        # Try with HF_TOKEN first, fall back to a compatible ungated tokenizer.
        model_name = detector_model.config.model_name
        hf_token = os.environ.get("HF_TOKEN")
        try:
            tok = AutoTokenizer.from_pretrained(model_name, token=hf_token)
        except Exception as tok_err:
            logger.warning(f"Cannot load {model_name} tokenizer ({tok_err}), using ungated fallback")
            # google/gemma-2b uses the same tokenizer but may also be gated
            # Use a publicly available sentencepiece tokenizer as fallback
            tok = AutoTokenizer.from_pretrained("TinyLlama/TinyLlama-1.1B-Chat-v1.0")

        det = SynthIDTextWatermarkDetector(detector_model, logits_processor, tok)

        detector = det
        tokenizer = tok
        detector_loaded = True
        logger.info("SynthID Text detector loaded successfully")

    except Exception as e:
        load_error = str(e)
        logger.error(f"Failed to load SynthID detector: {e}")


class TextRequest(BaseModel):
    text: str


class SynthIDResponse(BaseModel):
    synthid_detected: str  # "watermarked" | "not_watermarked" | "uncertain"
    raw_score: float
    model_loaded: bool


@app.on_event("startup")
async def startup():
    load_detector()


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "detector_loaded": detector_loaded,
        "load_error": load_error,
    }


@app.post("/api/synthid-text", response_model=SynthIDResponse)
async def detect_synthid(request: TextRequest):
    if not detector_loaded or detector is None or tokenizer is None:
        # Return uncertain when detector isn't available
        return SynthIDResponse(
            synthid_detected="uncertain",
            raw_score=0.5,
            model_loaded=False,
        )

    try:
        inputs = tokenizer(
            [request.text[:5000]],
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512,
        )

        # Returns posterior probability of watermark
        score = detector(inputs.input_ids)
        raw_score = float(score[0].detach()) if hasattr(score, "__getitem__") else float(score.detach() if isinstance(score, torch.Tensor) else score)

        # Threshold into three states
        if raw_score > 0.7:
            result = "watermarked"
        elif raw_score < 0.3:
            result = "not_watermarked"
        else:
            result = "uncertain"

        return SynthIDResponse(
            synthid_detected=result,
            raw_score=raw_score,
            model_loaded=True,
        )

    except Exception as e:
        logger.error(f"SynthID detection error: {e}")
        return SynthIDResponse(
            synthid_detected="uncertain",
            raw_score=0.5,
            model_loaded=True,
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
