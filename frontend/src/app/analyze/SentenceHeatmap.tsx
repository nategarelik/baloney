"use client";

import { useState } from "react";
import type { SentenceScore } from "@/lib/types";

interface SentenceHeatmapProps {
  sentenceScores: SentenceScore[];
}

function getSentenceBg(aiProbability: number): string {
  if (aiProbability < 0.3) return "rgba(34, 197, 94, 0.15)";
  if (aiProbability < 0.6) return "rgba(245, 158, 11, 0.18)";
  return "rgba(239, 68, 68, 0.2)";
}

export function SentenceHeatmap({ sentenceScores }: SentenceHeatmapProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (sentenceScores.length === 0) {
    return (
      <div className="bg-navy-light rounded-xl border border-navy-lighter p-6">
        <h2 className="text-white font-semibold mb-2">Sentence Analysis</h2>
        <p className="text-slate-400 text-sm">No sentence data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-navy-light rounded-xl border border-navy-lighter p-6">
      <h2 className="text-white font-semibold mb-4">Sentence Analysis</h2>
      <div className="flex flex-wrap gap-x-0 gap-y-1 text-sm leading-7">
        {sentenceScores.map((s, i) => (
          <span
            key={i}
            className="relative cursor-default rounded px-0.5 mx-0.5"
            style={{ backgroundColor: getSentenceBg(s.ai_probability) }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {s.text}
            {hoveredIndex === i && (
              <span className="absolute -top-7 left-0 bg-navy-lighter text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 border border-navy-lighter shadow">
                AI: {Math.round(s.ai_probability * 100)}%
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ background: "rgba(34, 197, 94, 0.3)" }} />
          Human (0–30%)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ background: "rgba(245, 158, 11, 0.35)" }} />
          Mixed (30–60%)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ background: "rgba(239, 68, 68, 0.4)" }} />
          AI (60–100%)
        </span>
      </div>
    </div>
  );
}
