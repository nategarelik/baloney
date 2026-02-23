// extension/src/utils/escape.ts — Safe DOM construction helpers

export function esc(str: unknown): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function el(
  tag: string,
  attrs?: Record<string, string>,
  children?: (Node | string)[],
): HTMLElement {
  const element = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "className") {
        element.className = value;
      } else if (key === "textContent") {
        element.textContent = value;
      } else if (key.startsWith("data-")) {
        element.setAttribute(key, value);
      } else {
        element.setAttribute(key, value);
      }
    }
  }
  if (children) {
    for (const child of children) {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    }
  }
  return element;
}

export function text(content: string): Text {
  return document.createTextNode(content);
}
