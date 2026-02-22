"use client";

import { useState, useCallback } from "react";

interface ExportActionsProps {
  result: Record<string, unknown>;
  type: "text" | "image" | "video";
}

function LinkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M6.5 9.5L9.5 6.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M9 11L7.5 12.5C6.12 13.88 3.88 13.88 2.5 12.5V12.5C1.12 11.12 1.12 8.88 2.5 7.5L4 6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M7 5L8.5 3.5C9.88 2.12 12.12 2.12 13.5 3.5V3.5C14.88 4.88 14.88 7.12 13.5 8.5L12 10"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M8 2V10M8 10L5 7M8 10L11 7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12H13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M5.8 7L10.2 4.5M5.8 9L10.2 11.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

type CopiedButton = "link" | "share" | null;

const BTN_CLASS =
  "px-4 py-2 rounded-lg border border-secondary/10 text-secondary/70 text-sm hover:bg-secondary/5 transition-colors flex items-center gap-2";

export function ExportActions({ result, type }: ExportActionsProps) {
  const [copiedButton, setCopiedButton] = useState<CopiedButton>(null);

  const showCopied = useCallback((button: CopiedButton) => {
    setCopiedButton(button);
    setTimeout(() => setCopiedButton(null), 2000);
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showCopied("link");
    });
  }, [showCopied]);

  const handleDownloadJson = useCallback(() => {
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `baloney-${type}-analysis.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [result, type]);

  const handleShare = useCallback(async () => {
    const verdict =
      typeof result.verdict === "string" ? result.verdict : "unknown";
    const probability =
      typeof result.ai_probability === "number"
        ? `${Math.round(result.ai_probability * 100)}%`
        : "";
    const text = `Baloney AI Detection: ${type} analysis — verdict: ${verdict}${probability ? ` (${probability} AI probability)` : ""}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Baloney AI Detection",
          text,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    navigator.clipboard.writeText(window.location.href).then(() => {
      showCopied("share");
    });
  }, [result, type, showCopied]);

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative">
        <button type="button" onClick={handleCopyLink} className={BTN_CLASS}>
          <LinkIcon />
          Copy Link
        </button>
        {copiedButton === "link" && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] text-green-600 font-medium whitespace-nowrap">
            Copied!
          </span>
        )}
      </div>

      <button type="button" onClick={handleDownloadJson} className={BTN_CLASS}>
        <DownloadIcon />
        Download JSON
      </button>

      <div className="relative">
        <button type="button" onClick={handleShare} className={BTN_CLASS}>
          <ShareIcon />
          Share
        </button>
        {copiedButton === "share" && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] text-green-600 font-medium whitespace-nowrap">
            Copied!
          </span>
        )}
      </div>
    </div>
  );
}
