"use client";

import { cn } from "@/lib/cn";

interface FeedStatsBarProps {
  totalPosts: number;
  scannedCount: number;
  flaggedCount: number;
}

export function FeedStatsBar({
  totalPosts,
  scannedCount,
  flaggedCount,
}: FeedStatsBarProps) {
  const progress = totalPosts > 0 ? scannedCount / totalPosts : 0;
  const aiRate = scannedCount > 0 ? flaggedCount / scannedCount : 0;

  return (
    <div className="sticky top-[53px] z-40 bg-navy/90 backdrop-blur border-b border-navy-lighter px-4 py-2.5">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>
            {scannedCount} of {totalPosts} scanned
          </span>
          <span
            className={cn(
              "font-medium",
              aiRate > 0.4
                ? "text-red-400"
                : aiRate > 0.2
                ? "text-amber-400"
                : "text-green-400"
            )}
          >
            {flaggedCount} flagged AI
          </span>
        </div>
        <div className="w-full h-1 bg-navy-lighter rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              aiRate > 0.4
                ? "bg-red-500"
                : aiRate > 0.2
                ? "bg-amber-500"
                : "bg-green-500"
            )}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
