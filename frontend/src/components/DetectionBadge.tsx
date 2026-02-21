"use client";

import { cn } from "@/lib/cn";
import { VERDICT_CLASSES } from "@/lib/constants";
import type { Verdict } from "@/lib/types";

interface DetectionBadgeProps {
  verdict: Verdict;
  confidence: number;
  animate?: boolean;
  className?: string;
}

function formatLabel(verdict: Verdict, confidence: number): string {
  switch (verdict) {
    case "ai_generated":
      return `AI \u00B7 ${Math.round(confidence * 100)}%`;
    case "heavy_edit":
      return "\u26A0 Heavy Edit";
    case "light_edit":
      return "~ Light Edit";
    case "human":
      return "\u2713 Human";
  }
}

export function DetectionBadge({
  verdict,
  confidence,
  animate = true,
  className,
}: DetectionBadgeProps) {
  return (
    <div
      className={cn(
        "px-2.5 py-1 rounded-md text-xs font-bold text-white border",
        "backdrop-blur-sm shadow-md tracking-wide",
        VERDICT_CLASSES[verdict],
        animate && "animate-fade-in-up",
        className
      )}
    >
      {formatLabel(verdict, confidence)}
    </div>
  );
}
