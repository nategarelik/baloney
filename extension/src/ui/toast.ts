// extension/src/ui/toast.ts — Toast card system for text/image scan results
// ALL innerHTML usage replaced with safe DOM construction (createElement + textContent)

import { VERDICT_COLORS, VERDICT_LABELS, getApiUrlSync } from "../config";
import { esc } from "../utils/escape";
import { getTextReasons, getImageReasons } from "../reasons";
import { openSidepanel } from "./detection-dot";
import { updateTextStats, updatePageStats } from "../stats";
import { addFlaggedItem, getPageIndicator } from "./page-indicator";
import type { DetectionResult } from "../types";

let activeToastCard: (HTMLDivElement & { _escHandler?: (e: KeyboardEvent) => void }) | null = null;
let toastAutoDismissTimer: ReturnType<typeof setTimeout> | null = null;
let toastLastText: string | null = null;

function getToastBottom(): number {
  return getPageIndicator() ? 72 : 24;
}

export function dismissTextToast(animate = true): void {
  if (toastAutoDismissTimer) {
    clearTimeout(toastAutoDismissTimer);
    toastAutoDismissTimer = null;
  }
  if (!activeToastCard) return;

  if (activeToastCard._escHandler) {
    document.removeEventListener("keydown", activeToastCard._escHandler);
    activeToastCard._escHandler = undefined;
  }

  if (animate) {
    activeToastCard.style.animation = "baloney-card-out 0.2s ease forwards";
    const card = activeToastCard;
    setTimeout(() => card?.remove(), 200);
  } else {
    activeToastCard.remove();
  }
  activeToastCard = null;
}

function createToastCardShell(): HTMLDivElement & { _escHandler?: (e: KeyboardEvent) => void } {
  dismissTextToast(false);

  const card = document.createElement("div") as HTMLDivElement & { _escHandler?: (e: KeyboardEvent) => void };
  card.className = "baloney-toast-card";
  card.id = "baloney-toast-card";
  card.style.bottom = `${getToastBottom()}px`;

  card.addEventListener("mouseenter", () => {
    if (toastAutoDismissTimer) {
      clearTimeout(toastAutoDismissTimer);
      toastAutoDismissTimer = null;
    }
  });
  card.addEventListener("mouseleave", () => {
    startAutoDismiss(3000);
  });

  document.body.appendChild(card);
  activeToastCard = card;
  return card;
}

function startAutoDismiss(ms = 12000): void {
  if (toastAutoDismissTimer) clearTimeout(toastAutoDismissTimer);
  toastAutoDismissTimer = setTimeout(() => dismissTextToast(true), ms);
}

function buildHeader(titleText: string, showClose: boolean): HTMLDivElement {
  const header = document.createElement("div");
  header.className = "baloney-toast-card__header";

  const icon = document.createElement("span");
  icon.className = "baloney-toast-card__icon";
  icon.textContent = "\uD83D\uDC37";
  header.appendChild(icon);

  const title = document.createElement("span");
  title.className = "baloney-toast-card__title";
  title.textContent = titleText;
  header.appendChild(title);

  if (showClose) {
    const closeBtn = document.createElement("button");
    closeBtn.className = "baloney-toast-card__close";
    closeBtn.textContent = "\u00D7";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dismissTextToast(true);
    });
    header.appendChild(closeBtn);
  }

  return header;
}

function buildVerdictRow(color: string, label: string, confidence: number): HTMLDivElement {
  const verdict = document.createElement("div");
  verdict.className = "baloney-toast-card__verdict";

  const dot = document.createElement("div");
  dot.className = "baloney-toast-card__verdict-dot";
  dot.style.background = color;

  const labelEl = document.createElement("span");
  labelEl.className = "baloney-toast-card__verdict-label";
  labelEl.textContent = label;

  const pctEl = document.createElement("span");
  pctEl.className = "baloney-toast-card__verdict-pct";
  pctEl.textContent = `${confidence}%`;

  verdict.appendChild(dot);
  verdict.appendChild(labelEl);
  verdict.appendChild(pctEl);
  return verdict;
}

function buildConfidenceBar(color: string, confidence: number): HTMLDivElement {
  const bar = document.createElement("div");
  bar.className = "baloney-toast-card__bar";

  const fill = document.createElement("div");
  fill.className = "baloney-toast-card__bar-fill";
  fill.style.background = color;
  bar.appendChild(fill);

  // Animate fill on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fill.style.width = `${confidence}%`;
    });
  });

  return bar;
}

