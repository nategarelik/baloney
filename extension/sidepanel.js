// extension/sidepanel.js — Baloney Sidepanel Detail View (v0.4.0)
// Renders detection analysis data passed via chrome.storage.local.sidepanelData

const VERDICT_LABELS = {
  ai_generated: "AI Generated",
  heavy_edit: "Heavy Edit",
  light_edit: "Light Edit",
  human: "Human Written",
};

const VERDICT_CLASSES = {
  ai_generated: "ai",
  heavy_edit: "heavy",
  light_edit: "light",
  human: "human",
};

const VERDICT_COLORS = {
  ai_generated: "#d4456b",
  heavy_edit: "#f97316",
  light_edit: "#f59e0b",
  human: "#16a34a",
};

function getTextReasons(result) {
  const reasons = [];
  const fv = result.feature_vector;
  if (!fv) return reasons;

  if (fv.burstiness !== undefined) {
    if (fv.burstiness < 0.2) reasons.push("Sentence lengths are very uniform, typical of AI writing");
    else if (fv.burstiness > 0.5) reasons.push("Varied sentence rhythm suggests human writing style");
  }
  if (fv.type_token_ratio !== undefined) {
    if (fv.type_token_ratio < 0.4) reasons.push("Vocabulary is repetitive, a common AI pattern");
    else if (fv.type_token_ratio > 0.7) reasons.push("Rich vocabulary diversity indicates human authorship");
  }
  if (fv.perplexity !== undefined) {
    if (fv.perplexity < 80) reasons.push("Text is highly predictable, consistent with AI generation");
    else if (fv.perplexity > 150) reasons.push("Unpredictable word choices suggest human creativity");
  }
  if (fv.repetition_score !== undefined) {
    if (fv.repetition_score > 0.6) reasons.push("High phrase repetition detected");
  }
  return reasons;
}

function getImageReasons(result) {
  const reasons = [];
  if (result.primary_score !== undefined) {
    if (result.primary_score > 0.7) reasons.push("Visual patterns strongly match AI generation signatures");
    else if (result.primary_score < 0.3) reasons.push("Visual patterns consistent with authentic photography");
  }
  if (result.secondary_score !== undefined) {
    if (result.secondary_score > 0.6) reasons.push("Frequency analysis shows unusually smooth gradients");
    else if (result.secondary_score < 0.3) reasons.push("Natural noise patterns detected in image data");
  }
  if (result.edit_magnitude !== undefined) {
    if (result.edit_magnitude > 0.7) reasons.push("Significant digital manipulation detected");
  }
  if (result.trust_score !== undefined) {
    if (result.trust_score > 0.75) reasons.push("High authenticity confidence");
  }
  return reasons;
}

function renderResult(data) {
  const container = document.getElementById("content");
  if (!data || !data.result) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🐷</div>
        <div>Click a detection dot to view analysis details here.</div>
      </div>`;
    return;
  }

  const result = data.result;
  const type = data.type || "image";
  const verdict = result.verdict || "human";
  const cls = VERDICT_CLASSES[verdict] || "human";
  const label = VERDICT_LABELS[verdict] || verdict;
  const color = VERDICT_COLORS[verdict] || "#4a3728";
  const confidence = Math.round((result.confidence || 0) * 100);

  let html = "";

  // Verdict banner
  html += `
    <div class="verdict-banner ${cls}">
      <div class="verdict-label">${label}</div>
      <div class="verdict-confidence">${confidence}% confidence</div>
    </div>`;

  // Confidence meter
  html += `
    <div class="meter">
      <div class="meter-label">Confidence</div>
      <div class="meter-track">
        <div class="meter-fill" style="width:${confidence}%;background:${color}"></div>
      </div>
    </div>`;

  // Caveat
  if (result.caveat) {
    const safe = result.caveat.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html += `<div class="caveat">${safe}</div>`;
  }

  // Reasoning
  const reasons = type === "text" ? getTextReasons(result) : getImageReasons(result);
  if (reasons.length > 0) {
    html += `<div class="section"><div class="section-title">Why This Verdict</div>`;
    reasons.forEach((r) => {
      html += `<div class="reason">${r}</div>`;
    });
    html += `</div>`;
  }

  // Sentence-level breakdown (text only)
  if (result.sentence_scores && result.sentence_scores.length > 0) {
    html += `<div class="section"><div class="section-title">Sentence Breakdown</div>`;
    result.sentence_scores.forEach((s) => {
      const pct = Math.round(s.ai_probability * 100);
      const barColor = s.ai_probability > 0.6 ? "#d4456b" : s.ai_probability > 0.4 ? "#f59e0b" : "#16a34a";
      const pctColor = s.ai_probability > 0.6 ? "#d4456b" : s.ai_probability > 0.4 ? "#f59e0b" : "#16a34a";
      const safe = s.text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      html += `
        <div class="sentence-row">
          <div class="sentence-bar">
            <div class="sentence-fill" style="width:${pct}%;background:${barColor}"></div>
          </div>
          <span class="sentence-text" title="${safe}">${safe}</span>
          <span class="sentence-pct" style="color:${pctColor}">${pct}%</span>
        </div>`;
    });
    html += `</div>`;
  }

  // Model info
  const model = (result.model_used || result.model || "unknown").replace(/</g, "&lt;");
  html += `<div class="model-info">Model: ${model}</div>`;

  container.innerHTML = html;
}

// Load and render on open
function loadData() {
  chrome.storage.local.get("sidepanelData", (data) => {
    renderResult(data.sidepanelData);
  });
}

// Listen for updates while panel is open
chrome.storage.onChanged.addListener((changes) => {
  if (changes.sidepanelData) {
    renderResult(changes.sidepanelData.newValue);
  }
});

loadData();
