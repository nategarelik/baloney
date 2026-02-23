// extension/src/ui/insight-panel.ts — Insight HTML builder (safe DOM version)
// Used by sidepanel + tooltip for full detection result display

import { VERDICT_COLORS, VERDICT_LABELS, getApiUrlSync } from "../config";
import { getTextReasons, getImageReasons } from "../reasons";
import type { DetectionResult } from "../types";

export function buildInsightPanel(result: DetectionResult, type: string): HTMLDivElement {
  const container = document.createElement("div");
  const color = VERDICT_COLORS[result.verdict] || "#4a3728";
  const label = VERDICT_LABELS[result.verdict] || result.verdict;
  const confidence = Math.round((result.confidence || 0) * 100);

  // Header
  const header = document.createElement("div");
  header.className = "baloney-insight__header";

  const dot = document.createElement("div");
  dot.className = "baloney-insight__dot";
  dot.style.background = color;

  const labelEl = document.createElement("span");
  labelEl.textContent = label;

  const confEl = document.createElement("span");
  confEl.className = "baloney-insight__confidence";
  confEl.textContent = `${confidence}%`;

  header.appendChild(dot);
  header.appendChild(labelEl);
  header.appendChild(confEl);
  container.appendChild(header);

  // Caveat
  if (result.caveat) {
    const caveat = document.createElement("div");
    caveat.className = "baloney-insight__caveat";
    caveat.textContent = result.caveat;
    container.appendChild(caveat);
  }

  // Reasons
  const reasons = type === "text" ? getTextReasons(result) : getImageReasons(result);
  if (reasons.length > 0) {
    const reasonsDiv = document.createElement("div");
    reasonsDiv.className = "baloney-insight__reasons";
    for (const r of reasons) {
      const reason = document.createElement("div");
      reason.className = "baloney-insight__reason";
      reason.textContent = `\u2022 ${r}`;
      reasonsDiv.appendChild(reason);
    }
    container.appendChild(reasonsDiv);
  }

  // Sentence scores
  if (result.sentence_scores && result.sentence_scores.length > 0) {
    const sentDiv = document.createElement("div");
    sentDiv.className = "baloney-insight__sentences";

    for (const s of result.sentence_scores.slice(0, 5)) {
      const pct = Math.round(s.ai_probability * 100);
      const barColor =
        s.ai_probability > 0.6
          ? "#d4456b"
          : s.ai_probability > 0.4
            ? "#f59e0b"
            : "#16a34a";
      const preview = s.text.length > 40 ? s.text.slice(0, 40) + "\u2026" : s.text;

      const row = document.createElement("div");
      row.className = "baloney-insight__sentence";

      const barWrap = document.createElement("div");
      barWrap.className = "baloney-insight__sentence-bar";

      const barFill = document.createElement("div");
      barFill.className = "baloney-insight__sentence-fill";
      barFill.style.width = `${pct}%`;
      barFill.style.background = barColor;
      barWrap.appendChild(barFill);

      const textEl = document.createElement("span");
      textEl.className = "baloney-insight__sentence-text";
      textEl.textContent = preview;
      textEl.title = s.text;

      row.appendChild(barWrap);
      row.appendChild(textEl);
      sentDiv.appendChild(row);
    }
    container.appendChild(sentDiv);
  }

  // Model info
  const modelDiv = document.createElement("div");
  modelDiv.className = "baloney-insight__model";
  modelDiv.textContent = `Model: ${result.model_used || result.model || "unknown"}`;
  container.appendChild(modelDiv);

  // Full data link
  const resultData = JSON.stringify({
    result,
    type,
    sourceUrl: result.sourceUrl,
    sourcePageUrl: result.sourcePageUrl,
  });
  const analyzeUrl = `${getApiUrlSync()}/analyze?result=${encodeURIComponent(resultData)}`;

  const link = document.createElement("a");
  link.className = "baloney-insight__fulldata";
  link.href = analyzeUrl;
  link.target = "_blank";
  link.textContent = "View Full Data \u2192";
  container.appendChild(link);

  return container;
}