function buildMethodBars(result: DetectionResult): HTMLDivElement | null {
  if (!result.method_scores) return null;

  const methods = Object.entries(result.method_scores)
    .filter(([, m]) => m.available)
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, 2);

  if (methods.length === 0) return null;

  const container = document.createElement("div");
  container.className = "baloney-toast-methods";

  for (const [, m] of methods) {
    const pct = Math.round(m.score * 100);
    const mColor = m.score > 0.65 ? "#d4456b" : m.score > 0.35 ? "#f59e0b" : "#16a34a";

    const row = document.createElement("div");
    row.className = "baloney-toast-method-row";

    const label = document.createElement("span");
    label.className = "baloney-toast-method-label";
    label.textContent = m.label;

    const barWrap = document.createElement("div");
    barWrap.className = "baloney-toast-method-bar";

    const barFill = document.createElement("div");
    barFill.style.width = `${pct}%`;
    barFill.style.background = mColor;
    barWrap.appendChild(barFill);

    const pctLabel = document.createElement("span");
    pctLabel.className = "baloney-toast-method-pct";
    pctLabel.textContent = `${pct}%`;

    row.appendChild(label);
    row.appendChild(barWrap);
    row.appendChild(pctLabel);
    container.appendChild(row);
  }

  return container;
}

function buildReasons(reasons: string[]): HTMLDivElement | null {
  if (reasons.length === 0) return null;

  const container = document.createElement("div");
  container.className = "baloney-toast-card__reasons";

  for (const r of reasons) {
    const reason = document.createElement("div");
    reason.className = "baloney-toast-card__reason";
    reason.textContent = `\u2022 ${r}`;
    container.appendChild(reason);
  }

  return container;
}

function getBarColor(aiProbability: number): string {
  if (aiProbability > 0.6) return "#d4456b";
  if (aiProbability > 0.4) return "#f59e0b";
  return "#16a34a";
}

function buildSentenceRow(
  s: { text: string; ai_probability: number },
  index: number,
): HTMLDivElement {
  const pct = Math.round(s.ai_probability * 100);
  const barColor = getBarColor(s.ai_probability);
  const preview = s.text.length > 50 ? s.text.slice(0, 50) + "\u2026" : s.text;

  const row = document.createElement("div");
  row.className = "baloney-toast-card__sentence";
  row.style.animationDelay = `${index * 80}ms`;

  const barWrap = document.createElement("div");
  barWrap.className = "baloney-toast-card__sentence-bar";

  const barFill = document.createElement("div");
  barFill.className = "baloney-toast-card__sentence-fill";
  barFill.style.width = `${pct}%`;
  barFill.style.background = barColor;
  barWrap.appendChild(barFill);

  const pctEl = document.createElement("span");
  pctEl.className = "baloney-toast-card__sentence-pct";
  pctEl.textContent = `${pct}%`;

  const textEl = document.createElement("span");
  textEl.className = "baloney-toast-card__sentence-text";
  textEl.textContent = preview;
  textEl.title = s.text;

  row.appendChild(barWrap);
  row.appendChild(pctEl);
  row.appendChild(textEl);
  return row;
}

function buildFooter(result: DetectionResult, type: string): HTMLDivElement {
  const footer = document.createElement("div");
  footer.className = "baloney-toast-card__footer";

  const model = document.createElement("span");
  model.className = "baloney-toast-card__model";
  model.textContent = result.model_used || result.model || "unknown";

  const resultData = JSON.stringify({
    result,
    type,
    sourceUrl: result.sourceUrl,
    sourcePageUrl: result.sourcePageUrl,
  });
  const analyzeUrl = `${getApiUrlSync()}/analyze?result=${encodeURIComponent(resultData)}`;

  const link = document.createElement("a");
  link.className = "baloney-toast-card__link";
  link.href = analyzeUrl;
  link.target = "_blank";
  link.textContent = "View Full Data \u2192";

  footer.appendChild(model);
  footer.appendChild(link);
  return footer;
}

function attachEscHandler(card: HTMLDivElement & { _escHandler?: (e: KeyboardEvent) => void }): void {
  const escHandler = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      dismissTextToast(true);
    }
  };
  document.addEventListener("keydown", escHandler);
  card._escHandler = escHandler;
}

