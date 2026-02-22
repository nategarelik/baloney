"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";

interface VideoTimelineProps {
  frameScores: number[];
}

export function VideoTimeline({ frameScores }: VideoTimelineProps) {
  if (!frameScores || frameScores.length === 0) return null;

  const data = frameScores.map((score, i) => {
    const prev = i > 0 ? frameScores[i - 1] : null;
    const next = i < frameScores.length - 1 ? frameScores[i + 1] : null;

    const values = [prev, score, next].filter((v): v is number => v !== null);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

    return { frame: i + 1, score, avg };
  });

  return (
    <ChartCard
      title="Frame Timeline"
      subtitle="Per-frame AI probability with 3-frame trend"
    >
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} />
          <XAxis
            dataKey="frame"
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
            label={{
              value: "Frame",
              position: "insideBottom",
              offset: -5,
              fill: CHART_COLORS.axisLabel,
              fontSize: 11,
            }}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
          />
          <ReferenceLine
            y={0.5}
            stroke={CHART_COLORS.unclear}
            strokeDasharray="4 4"
            label={{
              value: "Threshold",
              fill: CHART_COLORS.unclear,
              fontSize: 10,
            }}
          />
          <Bar
            dataKey="score"
            fill={CHART_COLORS.ai}
            radius={[2, 2, 0, 0]}
            shape={(props: unknown) => {
              const { x, y, width, height, payload } = props as {
                x: number;
                y: number;
                width: number;
                height: number;
                payload: { score: number };
              };
              const s = payload.score;
              const fill =
                s > 0.6
                  ? CHART_COLORS.ai
                  : s > 0.3
                    ? CHART_COLORS.unclear
                    : CHART_COLORS.human;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={fill}
                  rx={2}
                  ry={2}
                />
              );
            }}
          />
          <Line
            dataKey="avg"
            stroke={CHART_COLORS.ai}
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value: number, name: string) => [
              `${(value * 100).toFixed(1)}%`,
              name === "score" ? "AI Probability" : "3-Frame Avg",
            ]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
