// extension/src/ui/content-mode.ts — Content filtering mode (scan / blur / block)

import { settings } from "../config";

function shouldFilter(verdict: string): boolean {
  return verdict === "ai_generated" || verdict === "heavy_edit";
}

export function applyContentMode(targetEl: HTMLElement, verdict: string): void {
  if (!shouldFilter(verdict)) return;

  removeContentMode(targetEl);

  if (settings.contentMode === "blur") {
    targetEl.classList.add("baloney-filtered");

    const parent = targetEl.parentElement;
    if (parent) {
      const parentPos = window.getComputedStyle(parent).position;
      if (parentPos === "static") parent.style.position = "relative";

      const overlay = document.createElement("div");
      overlay.className = "baloney-blur-reveal";
      overlay.textContent = "AI Content \u2014 Click to Reveal";
      overlay.dataset.baloneyReveal = "true";
      overlay.addEventListener("click", () => {
        targetEl.classList.add("baloney-revealed");
        overlay.remove();
      });
      parent.appendChild(overlay);
    }
  } else if (settings.contentMode === "block") {
    const container =
      targetEl.closest("article, [role='article'], .post, .tweet") || targetEl;
    (container as HTMLElement).classList.add("baloney-hidden");
    (container as HTMLElement).dataset.baloneyHiddenBy = "filter";
  }
}

export function removeContentMode(targetEl: HTMLElement): void {
  targetEl.classList.remove("baloney-filtered", "baloney-revealed");

  const parent = targetEl.parentElement;
  if (parent) {
    const overlay = parent.querySelector("[data-baloney-reveal]");
    if (overlay) overlay.remove();
  }

  const container = targetEl.closest("[data-baloney-hidden-by='filter']") as HTMLElement | null;
  if (container) {
    container.classList.remove("baloney-hidden");
    delete container.dataset.baloneyHiddenBy;
  }
}

export function reapplyContentMode(): void {
  document
    .querySelectorAll<HTMLElement>("img[data-baloney-scanned], video[data-baloney-scanned]")
    .forEach((el) => {
      const verdict = (el as HTMLElement).dataset.baloneyScanned;
      if (!verdict || verdict === "pending" || verdict === "error") return;

      removeContentMode(el);
      applyContentMode(el, verdict);
    });
}
