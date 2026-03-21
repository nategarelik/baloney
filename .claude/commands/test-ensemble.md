---
description: Run the detection ensemble test suite and validate thresholds
allowed-tools: Bash, Read, Grep, Glob
---

# Ensemble Test & Validation

1. Run vitest suite:
   ```
   cd frontend && npm test -- --reporter=verbose
   ```
2. Read `frontend/src/lib/detection-config.ts` and verify:
   - TEXT.VERDICT_THRESHOLDS: aiGenerated=0.75, heavyEdit=0.55, lightEdit=0.35
   - TEXT.STATISTICAL_WEIGHTS sum to ~1.0
   - IMAGE.VERDICT_THRESHOLDS: aiGenerated=0.65
3. Check evaluation metrics match expectations:
   - Text: ROC AUC >= 0.98, precision >= 0.89
   - Image: ROC AUC >= 0.97
4. Report any failing tests with file:line references
