"use client";

interface ScanMetadataProps {
  modelUsed?: string;
  scanId?: string;
  timestamp?: string;
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
}

export function ScanMetadata({ modelUsed, scanId, timestamp }: ScanMetadataProps) {
  const hasAny = modelUsed || scanId || timestamp;
  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 text-secondary/35 text-xs py-3 border-t border-secondary/[0.08] mt-2">
      {modelUsed && <span>Model: {modelUsed}</span>}
      {scanId && <span>Scan: {scanId}</span>}
      {timestamp && <span>{formatTimestamp(timestamp)}</span>}
    </div>
  );
}
