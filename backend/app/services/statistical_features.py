# backend/app/services/statistical_features.py
# Pure-Python statistical text analysis — no ML model needed.
# Burstiness, Type-Token Ratio, readability, transition word density.

import re
import math


TRANSITION_WORDS = {
    "additionally", "furthermore", "moreover", "however", "nevertheless",
    "consequently", "therefore", "thus", "meanwhile", "subsequently",
    "specifically", "particularly", "notably", "indeed", "certainly",
    "essentially", "fundamentally", "importantly", "significantly",
    "accordingly", "conversely", "alternatively", "nonetheless",
    "undoubtedly", "evidently", "interestingly", "remarkably",
    "admittedly", "presumably", "arguably", "overall", "ultimately",
}


def compute_text_stats(text: str) -> dict:
    """Basic text statistics: word count, sentence count, lexical diversity, etc."""
    words = [w for w in text.split() if w]
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]

    unique_words = set(w.lower().strip(".,!?;:\"'()") for w in words)

    word_count = len(words)
    sentence_count = max(len(sentences), 1)
    lexical_diversity = len(unique_words) / word_count if word_count > 0 else 0
    avg_sentence_length = word_count / sentence_count
    avg_word_length = (
        sum(len(w) for w in words) / word_count if word_count > 0 else 0
    )

    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "lexical_diversity": round(lexical_diversity, 4),
        "avg_sentence_length": round(avg_sentence_length, 1),
        "avg_word_length": round(avg_word_length, 1),
    }


def compute_statistical_features(text: str) -> dict:
    """
    Extract statistical signals that differentiate AI from human text.
    Returns a composite stat_ai_score (0-1) plus individual features.
    """
    stats = compute_text_stats(text)

    if stats["word_count"] < 30:
        return {
            "sufficient_text": False,
            "text_stats": stats,
            "stat_ai_score": 0.5,
        }

    # ── Burstiness ────────────────────────────────────────────────
    # Variance in sentence lengths. Human text is "bursty" (high variance).
    # AI text has uniform sentence length (low variance).
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    sent_word_counts = [len(s.split()) for s in sentences]
    mean_len = sum(sent_word_counts) / len(sent_word_counts) if sent_word_counts else 0
    variance = (
        sum((c - mean_len) ** 2 for c in sent_word_counts) / len(sent_word_counts)
        if sent_word_counts
        else 0
    )
    burstiness = min(variance / 100, 1.0)
    burstiness_signal = 1 - burstiness  # Low burstiness = more AI-like

    # ── Type-Token Ratio (TTR) ────────────────────────────────────
    # AI text clusters around ~0.55 TTR. Very high or very low = more human.
    ttr = stats["lexical_diversity"]
    ttr_ai_signal = 1.0 - abs(ttr - 0.55) * 3  # Peaks near 0.55
    ttr_ai_signal = max(0, min(1, ttr_ai_signal))

    # ── Transition word density ───────────────────────────────────
    # AI text overuses transition words like "moreover", "furthermore".
    words_lower = [w.lower().strip(".,!?;:\"'()") for w in text.split()]
    transition_count = sum(1 for w in words_lower if w in TRANSITION_WORDS)
    transition_density = transition_count / max(len(words_lower), 1)
    # AI typically has density 0.02-0.06; human < 0.02
    transition_signal = min(transition_density / 0.04, 1.0)

    # ── Readability clustering ────────────────────────────────────
    # AI text clusters in grade 8-12 readability. Extreme readability = human.
    avg_syllables = stats["avg_word_length"] * 0.4  # Rough syllable proxy
    fk_grade = 0.39 * stats["avg_sentence_length"] + 11.8 * avg_syllables - 15.59
    fk_norm = max(0, min(1, fk_grade / 20))
    # AI clusters around 0.4-0.6; human is more varied
    readability_signal = 0.7 if abs(fk_norm - 0.5) < 0.15 else 0.3

    # ── Perplexity proxy ──────────────────────────────────────────
    # Combination of burstiness + vocabulary spread as a rough perplexity proxy.
    perplexity_proxy = max(0, min(1, burstiness + (1 - ttr)))
    perplexity_signal = 1 - perplexity_proxy  # Low perplexity = more AI

    # ── Composite score ───────────────────────────────────────────
    stat_ai_score = (
        burstiness_signal * 0.20
        + ttr_ai_signal * 0.15
        + transition_signal * 0.25
        + readability_signal * 0.20
        + perplexity_signal * 0.20
    )

    return {
        "sufficient_text": True,
        "text_stats": stats,
        "stat_ai_score": round(stat_ai_score, 4),
        "features": {
            "burstiness": round(burstiness, 4),
            "burstiness_signal": round(burstiness_signal, 4),
            "type_token_ratio": round(ttr, 4),
            "ttr_ai_signal": round(ttr_ai_signal, 4),
            "transition_density": round(transition_density, 4),
            "transition_signal": round(transition_signal, 4),
            "fk_grade_level": round(fk_grade, 1),
            "readability_signal": round(readability_signal, 4),
            "perplexity_proxy": round(perplexity_proxy, 4),
            "perplexity_signal": round(perplexity_signal, 4),
        },
    }
