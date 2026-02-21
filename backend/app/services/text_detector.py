# backend/app/services/text_detector.py
# Self-hosted Desklib DeBERTa-v3-large — #1 on RAID benchmark
# Runs on Railway Hobby plan (needs ~2.5GB RAM)

import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoConfig, AutoModel, PreTrainedModel
import logging

logger = logging.getLogger(__name__)


# ── Custom model class (required by Desklib checkpoint) ───────────
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
        # Mean pooling
        mask_expanded = attention_mask.unsqueeze(-1).expand(last_hidden_state.size()).float()
        sum_embeddings = torch.sum(last_hidden_state * mask_expanded, dim=1)
        sum_mask = torch.clamp(mask_expanded.sum(dim=1), min=1e-9)
        pooled = sum_embeddings / sum_mask
        logits = self.classifier(pooled)
        return {"logits": logits}


# ── Singleton loader (loads once, reuses forever) ─────────────────
_model = None
_tokenizer = None

MODEL_ID = "desklib/ai-text-detector-v1.01"


def load_model():
    """Load model into memory. Call at startup to pre-warm."""
    global _model, _tokenizer
    if _model is not None:
        return _model, _tokenizer

    logger.info(f"Loading {MODEL_ID}...")

    _tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    _model = DesklibAIDetectionModel.from_pretrained(MODEL_ID)
    _model.eval()

    param_count = sum(p.numel() for p in _model.parameters())
    logger.info(f"Model loaded. Parameters: {param_count:,}")
    return _model, _tokenizer


def predict_text(text: str, max_len: int = 768) -> dict:
    """
    Returns AI probability score and classification.
    Score > 0.5 = likely AI-generated.
    """
    model, tokenizer = load_model()
    device = torch.device("cpu")
    model.to(device)

    encoded = tokenizer(
        text,
        padding="max_length",
        truncation=True,
        max_length=max_len,
        return_tensors="pt",
    )
    input_ids = encoded["input_ids"].to(device)
    attention_mask = encoded["attention_mask"].to(device)

    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs["logits"]
        probability = torch.sigmoid(logits).item()

    return {
        "ai_probability": round(probability, 4),
        "classification": (
            "ai_generated" if probability >= 0.65
            else "mixed_or_uncertain" if probability >= 0.35
            else "likely_human"
        ),
        "model": MODEL_ID,
        "model_rank": "RAID Benchmark #1",
        "confidence": (
            "high" if probability > 0.8 or probability < 0.2
            else "medium" if probability > 0.65 or probability < 0.35
            else "low"
        ),
    }


def predict_texts_batch(texts: list[str], max_len: int = 768) -> list[dict]:
    """Predict multiple texts efficiently in batches of 4."""
    model, tokenizer = load_model()
    device = torch.device("cpu")
    model.to(device)

    results = []
    batch_size = 4
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        encoded = tokenizer(
            batch,
            padding="max_length",
            truncation=True,
            max_length=max_len,
            return_tensors="pt",
        )
        input_ids = encoded["input_ids"].to(device)
        attention_mask = encoded["attention_mask"].to(device)

        with torch.no_grad():
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            probs = torch.sigmoid(outputs["logits"]).squeeze(-1)

        # Handle single-item batch (squeeze removes batch dim)
        if probs.dim() == 0:
            probs = probs.unsqueeze(0)

        for j, prob in enumerate(probs):
            p = prob.item()
            results.append({
                "text_preview": batch[j][:100] + "..." if len(batch[j]) > 100 else batch[j],
                "ai_probability": round(p, 4),
                "classification": (
                    "ai_generated" if p >= 0.65
                    else "mixed_or_uncertain" if p >= 0.35
                    else "likely_human"
                ),
            })

    return results
