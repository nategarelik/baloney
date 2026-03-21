"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import type { PlatformBreakdown } from "@/lib/types";

const MUTED_OPACITY = 0.4;

interface PlatformGroupedBarProps {
  data: PlatformBreakdown[];
}

interface ChartRow {
  platform: string;
  Human: number;
  AI: number;
  insufficient: boolean;
  lowConfidence: boolean;
}

function buildChartRows(data: PlatformBreakdown[]): ChartRow[] {
  return data.map((d) => {
    const sampleSize = d.sample_size ?? d.total;
    const confidenceLevel = d.confidence_level;
    return {
      platform: d.platform.replace("_", " "),
      Human: d.total - d.ai_count,
      AI: d.ai_count,
      insufficient: confidenceLevel === "insufficient" || sampleSize < 10,
      lowConfidence: confidenceLevel === "low",
    };
  });
}

export function PlatformGroupedBar({ data }: PlatformGroupedBarProps) {
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
          <Bar dataKey="Human" fill={CHART_COLORS.human} radius={[4, 4, 0, 0]} stackId="a">
            {chartData.map((row, index) => (
              <Cell
                key={`human-${index}`}
                fill={CHART_COLORS.human}
                fillOpacity={row.insufficient ? MUTED_OPACITY : row.lowConfidence ? 0.65 : 1}
              />
            ))}
          </Bar>
          <Bar dataKey="AI" fill={CHART_COLORS.ai} radius={[4, 4, 0, 0]} stackId="a">
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
