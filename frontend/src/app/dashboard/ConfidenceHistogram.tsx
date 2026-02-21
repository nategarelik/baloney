"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import type { ScanRecord } from "@/lib/types";

interface ConfidenceHistogramProps {
  scans: ScanRecord[];
}

export function ConfidenceHistogram({ scans }: ConfidenceHistogramProps) {
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}-${(i + 1) * 10}%`,
    count: 0,
  }));

  for (const scan of scans) {
    const idx = Math.min(Math.floor(scan.confidence * 10), 9);
    buckets[idx].count++;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={buckets}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} />
        <XAxis dataKey="range" tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }} />
        <YAxis tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }} />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
        />
        <Bar dataKey="count" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
