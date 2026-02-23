"use client";

import { Trophy } from "lucide-react";

interface MadDataWinnerProps {
  variant?: "badge" | "banner";
  className?: string;
}

export function MadDataWinner({
  variant = "badge",
  className = "",
}: MadDataWinnerProps) {
  if (variant === "banner") {
    return (
      <div
        className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border border-amber-400/30 ${className}`}
        style={{
          background:
            "linear-gradient(135deg, rgba(232,201,122,0.25), rgba(212,69,107,0.1))",
        }}
      >
        <Trophy className="h-6 w-6 text-amber-500 flex-shrink-0" />
        <div className="text-left">
          <p className="text-sm font-semibold text-secondary">
            1st Place &mdash; MAD Data 2026
          </p>
          <p className="text-xs text-secondary/60">
            Madison&apos;s Premier Data Science Hackathon
          </p>
        </div>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-amber-400/30 text-secondary ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(232,201,122,0.3), rgba(212,69,107,0.15))",
      }}
    >
      <Trophy className="h-3.5 w-3.5 text-amber-500" />
      1st Place MAD Data 2026
    </span>
  );
}
