# Baloney API Reference

> All endpoints are served from Vercel at `https://trustlens-nu.vercel.app`.

## Error Contract

All error responses follow the `ErrorResponse` interface:

```json
{
  "error": "Human-readable error message",
  "details": "Optional additional context"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Missing required parameter or invalid input |
| 401 | Unauthorized (invalid seed secret) |
| 500 | Internal server error |

## Input Validation

| Parameter | Bounds | Default |
|-----------|--------|---------|
| `days` | 1–365 | 30 |
| `limit` | 1–200 | varies (20 or 50) |
| `offset` | 0–10,000 | 0 |
| `text` (body) | max 50,000 chars | — |

Values outside bounds are clamped to the nearest valid value.

---

## Detection (3 endpoints)

### POST /api/detect/image

Detect AI-generated content in a base64-encoded image.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "user_id": "optional-uuid",
  "platform": "instagram"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | string | Yes | Base64-encoded image data |
| `user_id` | string | No | User ID for scan recording |
| `platform` | string | No | Source platform (default: `"manual_upload"`) |

**Response:** `DetectionResult`
```json
{
  "verdict": "ai_generated",
  "confidence": 0.87,
  "primary_score": 0.91,
  "secondary_score": 0.83,
  "model_used": "Organika/sdxl-detector",
  "ensemble_used": true,
  "scan_id": "a1b2c3d4"
}
```

### POST /api/detect/text

Detect AI-generated text content.

**Request Body:**
```json
{
  "text": "The text to analyze...",
  "user_id": "optional-uuid",
  "platform": "manual_upload"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | Text content to analyze (max 50,000 chars) |
| `user_id` | string | No | User ID for scan recording |
| `platform` | string | No | Source platform (default: `"manual_upload"`) |

**Response:** `TextDetectionResult`
```json
{
  "verdict": "likely_human",
  "confidence": 0.82,
  "ai_probability": 0.18,
  "model_used": "Hello-SimpleAI/chatgpt-detector-roberta",
  "text_stats": {
    "word_count": 150,
    "sentence_count": 8,
    "avg_word_length": 5.2,
    "avg_sentence_length": 18.75,
    "lexical_diversity": 0.72
  },
  "caveat": null,
  "scan_id": "e5f6g7h8"
}
```

### POST /api/detect/preview

Preview text detection WITHOUT recording to Supabase. Useful for extension inline scanning.

**Request Body:** Same as `/api/detect/text`

**Response:** Same as `/api/detect/text` (but no `scan_id` — not persisted)

---

## Information Diet (1 endpoint)

### GET /api/information-diet

Get a user's Information Diet Score (0-100 with letter grade).

**Query Params:** `user_id` (required)

**Response:** `InformationDietScore`
```json
{
  "user_id": "demo-user-001",
  "score": 72,
  "letter_grade": "B",
  "grade_label": "Balanced Consumer",
  "ai_ratio": 0.34,
  "platform_diversity": 4,
  "scan_frequency": 1.2,
  "computed_at": "2026-02-21T18:30:00.000Z"
}
```

---

## Analytics (4 endpoints)

### GET /api/analytics/personal

Personal AI exposure metrics for a specific user.

**Query Params:** `user_id` (required)

**Response:** `PersonalAnalytics`
```json
{
  "total_scans": 45,
  "ai_exposure_rate": 0.38,
  "by_platform": [
    { "platform": "instagram", "total": 20, "ai_count": 7, "avg_ai_confidence": 0.85, "ai_rate": 0.35 }
  ],
  "by_content_type": [
    { "content_type": "image", "total": 32, "ai_count": 14 }
  ],
  "by_verdict": [
    { "verdict": "ai_generated", "count": 17 }
  ]
}
```

### GET /api/analytics/community

Aggregated community-wide statistics (sharing_enabled users only).

**Response:** `CommunityAnalytics`
```json
{
  "total_scans": 535,
  "total_users": 30,
  "ai_rate": 0.34,
  "by_platform": [
    { "platform": "instagram", "total": 240, "ai_count": 84, "ai_rate": 0.35 }
  ],
  "by_content_type": [
    { "content_type": "image", "total": 375, "ai_count": 131 }
  ]
}
```

### GET /api/analytics/community/trends

Daily AI rate time series.

**Query Params:** `days` (1–365, default 30)

**Response:** `CommunityTrends`
```json
{
  "days": 30,
  "trends": [
    { "date": "2026-01-22", "total": 18, "ai_count": 6, "ai_rate": 0.33 }
  ]
}
```

### GET /api/analytics/community/domains

Domain leaderboard ranked by AI content rate.

**Query Params:** `limit` (1–200, default 20)

**Response:** `DomainLeaderboard`
```json
{
  "domains": [
    { "source_domain": "cdn.deviantart.net", "total": 27, "ai_count": 16, "ai_rate": 0.59 }
  ]
}
```

---

## Scans (1 endpoint)

### GET /api/scans/me

Paginated scan history for a user.

**Query Params:** `user_id` (required), `limit` (1–200, default 50), `offset` (0–10,000, default 0)

**Response:** `ScansResponse`
```json
{
  "scans": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2026-02-21T08:30:00.000Z",
      "content_type": "image",
      "platform": "instagram",
      "verdict": "ai_generated",
      "confidence": 0.9234,
      "model_used": "Organika/sdxl-detector",
      "source_domain": "cdninstagram.com",
      "content_category": "photo"
    }
  ],
  "total": 45,
  "limit": 50,
  "offset": 0
}
```

---

## Sharing (2 endpoints)

### POST /api/sharing/toggle

Enable or disable community data sharing.

**Request Body:**
```json
{
  "user_id": "uuid",
  "enabled": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | Yes | User ID |
| `enabled` | boolean | Yes | Whether to enable sharing |

**Response:** `SharingToggleResponse`
```json
{
  "user_id": "demo-user-001",
  "sharing_enabled": true,
  "message": "Community sharing enabled"
}
```

### GET /api/sharing/status

Check a user's sharing preference.

**Query Params:** `user_id` (required)

**Response:** `SharingStatus`
```json
{
  "user_id": "demo-user-001",
  "sharing_enabled": true,
  "exists": true
}
```

---

## Features (3 endpoints)

> **Note:** Detection now uses real HuggingFace ML models when `HUGGINGFACE_API_KEY` is configured. Falls back to mock detectors without it.

### GET /api/slop-index

Platform AI Slop Index — report cards with letter grades.

**Response:** `SlopIndexEntry[]`
```json
[
  {
    "platform": "instagram",
    "slop_score": 35.2,
    "grade": "C+",
    "grade_label": "Moderate AI Presence",
    "ai_rate_7d": 0.352,
    "ai_rate_24h": 0.38,
    "trend_direction": "rising",
    "total_scans_7d": 240,
    "computed_at": "2026-02-21T10:00:00.000Z"
  }
]
```

### GET /api/exposure-score

Personal AI awareness score (0–850, 5 levels).

**Query Params:** `user_id` (required)

**Response:** `ExposureScore`
```json
{
  "user_id": "demo-user-001",
  "score": 462,
  "level": "Vigilant",
  "scan_frequency": 1.5,
  "platform_diversity": 3,
  "streak_days": 7,
  "total_ai_caught": 17,
  "total_scans": 45
}
```

### GET /api/provenance

Top content provenance sightings by sighting count.

**Query Params:** `limit` (1–200, default 20)

**Response:** `ContentProvenance[]`
```json
[
  {
    "content_hash": "a1b2c3d4e5f6...",
    "sighting_count": 12,
    "compound_score": 75.5,
    "compound_verdict": "ai_generated",
    "ai_votes": 9,
    "human_votes": 2,
    "platforms": ["instagram", "x"],
    "first_seen": "2026-02-01T12:00:00.000Z",
    "last_seen": "2026-02-21T08:30:00.000Z"
  }
]
```

---

## Admin (1 endpoint)

### POST /api/seed

Seed demo data (50 users, 535 scans, computed indices).

**Auth:** `secret` query param or `x-seed-secret` header must match `SEED_SECRET` env var.

**Response:**
```json
{
  "message": "Seed complete",
  "users": 50,
  "scans_attempted": 535,
  "scans_succeeded": 535,
  "content_sightings": 79
}
```

---

## Health (1 endpoint)

### GET /api/health

System health check. Pings Supabase connectivity.

**Response:** `HealthResponse`
```json
{
  "status": "ok",
  "timestamp": "2026-02-21T18:30:00.000Z",
  "version": "0.1.0"
}
```

`status` is `"ok"` when Supabase responds, `"degraded"` when it doesn't.

---

## Type Reference

All response types are defined in `frontend/src/lib/types.ts`. Key types:

- `DetectionResult` — Image detection response
- `TextDetectionResult` — Text detection response with text stats
- `PersonalAnalytics` — Personal dashboard data
- `CommunityAnalytics` — Community dashboard data
- `SlopIndexEntry` — Platform AI report card
- `ExposureScore` — Personal awareness score
- `ContentProvenance` — Cross-platform content tracking
- `ScanRecord` — Individual scan history entry