// ──────────────────────────────────────────────
// Public toast functions
// ──────────────────────────────────────────────

export function showTextToastLoading(textPreview: string): void {
  const card = createToastCardShell();
  card.dataset.state = "loading";

  const preview = (textPreview || "").slice(0, 80);
  const previewSuffix = (textPreview || "").length > 80 ? "\u2026" : "";

  card.appendChild(buildHeader("Baloney Text Check", false));

  const loading = document.createElement("div");
  loading.className = "baloney-toast-card__loading";

  const spinner = document.createElement("div");
  spinner.className = "baloney-scan-spinner";

  const loadText = document.createElement("span");
  loadText.textContent = "Sniffing for AI\u2026";

  loading.appendChild(spinner);
  loading.appendChild(loadText);
  card.appendChild(loading);

  if (preview) {
    const previewEl = document.createElement("div");
    previewEl.className = "baloney-toast-card__preview";
    previewEl.textContent = `\u201C${preview}${previewSuffix}\u201D`;
    card.appendChild(previewEl);
  }

  const skeleton = document.createElement("div");
  skeleton.className = "baloney-toast-card__skeleton";
  const widths = ["70%", "100%", "45%"];
  for (const w of widths) {
    const bar = document.createElement("div");
    bar.className = "baloney-toast-card__skeleton-bar";
    bar.style.width = w;
    skeleton.appendChild(bar);
  }
  card.appendChild(skeleton);
}

export function showTextToastResult(result: DetectionResult, textPreview: string): void {
  if (!result || !result.verdict) {
    showTextToastError("No result returned");
    return;
  }

  const card = activeToastCard || createToastCardShell();
  card.dataset.state = "result";

  // Clear existing content
  while (card.firstChild) card.removeChild(card.firstChild);

  const color = VERDICT_COLORS[result.verdict] || "#4a3728";
  const label = VERDICT_LABELS[result.verdict] || result.verdict;
  const confidence = Math.round((result.confidence || 0) * 100);
  const reasons = getTextReasons(result).slice(0, 2);
  const sentences = result.sentence_scores || [];
  const visibleSentences = sentences.slice(0, 3);
  const hiddenCount = Math.max(0, sentences.length - 3);

  card.style.borderLeftColor = color;

  card.appendChild(buildHeader("Baloney Text Check", true));

  // Verdict row (clickable to open sidepanel)
  const verdictRow = buildVerdictRow(color, label, confidence);
  verdictRow.style.cursor = "pointer";
  verdictRow.addEventListener("click", () => openSidepanel(result, "text"));
  card.appendChild(verdictRow);

  card.appendChild(buildConfidenceBar(color, confidence));

  const methodBars = buildMethodBars(result);
  if (methodBars) card.appendChild(methodBars);

  const reasonsEl = buildReasons(reasons);
  if (reasonsEl) card.appendChild(reasonsEl);

  // Sentence breakdown
  if (visibleSentences.length > 0) {
    const sentContainer = document.createElement("div");
    sentContainer.className = "baloney-toast-card__sentences";

    for (let i = 0; i < visibleSentences.length; i++) {
      sentContainer.appendChild(buildSentenceRow(visibleSentences[i], i));
    }

    if (hiddenCount > 0) {
      const moreBtn = document.createElement("div");
      moreBtn.className = "baloney-toast-card__more";
      moreBtn.textContent = `+${hiddenCount} more`;
      moreBtn.addEventListener("click", () => {
        for (let j = 0; j < sentences.length - 3; j++) {
          sentContainer.insertBefore(
            buildSentenceRow(sentences[j + 3], j + 3),
            moreBtn,
          );
        }
        moreBtn.remove();
      });
      sentContainer.appendChild(moreBtn);
    }

    card.appendChild(sentContainer);
  }

  // Caveat
  if (result.caveat) {
    const caveat = document.createElement("div");
    caveat.className = "baloney-toast-card__caveat";
    caveat.textContent = result.caveat;
    card.appendChild(caveat);
  }

  card.appendChild(buildFooter(result, "text"));
  attachEscHandler(card);

  updateTextStats(result.verdict);
  updatePageStats("text", result.verdict);

  const textSnippet = (textPreview || "").slice(0, 40);
  addFlaggedItem(document.body, result.verdict, "Text: " + textSnippet + "\u2026");

  startAutoDismiss(12000);
}

