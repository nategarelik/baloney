"use client";

import { useState, useEffect } from "react";
import { DEMO_USER_ID } from "@/lib/constants";
import type { InformationDietScore } from "@/lib/types";

const GRADE_COLORS: Record<string, string> = {
  "A+": "text-emerald-400",
  A: "text-emerald-400",
  "A-": "text-emerald-400",
  "B+": "text-green-400",
  B: "text-green-400",
  "B-": "text-green-400",
  "C+": "text-amber-400",
  C: "text-amber-400",
  "C-": "text-amber-400",
  "D+": "text-red-400",
  D: "text-red-400",
  "D-": "text-red-400",
  F: "text-red-500",
};

const GAUGE_RADIUS = 60;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

function getGaugeColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  return "#ef4444";
}

function getTrendArrow(direction: number): string {
  if (direction > 0) return "↑";
  if (direction < 0) return "↓";
  return "→";
}

function getTrendColor(direction: number): string {
  if (direction > 0) return "text-green-400";
  if (direction < 0) return "text-red-400";
  return "text-secondary/50";
}

interface MetricBarProps {
  label: string;
  value: number;
  color: string;
}

function MetricBar({ label, value, color }: MetricBarProps) {
  const pct = Math.min(Math.max(value * 100, 0), 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-secondary/50">{label}</span>
        <span className="text-secondary font-medium">{Math.round(pct)}%</span>
      </div>
      <div className="w-full bg-secondary/5 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function InformationDietCard() {
  const [data, setData] = useState<InformationDietScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/information-diet?user_id=${DEMO_USER_ID}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-base-dark rounded-xl p-6 border border-secondary/10 animate-pulse">
        <div className="h-6 bg-secondary/8 rounded w-52 mb-4" />
        <div className="flex gap-6">
          <div className="w-36 h-36 bg-secondary/8 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-secondary/8 rounded w-3/4" />
            <div className="h-4 bg-secondary/8 rounded w-2/3" />
            <div className="h-4 bg-secondary/8 rounded w-3/4" />
            <div className="h-4 bg-secondary/8 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const dashOffset =
    GAUGE_CIRCUMFERENCE - (data.score / 100) * GAUGE_CIRCUMFERENCE;
  const gaugeColor = getGaugeColor(data.score);
  const gradeColor = GRADE_COLORS[data.letter_grade] ?? "text-secondary/50";

  return (
    <div className="bg-base-dark rounded-xl p-6 border border-secondary/10">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-secondary">
          Information Diet Score
        </h3>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full bg-secondary/5 ${getTrendColor(data.trend_direction)}`}
        >
          {getTrendArrow(data.trend_direction)} Trend
        </span>
      </div>

      <div className="flex gap-6 items-center">
        {/* Circular gauge */}
        <div className="flex-shrink-0 relative">
          <svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
            className="rotate-[-90deg]"
          >
            {/* Background track */}
            <circle
              cx="70"
              cy="70"
              r={GAUGE_RADIUS}
              fill="none"
              stroke="rgba(74,55,40,0.08)"
              strokeWidth="12"
            />
            {/* Animated fill */}
            <circle
              cx="70"
              cy="70"
              r={GAUGE_RADIUS}
              fill="none"
              stroke={gaugeColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={GAUGE_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          {/* Score + grade overlaid */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-secondary leading-none">
              {data.score}
            </span>
            <span className={`text-xl font-bold leading-tight ${gradeColor}`}>
              {data.letter_grade}
            </span>
          </div>
        </div>

        {/* Sub-metric bars */}
        <div className="flex-1 space-y-3">
          <MetricBar
            label="AI Content Ratio"
            value={1 - data.ai_content_ratio}
            color="#22c55e"
          />
          <MetricBar
            label="Source Diversity"
            value={data.source_diversity}
            color="#3b82f6"
          />
          <MetricBar
            label="Trend Direction"
            value={(data.trend_direction + 1) / 2}
            color="#eab308"
          />
          <MetricBar
            label="Awareness Actions"
            value={data.awareness_actions}
            color="#a855f7"
          />
        </div>
      </div>

      <p className="text-xs text-secondary/50 mt-4">
        Computed{" "}
        {new Date(data.computed_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
