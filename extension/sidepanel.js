// extension/sidepanel.js — Baloney Sidepanel Detail View (v0.5.0)
// Rich multi-section rendering with collapsible panels.
// Renders detection analysis data passed via chrome.storage.local.sidepanelData

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

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

const CHEVRON_SVG = `<svg class="section-header-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 6 8 10 12 6"/></svg>`;

// ──────────────────────────────────────────────
// Reason helpers (unchanged from v0.4.0)
// ──────────────────────────────────────────────

function getTextReasons(result) {
  const reasons = [];
  const fv = result.feature_vector;
  if (!fv) return reasons;

  if (fv.burstiness !== undefined) {
    if (fv.burstiness < 0.2)
      reasons.push("Sentence lengths are very uniform, typical of AI writing");
    else if (fv.burstiness > 0.5)
      reasons.push("Varied sentence rhythm suggests human writing style");
  }
  if (fv.type_token_ratio !== undefined) {
    if (fv.type_token_ratio < 0.4)
      reasons.push("Vocabulary is repetitive, a common AI pattern");
    else if (fv.type_token_ratio > 0.7)
      reasons.push("Rich vocabulary diversity indicates human authorship");
  }
  if (fv.perplexity !== undefined) {
    if (fv.perplexity < 80)
      reasons.push("Text is highly predictable, consistent with AI generation");
    else if (fv.perplexity > 150)
      reasons.push("Unpredictable word choices suggest human creativity");
  }
  if (fv.repetition_score !== undefined) {
    if (fv.repetition_score > 0.6)
      reasons.push("High phrase repetition detected");
  }
  return reasons;
}

function getImageReasons(result) {
  const reasons = [];
  if (result.primary_score !== undefined) {
    if (result.primary_score > 0.7)
      reasons.push("Visual patterns strongly match AI generation signatures");
    else if (result.primary_score < 0.3)
      reasons.push("Visual patterns consistent with authentic photography");
  }
  if (result.secondary_score !== undefined) {
    if (result.secondary_score > 0.6)
      reasons.push("Frequency analysis shows unusually smooth gradients");
    else if (result.secondary_score < 0.3)
      reasons.push("Natural noise patterns detected in image data");
  }
  if (result.edit_magnitude !== undefined) {
    if (result.edit_magnitude > 0.7)
      reasons.push("Significant digital manipulation detected");
  }
  if (result.trust_score !== undefined) {
    if (result.trust_score > 0.75) reasons.push("High authenticity confidence");
  }
  return reasons;
}

// ──────────────────────────────────────────────
// Utility helpers
// ──────────────────────────────────────────────

function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pct(val) {
  if (val === undefined || val === null) return 0;
  return Math.round(val * 100);
}

function scoreColor(score) {
  if (score > 0.65) return "#d4456b";
  if (score > 0.35) return "#f59e0b";
  return "#16a34a";
}

function statusLabel(status) {
  switch (status) {
    case "unavailable":
      return "Unavailable";
    case "rate_limited":
      return "Rate Limited";
    case "error":
      return "Error";
    case "not_run":
      return "Not Run";
    default:
      return "Unavailable";
  }
}

function buildSection(id, title, contentHtml, defaultOpen) {
  const openClass = defaultOpen ? " open" : "";
  return `
    <div class="section${openClass}" id="section-${id}" data-section-id="${id}">
      <div class="section-header" data-toggle="${id}">
        <span class="section-header-title">${esc(title)}</span>
        ${CHEVRON_SVG}
      </div>
      <div class="section-content">${contentHtml}</div>
    </div>`;
}

// ──────────────────────────────────────────────
// Render: Quick Stats (2x2 grid)
// ──────────────────────────────────────────────

function renderQuickStats(result, type) {
  const confidence = pct(result.confidence);
  const aiProb = pct(
    result.ai_probability !== undefined
      ? result.ai_probability
      : result.primary_score,
  );
  const trust = pct(result.trust_score);
  const edit = pct(result.edit_magnitude);
  const color = VERDICT_COLORS[result.verdict] || "#4a3728";

  return `
    <div class="quick-stats">
      <div class="stat-box">
        <div class="stat-value" style="color:${color}">${confidence}%</div>
        <div class="stat-label">Confidence</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:${aiProb > 65 ? "#d4456b" : aiProb > 35 ? "#f59e0b" : "#16a34a"}">${aiProb}%</div>
        <div class="stat-label">AI Probability</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:${trust > 60 ? "#16a34a" : trust > 30 ? "#f59e0b" : "#d4456b"}">${trust}%</div>
        <div class="stat-label">Trust Score</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:${edit > 50 ? "#d4456b" : edit > 20 ? "#f59e0b" : "#16a34a"}">${edit}%</div>
        <div class="stat-label">Edit Magnitude</div>
      </div>
    </div>`;
}

