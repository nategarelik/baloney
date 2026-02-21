"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import type { PlatformBreakdown } from "@/lib/types";

interface PlatformGroupedBarProps {
  data: PlatformBreakdown[];
}

export function PlatformGroupedBar({ data }: PlatformGroupedBarProps) {
  const chartData = data.map((d) => ({
    platform: d.platform.replace("_", " "),
    Human: d.total - d.ai_count,
    AI: d.ai_count,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} />
        <XAxis dataKey="platform" tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }} />
        <YAxis tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }} />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
        />
        <Legend wrapperStyle={{ color: CHART_COLORS.axisLabel }} />
        <Bar dataKey="Human" fill={CHART_COLORS.human} radius={[4, 4, 0, 0]} stackId="a" />
        <Bar dataKey="AI" fill={CHART_COLORS.ai} radius={[4, 4, 0, 0]} stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
