"use client";

import { useState } from "react";
import type { PangramWindow } from "@/lib/types";

interface PangramWindowsProps {
  windows: PangramWindow[] | null | undefined;
}

function getSegmentColor(score: number): string {
  if (score < 0.3) return "#16a34a";
  if (score <= 0.6) return "#f59e0b";
  return "#d4456b";
}

export function PangramWindows({ windows }: PangramWindowsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!windows || windows.length === 0) return null;

  const totalLength = Math.max(
    ...windows.map((w) => w.end),
  ) - Math.min(...windows.map((w) => w.start));

  return (
    <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
      <h3 className="font-display text-xl text-secondary mb-4">
        Pangram Segment Analysis
      </h3>
      <p className="text-secondary/50 text-xs mb-3">
        Per-segment AI classification from Pangram API
      </p>

      {/* Segmented bar */}
      <div className="flex w-full h-4">
        {windows.map((w, i) => {
          const segmentWidth =
            totalLength > 0 ? ((w.end - w.start) / totalLength) * 100 : 0;
          const color = getSegmentColor(w.ai_assistance_score);

          let roundedClass = "rounded-sm";
          if (windows.length === 1) {
            roundedClass = "rounded-full";
          } else if (i === 0) {
            roundedClass = "rounded-sm rounded-l-full";
          } else if (i === windows.length - 1) {
            roundedClass = "rounded-sm rounded-r-full";
          }

          return (
            <div
              key={`${w.start}-${w.end}`}
              className={`h-4 ${roundedClass}`}
              style={{
                width: `${segmentWidth}%`,
                backgroundColor: color,
                minWidth: "2px",
              }}
              title={`${w.classification} (${Math.round(w.ai_assistance_score * 100)}%)`}
            />
          );
        })}
      </div>

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-4 flex items-center gap-1.5 text-secondary/60 hover:text-secondary text-xs transition-colors"
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
        {expanded ? "Hide segments" : "Show segments"}
      </button>

      {/* Expanded details */}
      {expanded && (
        <ul className="mt-3 space-y-2">
          {windows.map((w, i) => {
            const color = getSegmentColor(w.ai_assistance_score);

            return (
              <li
                key={`${w.start}-${w.end}-detail`}
                className="flex items-center gap-3 text-sm text-secondary/80 bg-base-dark/50 border border-secondary/5 rounded-lg px-4 py-2.5"
              >
                {/* Colored dot */}
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />

                {/* Classification label */}
                <span className="font-medium text-secondary">
                  {w.classification}
                </span>

                {/* Scores */}
                <span className="ml-auto flex items-center gap-4 text-xs text-secondary/50">
                  <span>
                    AI Score:{" "}
                    <span className="text-secondary/80">
                      {Math.round(w.ai_assistance_score * 100)}%
                    </span>
                  </span>
                  <span>
                    Confidence:{" "}
                    <span className="text-secondary/80">
                      {Math.round(w.confidence * 100)}%
                    </span>
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