// ──────────────────────────────────────────────
// Render: SynthID Badge
// ──────────────────────────────────────────────

function renderSynthIDBadge(result) {
  const synthid = result.synthid_text_result;
  if (!synthid) return "";

  const icons = {
    watermarked: `<svg class="synthid-icon" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M6 9l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    not_watermarked: `<svg class="synthid-icon" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M6 6l6 6M12 6l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    uncertain: `<svg class="synthid-icon" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M7 7a2 2 0 012-2 2 2 0 012 2c0 1-1 1.5-2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="13" r="0.5" fill="currentColor"/></svg>`,
  };

  const labels = {
    watermarked: "SynthID Watermark Detected",
    not_watermarked: "No SynthID Watermark",
    uncertain: "SynthID Result Uncertain",
  };

  const details = {
    watermarked: "Google Gemini watermark found in this text",
    not_watermarked: "No Google watermark signatures present",
    uncertain: "Watermark signal inconclusive",
  };

  return `
    <div class="synthid-badge ${synthid}">
      ${icons[synthid] || icons.uncertain}
      <div>
        <div>${labels[synthid] || "SynthID Unknown"}</div>
        <div class="synthid-detail">${details[synthid] || ""}</div>
      </div>
    </div>`;
}

// ──────────────────────────────────────────────
// Render: Method Breakdown
// ──────────────────────────────────────────────

function renderMethodBreakdown(result) {
  const methods = result.method_scores;
  if (!methods || Object.keys(methods).length === 0) return "";

  const primaryAvailable = result.primaryAvailable;

  const entries = Object.entries(methods)
    .filter(([, v]) => {
      if (primaryAvailable && v.tier === "fallback") return false;
      return true;
    })
    .sort((a, b) => {
      if (a[1].available !== b[1].available) return a[1].available ? -1 : 1;
      return b[1].weight - a[1].weight;
    });

  if (entries.length === 0) return "";

  const availableCount = entries.filter(([, v]) => v.available).length;

  let html = `<div style="font-size:10px;color:rgba(74,55,40,0.45);margin-bottom:8px">${availableCount} of ${entries.length} signal${entries.length > 1 ? "s" : ""} active</div>`;

  entries.forEach(([key, method]) => {
    const isAvailable = method.available;
    const score = isAvailable ? pct(method.score) : 0;
    const weight = pct(method.weight);
    const color = isAvailable ? scoreColor(method.score) : "#6b7280";

    let tierBadge = "";
    if (method.tier && isAvailable) {
      tierBadge = `<span class="method-tier ${method.tier}">${method.tier}</span>`;
    }

    if (isAvailable) {
      html += `
        <div class="method-row">
          <span class="method-name">${esc(method.label)}${tierBadge}</span>
          <div class="method-bar">
            <div class="method-bar-fill" style="width:${score}%;background:${color}"></div>
          </div>
          <span class="method-score" style="color:${color}">${score}%</span>
          <span class="method-weight">${weight}%w</span>
        </div>`;
    } else {
      html += `
        <div class="method-row method-unavailable">
          <span class="method-name">${esc(method.label)}</span>
          <div class="method-bar">
            <div class="method-bar-fill" style="width:100%;background:#6b7280;opacity:0.1"></div>
          </div>
          <span class="method-status">${statusLabel(method.status)}</span>
        </div>`;
    }
  });

  // Weight total
  const totalWeight = Math.round(
    entries
      .filter(([, m]) => m.available)
      .reduce((s, [, m]) => s + m.weight, 0) * 100,
  );
  html += `<div style="font-size:10px;color:rgba(74,55,40,0.35);margin-top:6px;text-align:right">Total weight: ${totalWeight}%</div>`;

  return html;
}

// ──────────────────────────────────────────────
// Render: Feature Analysis
// ──────────────────────────────────────────────

