"use client";

import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import type { ScanRecord, Verdict } from "@/lib/types";

/* ── verdict colour + label map ────────────────────────── */

const verdictColors: Record<string, string> = {
  ai_generated: "#d4456b",
  heavy_edit: "#f97316",
  light_edit: "#f59e0b",
  human: "#16a34a",
};

const verdictLabels: Record<string, string> = {
  ai_generated: "AI",
  heavy_edit: "Heavy Edit",
  light_edit: "Light Edit",
  human: "Human",
};

/* ── per-point datum fed into each <Scatter> ───────────── */

interface ScatterDatum {
  x: number;
  y: number;
  z: number;
  verdict: Verdict;
}

/* ── component ─────────────────────────────────────────── */

export function ConfidenceConviction({ scans }: { scans: ScanRecord[] }) {
  /* group scans by verdict */
  const grouped = useMemo(() => {
    const map: Record<string, ScatterDatum[]> = {};
    for (const s of scans) {
      const v = s.verdict;
      if (!map[v]) map[v] = [];
      map[v].push({
        x: s.confidence,
        y: s.edit_magnitude ?? 0,
        z: s.scan_duration_ms ?? 100,
        verdict: v,
      });
    }
    return map;
  }, [scans]);

  /* ── empty state ───────────────────────────────────── */

  if (scans.length === 0) {
    return (
      <ChartCard
        title="Confidence vs. Conviction"
        subtitle="Our ensemble catches 100% of Gemini/ChatGPT but only 83% of Claude. High edit magnitude + high confidence = smoking gun AI."
      >
        <p className="py-16 text-center text-sm text-secondary/40">
          No scans to plot yet.
        </p>
      </ChartCard>
    );
  }

  /* ── tick formatter ────────────────────────────────── */

  const pctTick = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <ChartCard
      title="Confidence vs. Conviction"
      subtitle="Our ensemble catches 100% of Gemini/ChatGPT but only 83% of Claude. High edit magnitude + high confidence = smoking gun AI."
    >
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.gridLine}
          />

          <XAxis
            dataKey="x"
            type="number"
            name="Confidence"
            domain={[0, 1]}
            tickFormatter={pctTick}
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
          />
          <YAxis
            dataKey="y"
            type="number"
            name="Edit Magnitude"
            domain={[0, 1]}
            tickFormatter={pctTick}
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
          />
          <ZAxis dataKey="z" range={[30, 120]} name="Scan Duration" />

          {/* quadrant dividers */}
          <ReferenceLine
            x={0.5}
            stroke="rgba(74,55,40,0.15)"
            strokeDasharray="5 5"
          />
          <ReferenceLine
            y={0.5}
            stroke="rgba(74,55,40,0.15)"
            strokeDasharray="5 5"
          />

          {/* quadrant labels */}
          <ReferenceArea
            x1={0.5}
            x2={1}
            y1={0.5}
            y2={1}
            fill="transparent"
            label={{
              value: "Smoking Gun",
              fill: "rgba(74,55,40,0.25)",
              fontSize: 10,
            }}
          />
          <ReferenceArea
            x1={0}
            x2={0.5}
            y1={0.5}
            y2={1}
            fill="transparent"
            label={{
              value: "Heavily Edited",
              fill: "rgba(74,55,40,0.25)",
              fontSize: 10,
            }}
          />
          <ReferenceArea
            x1={0.5}
            x2={1}
            y1={0}
            y2={0.5}
            fill="transparent"
            label={{
              value: "Clean AI",
              fill: "rgba(74,55,40,0.25)",
              fontSize: 10,
            }}
          />
          <ReferenceArea
            x1={0}
            x2={0.5}
            y1={0}
            y2={0.5}
            fill="transparent"
            label={{
              value: "Authentic Zone",
              fill: "rgba(74,55,40,0.25)",
              fontSize: 10,
            }}
          />

          {/* one <Scatter> per verdict */}
          {Object.entries(grouped).map(([verdict, data]) => (
            <Scatter
              key={verdict}
              name={verdictLabels[verdict] ?? verdict}
              data={data}
              fill={verdictColors[verdict] ?? CHART_COLORS.slate}
              fillOpacity={0.7}
            />
          ))}

          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value: number, name: string) => {
              if (name === "Confidence") return [`${Math.round(value * 100)}%`, name];
              if (name === "Edit Magnitude") return [`${Math.round(value * 100)}%`, name];
              if (name === "Scan Duration") return [`${value} ms`, name];
              return [value, name];
            }}
          />

          <Legend
            formatter={(v: string) => (
              <span className="text-xs text-secondary/70">{v}</span>
            )}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
