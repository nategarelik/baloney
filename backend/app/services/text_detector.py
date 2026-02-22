# backend/app/services/text_detector.py
# Baloney Text AI Detection — 5-Model Local Ensemble on Apple Silicon MPS
#
# Models (all run locally, zero API dependency):
#   1. DeBERTa-v3-large  (desklib/ai-text-detector-v1.01) — RAID Benchmark #1
#   2. RoBERTa-base      (openai-community/roberta-base-openai-detector) — GPT-2 era
#   3. RoBERTa-ChatGPT   (Hello-SimpleAI/chatgpt-detector-roberta) — ChatGPT/GPT-4 era
#   4. MiniLM Embeddings (sentence-transformers/all-MiniLM-L6-v2) — sentence uniformity
#   5. Statistical        (burstiness, TTR, transition words, etc.) — 12-feature analysis
#
# Designed for Mac Studio M2 Ultra with MPS acceleration.
# Total VRAM: ~3.5GB for all models loaded simultaneously.

import torch
import torch.nn as nn
import numpy as np
from transformers import (
    AutoTokenizer,
    AutoConfig,
    AutoModel,
    AutoModelForSequenceClassification,
    PreTrainedModel,
)
from sentence_transformers import SentenceTransformer
import logging
import time

logger = logging.getLogger(__name__)


# ── Device Selection ─────────────────────────────────────────────
def get_device() -> torch.device:
    """Select best available device: MPS (Apple Silicon) > CUDA > CPU."""
    if torch.backends.mps.is_available():
        return torch.device("mps")
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


DEVICE = get_device()
logger.info(f"Text detector using device: {DEVICE}")


# ── Custom DeBERTa model class (required by Desklib checkpoint) ──
class DesklibAIDetectionModel(PreTrainedModel):
    config_class = AutoConfig

    def __init__(self, config):
        super().__init__(config)
        self.model = AutoModel.from_config(config)
        self.classifier = nn.Linear(config.hidden_size, 1)
        self.init_weights()

    def forward(self, input_ids, attention_mask=None, labels=None):
        outputs = self.model(input_ids, attention_mask=attention_mask)
        last_hidden_state = outputs[0]
        mask_expanded = attention_mask.unsqueeze(-1).expand(last_hidden_state.size()).float()
        sum_embeddings = torch.sum(last_hidden_state * mask_expanded, dim=1)
        sum_mask = torch.clamp(mask_expanded.sum(dim=1), min=1e-9)
        pooled = sum_embeddings / sum_mask
        logits = self.classifier(pooled)
        return {"logits": logits}


# ── Model Registry ───────────────────────────────────────────────

MODEL_IDS = {
    "deberta": "desklib/ai-text-detector-v1.01",
    "roberta_openai": "openai-community/roberta-base-openai-detector",
    "roberta_chatgpt": "Hello-SimpleAI/chatgpt-detector-roberta",
    "minilm": "sentence-transformers/all-MiniLM-L6-v2",
}

# Ensemble weights (sum to 1.0)
ENSEMBLE_WEIGHTS = {
    "deberta": 0.35,        # RAID #1 — strongest single signal
    "roberta_openai": 0.15, # GPT-2 era coverage
    "roberta_chatgpt": 0.15,# ChatGPT/GPT-4 era coverage
    "embeddings": 0.10,     # Sentence uniformity analysis
    "statistical": 0.25,    # 12-feature linguistic analysis
}

# Singletons
_models: dict = {}
_tokenizers: dict = {}
_sentence_model: SentenceTransformer | None = None


# ── Model Loading ────────────────────────────────────────────────

def load_all_models():
    """Load all text detection models into memory on the target device."""
    global _models, _tokenizers, _sentence_model

    # 1. DeBERTa (custom architecture)
    if "deberta" not in _models:
        mid = MODEL_IDS["deberta"]
        logger.info(f"Loading {mid}...")
        t0 = time.time()
        _tokenizers["deberta"] = AutoTokenizer.from_pretrained(mid)
        _models["deberta"] = DesklibAIDetectionModel.from_pretrained(mid)
        _models["deberta"].eval().to(DEVICE)
        logger.info(f"  DeBERTa loaded in {time.time()-t0:.1f}s ({sum(p.numel() for p in _models['deberta'].parameters()):,} params)")

    # 2. RoBERTa OpenAI (standard sequence classification)
    if "roberta_openai" not in _models:
        mid = MODEL_IDS["roberta_openai"]
        logger.info(f"Loading {mid}...")
        t0 = time.time()
        _tokenizers["roberta_openai"] = AutoTokenizer.from_pretrained(mid)
        _models["roberta_openai"] = AutoModelForSequenceClassification.from_pretrained(mid)
        _models["roberta_openai"].eval().to(DEVICE)
        logger.info(f"  RoBERTa-OpenAI loaded in {time.time()-t0:.1f}s")

    # 3. RoBERTa ChatGPT detector
    if "roberta_chatgpt" not in _models:
        mid = MODEL_IDS["roberta_chatgpt"]
        logger.info(f"Loading {mid}...")
        t0 = time.time()
        _tokenizers["roberta_chatgpt"] = AutoTokenizer.from_pretrained(mid)
        _models["roberta_chatgpt"] = AutoModelForSequenceClassification.from_pretrained(mid)
        _models["roberta_chatgpt"].eval().to(DEVICE)
        logger.info(f"  RoBERTa-ChatGPT loaded in {time.time()-t0:.1f}s")

    # 4. MiniLM Sentence Embeddings
    if _sentence_model is None:
        mid = MODEL_IDS["minilm"]
        logger.info(f"Loading {mid}...")
        t0 = time.time()
        _sentence_model = SentenceTransformer(mid, device=str(DEVICE))
        logger.info(f"  MiniLM loaded in {time.time()-t0:.1f}s")

    logger.info("All text detection models loaded and ready.")