function renderFeatureAnalysis(result) {
  const fv = result.feature_vector;
  if (!fv) return "";

  const features = [
    {
      name: "Burstiness",
      value: fv.burstiness,
      max: 1,
      interpret: (v) =>
        v < 0.2 ? "Very uniform" : v > 0.5 ? "Varied rhythm" : "Moderate",
    },
    {
      name: "Vocabulary",
      value: fv.type_token_ratio,
      max: 1,
      interpret: (v) =>
        v < 0.4 ? "Repetitive" : v > 0.7 ? "Diverse" : "Average",
    },
    {
      name: "Perplexity",
      value: fv.perplexity,
      max: 300,
      interpret: (v) =>
        v < 80 ? "Predictable" : v > 150 ? "Unpredictable" : "Normal",
    },
    {
      name: "Repetition",
      value: fv.repetition_score,
      max: 1,
      interpret: (v) =>
        v > 0.6 ? "High repeat" : v > 0.3 ? "Some repeat" : "Low repeat",
    },
  ];

  let html = "";
  features.forEach((f) => {
    if (f.value === undefined || f.value === null) return;
    const barPct = Math.min(100, Math.round((f.value / f.max) * 100));
    const color =
      f.name === "Perplexity"
        ? f.value < 80
          ? "#d4456b"
          : f.value > 150
            ? "#16a34a"
            : "#f59e0b"
        : f.name === "Burstiness" || f.name === "Vocabulary"
          ? barPct < 30
            ? "#d4456b"
            : barPct > 60
              ? "#16a34a"
              : "#f59e0b"
          : barPct > 60
            ? "#d4456b"
            : barPct > 30
              ? "#f59e0b"
              : "#16a34a";

    const displayVal = f.max === 1 ? f.value.toFixed(2) : Math.round(f.value);
    const interp = f.interpret(f.value);

    html += `
      <div class="feature-row">
        <span class="feature-name">${f.name}</span>
        <div class="feature-bar">
          <div class="feature-bar-fill" style="width:${barPct}%;background:${color}"></div>
        </div>
        <span class="feature-value" style="color:${color}">${displayVal}</span>
        <span class="feature-interp">${interp}</span>
      </div>`;
  });

  return html;
}

// ──────────────────────────────────────────────
// Render: Pangram Windows
// ──────────────────────────────────────────────

function renderPangramWindows(result) {
  const windows = result.pangram_windows;
  if (!windows || windows.length === 0) return "";

  const classColors = {
    ai: "#d4456b",
    human: "#16a34a",
    mixed: "#f59e0b",
  };

  // Calculate total length for proportions
  const totalLen = windows.reduce((sum, w) => sum + (w.end - w.start), 0);
  if (totalLen === 0) return "";

  let barHtml = "";
  const legendItems = new Set();

  windows.forEach((w) => {
    const widthPct = (((w.end - w.start) / totalLen) * 100).toFixed(1);
    const cls = (w.classification || "mixed").toLowerCase();
    const bgColor = classColors[cls] || "#f59e0b";
    const opacity = 0.4 + (w.confidence || 0.5) * 0.6;
    legendItems.add(cls);
    barHtml += `<div class="pangram-segment" style="width:${widthPct}%;background:${bgColor};opacity:${opacity}" title="${esc(cls)} (${pct(w.ai_assistance_score)}% AI, ${pct(w.confidence)}% conf)"></div>`;
  });

  let legendHtml = "";
  legendItems.forEach((cls) => {
    const color = classColors[cls] || "#f59e0b";
    const label = cls.charAt(0).toUpperCase() + cls.slice(1);
    legendHtml += `<span class="pangram-legend-item"><span class="pangram-legend-dot" style="background:${color}"></span>${label}</span>`;
  });

  return `
    <div class="pangram-bar">${barHtml}</div>
    <div class="pangram-legend">${legendHtml}</div>
    <div style="font-size:10px;color:rgba(74,55,40,0.4);margin-top:6px">${windows.length} segment${windows.length > 1 ? "s" : ""} analyzed by Pangram</div>`;
}

// ──────────────────────────────────────────────
// Render: Provenance
// ──────────────────────────────────────────────

function renderProvenance(result) {
  let html = '<div class="provenance">';

  if (result.scan_id) {
    html += `
      <div class="provenance-row">
        <span class="provenance-label">Scan ID</span>
        <span class="provenance-value" title="${esc(result.scan_id)}">${esc(result.scan_id)}</span>
      </div>`;
  }

  const model = result.model_used || result.model || "unknown";
  html += `
    <div class="provenance-row">
      <span class="provenance-label">Model</span>
      <span class="provenance-value" title="${esc(model)}">${esc(model)}</span>
    </div>`;

  if (result.ensemble_used) {
    html += `
      <div class="provenance-row">
        <span class="provenance-label">Ensemble</span>
        <span class="provenance-value">Active</span>
      </div>`;
  }

  html += "</div>";
  return html;
}

// ──────────────────────────────────────────────
// Render: Open Full Analysis button
// ──────────────────────────────────────────────

