"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import type { PlatformBreakdown as PlatformData } from "@/lib/types";

interface PlatformBreakdownProps {
  data: PlatformData[];
}

export function PlatformBreakdown({ data }: PlatformBreakdownProps) {
  const chartData = data.map((d) => ({
    platform: d.platform.replace("_", " "),
    Total: d.total,
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
        <Bar dataKey="Total" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
        <Bar dataKey="AI" fill={CHART_COLORS.ai} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