def load_model():
    """Backward-compatible entry point. Loads all models."""
    load_all_models()
    return _models.get("deberta"), _tokenizers.get("deberta")


MODEL_ID = "ensemble:deberta+roberta-openai+roberta-chatgpt+minilm+statistical"


# ── Individual Model Predictions ─────────────────────────────────

def _predict_deberta(text: str, max_len: int = 768) -> float:
    """DeBERTa-v3-large: RAID Benchmark #1. Returns AI probability 0-1."""
    model = _models["deberta"]
    tokenizer = _tokenizers["deberta"]

    encoded = tokenizer(
        text, padding="max_length", truncation=True,
        max_length=max_len, return_tensors="pt",
    )
    input_ids = encoded["input_ids"].to(DEVICE)
    attention_mask = encoded["attention_mask"].to(DEVICE)

    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs["logits"]
        probability = torch.sigmoid(logits).item()

    return probability


def _predict_roberta_openai(text: str) -> float:
    """RoBERTa fine-tuned on GPT-2 outputs. Returns AI probability 0-1."""
    model = _models["roberta_openai"]
    tokenizer = _tokenizers["roberta_openai"]

    encoded = tokenizer(
        text[:2000], padding=True, truncation=True,
        max_length=512, return_tensors="pt",
    )
    input_ids = encoded["input_ids"].to(DEVICE)
    attention_mask = encoded["attention_mask"].to(DEVICE)

    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=-1)

    # Label mapping: typically "Fake" is index 0 or 1
    # This model: LABEL_0 = Real, LABEL_1 = Fake
    labels = model.config.id2label
    fake_idx = None
    for idx, label in labels.items():
        if label in ("Fake", "LABEL_1"):
            fake_idx = int(idx)
            break

    if fake_idx is not None:
        return probs[0][fake_idx].item()
    # Fallback: assume last class is "Fake"
    return probs[0][-1].item()


def _predict_roberta_chatgpt(text: str) -> float:
    """RoBERTa fine-tuned on ChatGPT outputs (HC3 dataset). Returns AI probability 0-1."""
    model = _models["roberta_chatgpt"]
    tokenizer = _tokenizers["roberta_chatgpt"]

    encoded = tokenizer(
        text[:2000], padding=True, truncation=True,
        max_length=512, return_tensors="pt",
    )
    input_ids = encoded["input_ids"].to(DEVICE)
    attention_mask = encoded["attention_mask"].to(DEVICE)

    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=-1)

    # This model: "ChatGPT" or "LABEL_1" = AI-generated
    labels = model.config.id2label
    ai_idx = None
    for idx, label in labels.items():
        if label in ("ChatGPT", "Fake", "LABEL_1"):
            ai_idx = int(idx)
            break

    if ai_idx is not None:
        return probs[0][ai_idx].item()

    # If we find "Human" label, invert it
    for idx, label in labels.items():
        if label in ("Human", "Real", "LABEL_0"):
            return 1.0 - probs[0][int(idx)].item()

    return probs[0][-1].item()


def _embedding_analysis(text: str) -> float:
    """
    Sentence embedding uniformity analysis using MiniLM.
    AI text has lower inter-sentence distance variance (more uniform).
    Returns AI probability 0-1.
    """
    import re
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 10]

    if len(sentences) < 2:
        return 0.5

    # Sample up to 20 sentences uniformly
    max_sentences = 20
    if len(sentences) > max_sentences:
        step = len(sentences) / max_sentences
        sentences = [sentences[min(int(i * step), len(sentences) - 1)] for i in range(max_sentences)]

    # Get embeddings (runs on MPS via sentence-transformers)
    embeddings = _sentence_model.encode(sentences, convert_to_numpy=True, show_progress_bar=False)

    if len(embeddings) < 2:
        return 0.5

    # Compute cosine similarities between consecutive sentences
    from numpy.linalg import norm

    consecutive_dists = []
    for i in range(len(embeddings) - 1):
        a, b = embeddings[i], embeddings[i + 1]
        cos_sim = np.dot(a, b) / (norm(a) * norm(b) + 1e-9)
        consecutive_dists.append(1 - cos_sim)  # distance

    avg_dist = np.mean(consecutive_dists)
    dist_std = np.std(consecutive_dists)
    dist_var = np.var(consecutive_dists)

    # Skip-1 distances (non-adjacent sentences)
    skip_dists = []
    for i in range(0, len(embeddings) - 2, 2):
        a, b = embeddings[i], embeddings[i + 2]
        cos_sim = np.dot(a, b) / (norm(a) * norm(b) + 1e-9)
        skip_dists.append(1 - cos_sim)
    avg_skip_dist = np.mean(skip_dists) if skip_dists else avg_dist

    # AI signals (higher = more AI-like)
    uniformity = np.clip(1 - avg_dist * 2, 0, 1)      # Low distance = uniform = AI
    consistency = np.clip(1 - dist_var * 10, 0, 1)     # Low variance = rigid = AI
    rigidity = np.clip(1 - dist_std * 5, 0, 1)         # Low std = rigid = AI
    long_range = np.clip(1 - avg_skip_dist * 2, 0, 1)  # High coherence across gaps = AI

    score = (
        uniformity * 0.35 +
        consistency * 0.25 +
        rigidity * 0.20 +
        long_range * 0.20
    )

    return float(np.clip(score, 0, 1))