function renderFullAnalysisButton(data) {
  const type = data.type || "image";
  const scanId = data.result && data.result.scan_id ? data.result.scan_id : "";
  const url = `https://baloney.app/analyze?type=${encodeURIComponent(type)}${scanId ? "&scan=" + encodeURIComponent(scanId) : ""}`;

  return `<a class="open-full-btn" href="${url}" target="_blank" rel="noopener noreferrer">Open Full Analysis</a>`;
}

// ──────────────────────────────────────────────
// Main render
// ──────────────────────────────────────────────

function renderResult(data) {
  const container = document.getElementById("content");
  if (!data || !data.result) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">&#x1f437;</div>
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
  const confidence = pct(result.confidence);

  let html = "";

  // 1. Verdict banner (always visible, not collapsible)
  html += `
    <div class="verdict-banner ${cls}">
      <div class="verdict-label">${esc(label)}</div>
      <div class="verdict-confidence">${confidence}% confidence</div>
    </div>`;

  // 2. Quick Stats grid (always visible, not collapsible)
  html += renderQuickStats(result, type);

  // 3. SynthID badge (if present, not collapsible)
  html += renderSynthIDBadge(result);

  // 4. Method Breakdown (collapsible, default open)
  const methodHtml = renderMethodBreakdown(result);
  if (methodHtml) {
    html += buildSection("methods", "Method Breakdown", methodHtml, true);
  }

  // 5. Feature Analysis (collapsible, default open for text)
  const featureHtml = renderFeatureAnalysis(result);
  if (featureHtml) {
    html += buildSection(
      "features",
      "Feature Analysis",
      featureHtml,
      type === "text",
    );
  }

  // 6. Reasoning (collapsible)
  const reasons =
    type === "text" ? getTextReasons(result) : getImageReasons(result);
  if (reasons.length > 0) {
    let reasonHtml = "";
    reasons.forEach((r) => {
      reasonHtml += `<div class="reason">${esc(r)}</div>`;
    });
    html += buildSection("reasons", "Why This Verdict", reasonHtml, true);
  }

  // 7. Sentence Breakdown (collapsible, text only)
  if (result.sentence_scores && result.sentence_scores.length > 0) {
    let sentHtml = "";
    result.sentence_scores.forEach((s) => {
      const sp = pct(s.ai_probability);
      const barColor =
        s.ai_probability > 0.6
          ? "#d4456b"
          : s.ai_probability > 0.4
            ? "#f59e0b"
            : "#16a34a";
      const safe = esc(s.text);
      sentHtml += `
        <div class="sentence-row">
          <div class="sentence-bar">
            <div class="sentence-fill" style="width:${sp}%;background:${barColor}"></div>
          </div>
          <span class="sentence-text" title="${safe}">${safe}</span>
          <span class="sentence-pct" style="color:${barColor}">${sp}%</span>
        </div>`;
    });
    html += buildSection("sentences", "Sentence Breakdown", sentHtml, false);
  }

  // 8. Pangram Windows (collapsible, text only)
  const pangramHtml = renderPangramWindows(result);
  if (pangramHtml) {
    html += buildSection("pangram", "Pangram Segments", pangramHtml, false);
  }

  // 9. Caveat
  if (result.caveat) {
    html += `<div class="caveat">${esc(result.caveat)}</div>`;
  }

  // 10. Provenance footer (collapsible, default closed)
  html += buildSection(
    "provenance",
    "Provenance",
    renderProvenance(result),
    false,
  );

  // 11. Open Full Analysis button
  html += renderFullAnalysisButton(data);

  container.innerHTML = html;
}

// ──────────────────────────────────────────────
// Section toggle
// ──────────────────────────────────────────────

function toggleSection(sectionId) {
  const el = document.getElementById("section-" + sectionId);
  if (el) {
    el.classList.toggle("open");
  }
}

// ──────────────────────────────────────────────
// Event delegation for section headers
// ──────────────────────────────────────────────

document.getElementById("content").addEventListener("click", function (e) {
  const header = e.target.closest(".section-header");
  if (!header) return;
  const sectionId = header.getAttribute("data-toggle");
  if (sectionId) {
    toggleSection(sectionId);
  }
});

// ──────────────────────────────────────────────
// Data loading & live updates
// ──────────────────────────────────────────────

function loadData() {
  chrome.storage.local.get("sidepanelData", (data) => {
    renderResult(data.sidepanelData);
  });
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.sidepanelData) {
    renderResult(changes.sidepanelData.newValue);
  }
});

loadData();
