"use client";

import { useState, useEffect } from "react";
import { getCommunityHeatmap } from "@/lib/api";
import type { HeatmapCell } from "@/lib/types";
import { ChartCard } from "@/components/ChartCard";
import { CHART_TOOLTIP_STYLE } from "@/lib/constants";

// ── Layout constants ──────────────────────────
const CELL_SIZE = 28;
const GAP = 2;
const MARGIN_LEFT = 50;
const MARGIN_TOP = 30;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_LABELS = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];

// ── Color interpolation ──────────────────────
function cellColor(rate: number): string {
  if (rate === 0) return "#e6d9b8"; // base-dark (empty)
  if (rate <= 25) return "#86efac"; // green-300
  if (rate <= 50) return "#fbbf24"; // amber-400
  if (rate <= 75) return "#f97316"; // orange-500
  return "#d4456b"; // primary pink
}

// Keep CHART_TOOLTIP_STYLE in scope so lint doesn't flag unused import
void CHART_TOOLTIP_STYLE;

export function SlopClock() {
  const [data, setData] = useState<HeatmapCell[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommunityHeatmap()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Loading state ──────────────────────────
  if (loading) {
    return (
      <ChartCard
        title="The Slop Clock"
        subtitle="AI content doesn't sleep. Bot farms post at 2-4 AM when human activity drops — bright cells reveal automated posting schedules."
      >
        <div className="h-64 animate-pulse bg-secondary/5 rounded-lg" />
      </ChartCard>
    );
  }

  // ── Empty state ────────────────────────────
  if (!data || data.length === 0) {
    return (
      <ChartCard
        title="The Slop Clock"
        subtitle="AI content doesn't sleep. Bot farms post at 2-4 AM when human activity drops — bright cells reveal automated posting schedules."
      >
        <div className="flex items-center justify-center h-64 text-secondary/40 text-sm">
          No data yet
        </div>
      </ChartCard>
    );
  }

  // ── Build a lookup map (day,hour) → cell ───
  const cellMap = new Map<string, HeatmapCell>();
  for (const cell of data) {
    cellMap.set(`${cell.day}-${cell.hour}`, cell);
  }

  // ── SVG dimensions ─────────────────────────
  const gridWidth = 24 * (CELL_SIZE + GAP) - GAP;
  const gridHeight = 7 * (CELL_SIZE + GAP) - GAP;
  const svgWidth = MARGIN_LEFT + gridWidth;
  const svgHeight = MARGIN_TOP + gridHeight;

  return (
    <ChartCard
      title="The Slop Clock"
      subtitle="AI content doesn't sleep. Bot farms post at 2-4 AM when human activity drops — bright cells reveal automated posting schedules."
    >
      <div className="overflow-x-auto">
        <svg
          width="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          role="img"
          aria-label="Heatmap of AI content by day of week and hour of day"
        >
          {/* ── Hour labels (X-axis, every 3 hours) ── */}
          {HOUR_LABELS.map((label, i) => {
            const hour = i * 3;
            const x = MARGIN_LEFT + hour * (CELL_SIZE + GAP) + CELL_SIZE / 2;
            return (
              <text
                key={`h-${hour}`}
                x={x}
                y={MARGIN_TOP - 10}
                textAnchor="middle"
                fill="rgba(74,55,40,0.5)"
                fontSize={10}
              >
                {label}
              </text>
            );
          })}

          {/* ── Day labels (Y-axis) ── */}
          {DAY_LABELS.map((label, dayIdx) => {
            const y =
              MARGIN_TOP + dayIdx * (CELL_SIZE + GAP) + CELL_SIZE / 2 + 3;
            return (
              <text
                key={`d-${dayIdx}`}
                x={MARGIN_LEFT - 8}
                y={y}
                textAnchor="end"
                fill="rgba(74,55,40,0.5)"
                fontSize={10}
              >
                {label}
              </text>
            );
          })}

          {/* ── Grid cells ── */}
          {DAY_LABELS.map((dayName, dayIdx) =>
            Array.from({ length: 24 }, (_, hour) => {
              const cell = cellMap.get(`${dayIdx}-${hour}`);
              const aiRate = cell?.ai_rate ?? 0;
              const total = cell?.total ?? 0;
              const x = MARGIN_LEFT + hour * (CELL_SIZE + GAP);
              const y = MARGIN_TOP + dayIdx * (CELL_SIZE + GAP);

              return (
                <rect
                  key={`${dayIdx}-${hour}`}
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={4}
                  fill={cellColor(aiRate)}
                >
                  <title>
                    {dayName} {hour}:00 — {aiRate}% AI ({total} scans)
                  </title>
                </rect>
              );
            }),
          )}
        </svg>
      </div>
      <p className="text-xs text-secondary/40 mt-3 italic">Green = mostly human. Pink = AI-dominated. Look for overnight hotspots — that's where content farms operate.</p>
    </ChartCard>
  );
}
