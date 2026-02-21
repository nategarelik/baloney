"use client";

import { useState, useEffect } from "react";
import { DEMO_USER_ID } from "@/lib/constants";
import type { ExposureScore } from "@/lib/types";

const LEVEL_COLORS: Record<string, string> = {
  Novice: "bg-slate-600",
  Aware: "bg-blue-600",
  Vigilant: "bg-purple-600",
  Guardian: "bg-amber-600",
  Sentinel: "bg-emerald-600",
};

const LEVEL_THRESHOLDS = [
  { min: 0, label: "Novice" },
  { min: 100, label: "Aware" },
  { min: 300, label: "Vigilant" },
  { min: 500, label: "Guardian" },
  { min: 700, label: "Sentinel" },
];

export function ExposureScoreCard() {
  const [data, setData] = useState<ExposureScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/exposure-score?user_id=${DEMO_USER_ID}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-navy-light rounded-xl p-6 border border-navy-lighter animate-pulse">
        <div className="h-6 bg-navy-lighter rounded w-40 mb-4" />
        <div className="h-24 bg-navy-lighter rounded-lg" />
      </div>
    );
  }

  if (!data) return null;

  const nextLevel = LEVEL_THRESHOLDS.find((t) => t.min > data.score);
  const currentLevel = [...LEVEL_THRESHOLDS].reverse().find((t) => t.min <= data.score);
  const progressToNext = nextLevel
    ? ((data.score - (currentLevel?.min ?? 0)) / (nextLevel.min - (currentLevel?.min ?? 0))) * 100
    : 100;

  return (
    <div className="bg-navy-light rounded-xl p-6 border border-navy-lighter">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Exposure Score</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${LEVEL_COLORS[data.level] ?? "bg-slate-600"}`}>
          {data.level}
        </span>
      </div>

      <div className="text-center mb-4">
        <span className="text-5xl font-black text-white">{data.score}</span>
        <span className="text-slate-500 text-lg ml-1">/850</span>
      </div>

      {nextLevel && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{currentLevel?.label}</span>
            <span>{nextLevel.label}</span>
          </div>
          <div className="w-full bg-[#0f1a2e] rounded-full h-2">
            <div
              className="h-2 rounded-full bg-accent transition-all"
              style={{ width: `${Math.min(progressToNext, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-[#0f1a2e] rounded-lg p-3">
          <div className="text-slate-500 text-xs">AI Caught</div>
          <div className="text-white font-bold">{data.total_ai_caught}</div>
        </div>
        <div className="bg-[#0f1a2e] rounded-lg p-3">
          <div className="text-slate-500 text-xs">Total Scans</div>
          <div className="text-white font-bold">{data.total_scans}</div>
        </div>
        <div className="bg-[#0f1a2e] rounded-lg p-3">
          <div className="text-slate-500 text-xs">Streak</div>
          <div className="text-white font-bold">{data.streak_days} days</div>
        </div>
        <div className="bg-[#0f1a2e] rounded-lg p-3">
          <div className="text-slate-500 text-xs">Platforms</div>
          <div className="text-white font-bold">{Math.round(data.platform_diversity * 4)}/4</div>
        </div>
      </div>
    </div>
  );
}
