"use client";

import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
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
  verdict: Verdict;
  content_type: string;
}

/* ── component ─────────────────────────────────────────── */

export function DetectionVelocity({ scans }: { scans: ScanRecord[] }) {
  /* filter to scans with valid duration */
  const validScans = useMemo(
    () => scans.filter((s) => s.scan_duration_ms != null && s.scan_duration_ms > 0),
    [scans],
  );

  /* group by verdict */
  const grouped = useMemo(() => {
    const map: Record<string, ScatterDatum[]> = {};
    for (const s of validScans) {
      const v = s.verdict;
      if (!map[v]) map[v] = [];
      map[v].push({
        x: s.scan_duration_ms!,
        y: s.confidence,
        verdict: v,
        content_type: s.content_type,
      });
    }
    return map;
  }, [validScans]);

  /* average duration reference line */
  const avgDuration = useMemo(() => {
    if (validScans.length === 0) return 0;
    return (
      validScans.reduce((a, s) => a + (s.scan_duration_ms ?? 0), 0) /
      validScans.length
    );
  }, [validScans]);

  /* ── empty state ───────────────────────────────────── */

  if (scans.length === 0 || validScans.length === 0) {
    return (
      <ChartCard
        title="Detection Velocity"
        subtitle="Speed vs. accuracy — how fast each scan resolves"
      >
        <p className="py-16 text-center text-sm text-secondary/40">
          No scans with duration data to plot yet.
        </p>
      </ChartCard>
    );
  }

  /* ── tick formatters ─────────────────────────────────── */

  const durationTick = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}s` : `${v}ms`;

  const pctTick = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <ChartCard
      title="Detection Velocity"
      subtitle="Speed vs. accuracy — how fast each scan resolves"
    >
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.gridLine}
          />

          <XAxis
            dataKey="x"
            type="number"
            name="Duration (ms)"
            scale="log"
            domain={["auto", "auto"]}
            tickFormatter={durationTick}
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
          />
          <YAxis
            dataKey="y"
            type="number"
            name="Confidence"
            domain={[0, 1]}
            tickFormatter={pctTick}
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
          />

          {/* average duration reference line */}
          <ReferenceLine
            x={avgDuration}
            stroke="rgba(74,55,40,0.3)"
            strokeDasharray="5 5"
            label={{
              value: "Avg",
              fill: "rgba(74,55,40,0.4)",
              fontSize: 10,
              position: "top",
            }}
          />

          {/* one <Scatter> per verdict */}
          {Object.entries(grouped).map(([verdict, data]) => (
            <Scatter
              key={verdict}
              name={verdictLabels[verdict] ?? verdict}
              data={data}
              fill={verdictColors[verdict] ?? CHART_COLORS.slate}
              fillOpacity={0.65}
            />
          ))}

          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value: number, name: string) => {
              if (name === "Duration (ms)") return [durationTick(value), "Duration"];
              if (name === "Confidence") return [`${Math.round(value * 100)}%`, name];
              return [value, name];
            }}
            labelFormatter={() => ""}
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const point = payload[0]?.payload as ScatterDatum | undefined;
              if (!point) return null;
              return (
                <div style={CHART_TOOLTIP_STYLE} className="px-3 py-2 text-xs shadow-md">
                  <p className="font-semibold" style={{ color: verdictColors[point.verdict] }}>
                    {verdictLabels[point.verdict] ?? point.verdict}
                  </p>
                  <p className="mt-1">
                    Duration: <strong>{durationTick(point.x)}</strong>
                  </p>
                  <p>
                    Confidence: <strong>{Math.round(point.y * 100)}%</strong>
                  </p>
                  <p className="text-secondary/50 mt-0.5 capitalize">
                    {point.content_type}
                  </p>
                </div>
              );
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
