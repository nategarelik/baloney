"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import type { ScanRecord } from "@/lib/types";

interface ScanTimelineProps {
  scans: ScanRecord[];
}

export function ScanTimeline({ scans }: ScanTimelineProps) {
  const byDate = new Map<string, { total: number; ai: number }>();
  for (const scan of scans) {
    const date = scan.timestamp.slice(0, 10);
    const entry = byDate.get(date) ?? { total: 0, ai: 0 };
    entry.total++;
    if (scan.verdict === "ai_generated") entry.ai++;
    byDate.set(date, entry);
  }

  const data = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      "Total Scans": counts.total,
      "AI Detected": counts.ai,
    }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} />
        <XAxis dataKey="date" tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }} />
        <YAxis tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }} />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
        />
        <Legend wrapperStyle={{ color: CHART_COLORS.axisLabel }} />
        <Line type="monotone" dataKey="Total Scans" stroke={CHART_COLORS.accent} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="AI Detected" stroke={CHART_COLORS.ai} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
