"use client";

import { useState, useEffect } from "react";
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
} from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import { getTopProvenance } from "@/lib/api";
import type { ContentProvenance } from "@/lib/types";

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
  verdict: string;
  platforms: number;
  hash: string;
}

/* ── custom tooltip ────────────────────────────────────── */

function TrajectoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ScatterDatum }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div style={CHART_TOOLTIP_STYLE} className="px-3 py-2 text-xs shadow-md">
      <p className="font-semibold mb-1">#{d.hash}</p>
      <p>Spread: {d.x} hours</p>
      <p>Sightings: {d.y}</p>
      <p>Platforms: {d.platforms}</p>
      <p>Compound Score: {d.z.toFixed(2)}</p>
    </div>
  );
}

/* ── component ─────────────────────────────────────────── */

export function ViralTrajectory() {
  const [data, setData] = useState<ContentProvenance[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopProvenance(50)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  /* ── loading state ─────────────────────────────────── */

  if (loading) {
    return (
      <ChartCard
        title="Viral Trajectory"
        subtitle="How fast content spreads — hours from first sighting vs reach"
      >
        <div className="h-64 animate-pulse bg-secondary/5 rounded-lg" />
      </ChartCard>
    );
  }

  /* ── empty state ───────────────────────────────────── */

  if (!data || data.length === 0) {
    return (
      <ChartCard
        title="Viral Trajectory"
        subtitle="How fast content spreads — hours from first sighting vs reach"
      >
        <p className="py-16 text-center text-sm text-secondary/40">
          No provenance data to plot yet.
        </p>
      </ChartCard>
    );
  }

  /* ── transform data ────────────────────────────────── */

  const chartData = data.map((d) => {
    const first = new Date(d.first_seen).getTime();
    const last = new Date(d.last_seen).getTime();
    const spreadHours = Math.max(0.1, (last - first) / (1000 * 60 * 60));
    return {
      x: Math.round(spreadHours * 10) / 10,
      y: d.sighting_count,
      z: d.compound_score,
      verdict: d.compound_verdict,
      platforms: d.platforms.length,
      hash: d.content_hash.slice(0, 8),
    };
  });

  /* ── group by verdict ──────────────────────────────── */

  const grouped: Record<string, ScatterDatum[]> = {};
  for (const point of chartData) {
    const v = point.verdict;
    if (!grouped[v]) grouped[v] = [];
    grouped[v].push(point);
  }

  return (
    <ChartCard
      title="Viral Trajectory"
      subtitle="How fast content spreads — hours from first sighting vs reach"
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
            name="Spread (hours)"
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
            label={{
              value: "Hours",
              position: "insideBottomRight",
              offset: -5,
              fill: CHART_COLORS.axisLabel,
              fontSize: 10,
            }}
          />
          <YAxis
            dataKey="y"
            type="number"
            name="Sightings"
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
          />
          <ZAxis dataKey="z" range={[40, 200]} name="Compound Score" />

          {/* one <Scatter> per verdict */}
          {Object.entries(grouped).map(([verdict, points]) => (
            <Scatter
              key={verdict}
              name={verdictLabels[verdict] ?? verdict}
              data={points}
              fill={verdictColors[verdict] ?? CHART_COLORS.slate}
              fillOpacity={0.6}
            />
          ))}

          <Tooltip
            content={<TrajectoryTooltip />}
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