export function showTextToastError(errorMsg: string): void {
  const card = activeToastCard || createToastCardShell();
  card.dataset.state = "error";
  card.style.borderLeftColor = "#d4456b";

  while (card.firstChild) card.removeChild(card.firstChild);

  card.appendChild(buildHeader("Baloney Text Check", true));

  const errorContainer = document.createElement("div");
  errorContainer.className = "baloney-toast-card__error";

  const errorMsgEl = document.createElement("div");
  errorMsgEl.className = "baloney-toast-card__error-msg";
  errorMsgEl.textContent = "Analysis failed";
  errorContainer.appendChild(errorMsgEl);

  const retryBtn = document.createElement("button");
  retryBtn.className = "baloney-toast-card__retry";
  retryBtn.textContent = "Try Again";
  if (toastLastText) {
    const savedText = toastLastText;
    retryBtn.addEventListener("click", () => {
      showTextToastLoading(savedText.slice(0, 80));
      chrome.runtime.sendMessage(
        { type: "analyze-text", text: savedText.slice(0, 2000) },
        (response: unknown) => {
          const resp = response as DetectionResult | null;
          if (resp && resp.verdict) {
            showTextToastResult(resp, savedText);
          } else {
            showTextToastError("Still unavailable");
          }
        },
      );
    });
  }
  errorContainer.appendChild(retryBtn);

  card.appendChild(errorContainer);
  startAutoDismiss(12000);
}

export function showTextToastMinLength(): void {
  const card = createToastCardShell();
  card.dataset.state = "min-length";

  card.appendChild(buildHeader("Baloney Text Check", false));

  const msg = document.createElement("div");
  msg.className = "baloney-toast-card__min-length";
  msg.textContent = "Select at least 20 characters to analyze.";
  card.appendChild(msg);

  startAutoDismiss(4000);
}

export function showImageToastResult(result: DetectionResult, srcUrl: string): void {
  const color = VERDICT_COLORS[result.verdict] || "#4a3728";
  const label = VERDICT_LABELS[result.verdict] || result.verdict;
  const confidence = Math.round((result.confidence || 0) * 100);
  const reasons = getImageReasons(result).slice(0, 2);

  const card = createToastCardShell();
  card.style.borderLeftColor = color;

  card.appendChild(buildHeader("Baloney Image Scan", true));

  const verdictRow = buildVerdictRow(color, label, confidence);
  verdictRow.style.cursor = "pointer";
  verdictRow.addEventListener("click", () => openSidepanel(result, "image"));
  card.appendChild(verdictRow);

  card.appendChild(buildConfidenceBar(color, confidence));

  const methodBars = buildMethodBars(result);
  if (methodBars) card.appendChild(methodBars);

  const reasonsEl = buildReasons(reasons);
  if (reasonsEl) card.appendChild(reasonsEl);

  card.appendChild(buildFooter(result, "image"));

  startAutoDismiss(12000);
}

// Simple context-menu image toast (legacy)
export function showToast(lines: string[], verdict: string): void {
  const existing = document.getElementById("baloney-toast");
  if (existing) existing.remove();

  const color = VERDICT_COLORS[verdict] || "#4a3728";

  const toast = document.createElement("div");
  toast.id = "baloney-toast";
  toast.style.cssText = [
    "position:fixed",
    "bottom:24px",
    "right:24px",
    "z-index:2147483647",
    "background:#f0e6ca",
    `border-left:4px solid ${color}`,
    "border-radius:10px",
    "padding:12px 16px",
    "font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "font-size:13px",
    "color:#4a3728",
    "box-shadow:0 4px 20px rgba(74,55,40,0.15)",
    "max-width:300px",
    "animation:baloney-toast-in 0.25s ease both",
  ].join(";");

  const style = document.createElement("style");
  style.textContent =
    "@keyframes baloney-toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}";
  toast.appendChild(style);

  lines.forEach((line, i) => {
    const p = document.createElement("p");
    p.textContent = line;
    p.style.cssText =
      i === 0
        ? "font-weight:700;color:#4a3728;margin-bottom:4px"
        : "color:rgba(74,55,40,0.6);font-size:11px;margin:0";
    toast.appendChild(p);
  });

  document.body.appendChild(toast);
  setTimeout(() => toast?.remove(), 5000);
}

export function setToastLastText(text: string | null): void {
  toastLastText = text;
}
