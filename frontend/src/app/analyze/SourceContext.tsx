"use client";

interface SourceContextProps {
  sourceUrl?: string;
  sourcePageUrl?: string;
  type: "text" | "image" | "video";
}

export function SourceContext({ sourceUrl, sourcePageUrl, type }: SourceContextProps) {
  if (!sourceUrl && !sourcePageUrl) return null;

  const typeLabel = type === "text" ? "Text from" : type === "image" ? "Image from" : "Video from";
  const displayUrl = sourceUrl || sourcePageUrl || "";
  const truncated = displayUrl.length > 80 ? displayUrl.slice(0, 77) + "\u2026" : displayUrl;

  return (
    <div className="bg-secondary/5 border border-secondary/8 rounded-lg px-4 py-3 flex items-center gap-3">
      <span className="text-secondary/30 text-xs whitespace-nowrap">{typeLabel}</span>
      <a
        href={displayUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-secondary/50 text-xs font-mono hover:text-secondary/70 transition-colors truncate"
        title={displayUrl}
      >
        {truncated}
      </a>
    </div>
  );
}
