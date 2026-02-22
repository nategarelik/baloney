"use client";

import { useState, useCallback } from "react";

interface ProvenanceCardProps {
  scanId?: string;
  contentHash?: string;
  sourceUrl?: string;
  modelUsed?: string;
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="4.5"
        y="4.5"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M9.5 4.5V2.5C9.5 1.67 8.83 1 8 1H2.5C1.67 1 1 1.67 1 2.5V8C1 8.83 1.67 9.5 2.5 9.5H4.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-secondary/30 hover:text-secondary/60 transition-colors ml-2"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <span className="text-[11px] text-green-600 font-medium">Copied!</span>
      ) : (
        <CopyIcon />
      )}
    </button>
  );
}

interface ProvenanceItemProps {
  label: string;
  value: string | undefined;
  copyable?: boolean;
  fullValue?: string;
}

function ProvenanceItem({ label, value, copyable, fullValue }: ProvenanceItemProps) {
  if (!value) return null;

  return (
    <div>
      <div className="text-secondary/50 text-xs uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-secondary text-sm font-mono flex items-center">
        <span className="truncate">{value}</span>
        {copyable && <CopyButton value={fullValue || value} />}
      </div>
    </div>
  );
}

export function ProvenanceCard({
  scanId,
  contentHash,
  sourceUrl,
  modelUsed,
}: ProvenanceCardProps) {
  const displayId = scanId || (contentHash ? contentHash.slice(0, 8) : undefined);
  const displayFingerprint = contentHash
    ? contentHash.slice(0, 12) + "..."
    : undefined;
  const displaySource = sourceUrl
    ? sourceUrl.length > 40
      ? sourceUrl.slice(0, 40) + "..."
      : sourceUrl
    : undefined;

  if (!displayId && !displayFingerprint && !displaySource && !modelUsed) {
    return null;
  }

  return (
    <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
      <h3 className="font-display text-xl text-secondary mb-4">Provenance</h3>
      <div className="grid grid-cols-2 gap-4">
        <ProvenanceItem
          label="Scan ID"
          value={displayId}
          copyable
          fullValue={scanId || contentHash}
        />
        <ProvenanceItem
          label="Content Fingerprint"
          value={displayFingerprint}
          copyable
          fullValue={contentHash}
        />
        <ProvenanceItem label="Source" value={displaySource} />
        <ProvenanceItem label="Model" value={modelUsed} />
      </div>
    </div>
  );
}
