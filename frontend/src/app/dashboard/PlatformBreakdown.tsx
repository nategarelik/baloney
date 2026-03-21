"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import type { PlatformBreakdown as PlatformData } from "@/lib/types";

const MUTED_OPACITY = 0.4;

interface PlatformBreakdownProps {
  data: PlatformData[];
}

interface ChartRow {
  platform: string;
  Total: number;
  AI: number;
  insufficient: boolean;
  lowConfidence: boolean;
}

function buildChartRows(data: PlatformData[]): ChartRow[] {
  return data.map((d) => {
    const sampleSize = d.sample_size ?? d.total;
    const confidenceLevel = d.confidence_level;
    return {
      platform: d.platform.replace("_", " "),
      Total: d.total,
      AI: d.ai_count,
      insufficient: confidenceLevel === "insufficient" || sampleSize < 10,
      lowConfidence: confidenceLevel === "low",
    };
  });
}

export function PlatformBreakdown({ data }: PlatformBreakdownProps) {
  const chartData = buildChartRows(data);

  const hasInsufficient = chartData.some((r) => r.insufficient);

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} />
          <XAxis dataKey="platform" tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }} />
          <YAxis tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value: number, name: string, props: { payload?: ChartRow }) => {
              const row = props.payload;
              if (row?.insufficient) return ["Insufficient data", name];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ color: CHART_COLORS.axisLabel }} />
          <Bar dataKey="Total" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]}>
            {chartData.map((row, index) => (
              <Cell
                key={`total-${index}`}
                fill={CHART_COLORS.accent}
                fillOpacity={row.insufficient ? MUTED_OPACITY : row.lowConfidence ? 0.65 : 1}
              />
            ))}
          </Bar>
          <Bar dataKey="AI" fill={CHART_COLORS.ai} radius={[4, 4, 0, 0]}>
            {chartData.map((row, index) => (
              <Cell
                key={`ai-${index}`}
                fill={CHART_COLORS.ai}
                fillOpacity={row.insufficient ? MUTED_OPACITY : row.lowConfidence ? 0.65 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {hasInsufficient && (
        <p className="text-xs text-secondary/30 mt-2">
          Faded bars indicate platforms with fewer than 10 scans (insufficient data).
        </p>
      )}
    </div>
  );
}