# ── Full Ensemble Prediction ────────────────────────────────────

def predict_text(text: str) -> dict:
    """
    Full 5-model ensemble prediction.
    Returns detailed result with per-model scores and final ensemble score.
    """
    from app.services.statistical_features import compute_statistical_features

    t0 = time.time()

    # Run all models
    deberta_score = _predict_deberta(text)
    roberta_openai_score = _predict_roberta_openai(text)
    roberta_chatgpt_score = _predict_roberta_chatgpt(text)
    embedding_score = _embedding_analysis(text)
    stat_result = compute_statistical_features(text)
    stat_score = stat_result.get("stat_ai_score", 0.5)

    # Ensemble with calibrated weights
    w = ENSEMBLE_WEIGHTS

    # Adjust weights if text is short (< 200 chars) — reduce embedding weight
    if len(text) < 200:
        effective_w = {
            "deberta": 0.40,
            "roberta_openai": 0.18,
            "roberta_chatgpt": 0.18,
            "embeddings": 0.04,  # Embeddings unreliable on short text
            "statistical": 0.20,
        }
    elif not stat_result.get("sufficient_text"):
        effective_w = {
            "deberta": 0.40,
            "roberta_openai": 0.18,
            "roberta_chatgpt": 0.18,
            "embeddings": 0.14,
            "statistical": 0.10,
        }
    else:
        effective_w = w

    final_score = (
        effective_w["deberta"] * deberta_score +
        effective_w["roberta_openai"] * roberta_openai_score +
        effective_w["roberta_chatgpt"] * roberta_chatgpt_score +
        effective_w["embeddings"] * embedding_score +
        effective_w["statistical"] * stat_score
    )

    # Agreement bonus: if all 3 transformer models agree strongly, boost confidence
    transformer_scores = [deberta_score, roberta_openai_score, roberta_chatgpt_score]
    all_high = all(s > 0.7 for s in transformer_scores)
    all_low = all(s < 0.3 for s in transformer_scores)
    if all_high or all_low:
        avg_transformers = sum(transformer_scores) / 3
        final_score = final_score * 0.85 + avg_transformers * 0.15

    # Short text penalty — pull toward 0.5
    if len(text) < 200:
        length_factor = len(text) / 200
        final_score = 0.5 + (final_score - 0.5) * length_factor

    final_score = round(float(np.clip(final_score, 0, 1)), 4)
    duration_ms = round((time.time() - t0) * 1000)

    # Classification
    if final_score >= 0.65:
        classification = "ai_generated"
        confidence_level = "high" if final_score > 0.80 else "medium"
    elif final_score >= 0.35:
        classification = "mixed_or_uncertain"
        confidence_level = "low"
    else:
        classification = "likely_human"
        confidence_level = "high" if final_score < 0.20 else "medium"

    return {
        "ai_probability": final_score,
        "classification": classification,
        "confidence_level": confidence_level,
        "model": MODEL_ID,
        "model_count": 5,
        "device": str(DEVICE),
        "inference_ms": duration_ms,
        "method_scores": {
            "deberta_raid1": round(deberta_score, 4),
            "roberta_openai_gpt2": round(roberta_openai_score, 4),
            "roberta_chatgpt": round(roberta_chatgpt_score, 4),
            "embedding_uniformity": round(embedding_score, 4),
            "statistical_12feature": round(stat_score, 4),
        },
        "weights_used": effective_w,
        "agreement": {
            "transformers_agree": all_high or all_low,
            "direction": "ai" if all_high else "human" if all_low else "mixed",
        },
        "statistical_analysis": stat_result,
    }


def predict_texts_batch(texts: list[str], max_len: int = 768) -> list[dict]:
    """Predict multiple texts using the full ensemble."""
    results = []
    for text in texts:
        result = predict_text(text)
        results.append({
            "text_preview": text[:100] + "..." if len(text) > 100 else text,
            "ai_probability": result["ai_probability"],
            "classification": result["classification"],
            "method_scores": result["method_scores"],
            "inference_ms": result["inference_ms"],
        })
    return results
