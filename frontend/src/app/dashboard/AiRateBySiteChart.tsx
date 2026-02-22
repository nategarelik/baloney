"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import { isAiWithFloor } from "@/lib/bayesian";
import type { ScanRecord } from "@/lib/types";

const PLATFORM_COLORS: Record<string, string> = {
  x: "#1DA1F2",
  reddit: "#FF4500",
  linkedin: "#0A66C2",
  instagram: "#E4405F",
  substack: "#FF6719",
  tiktok: "#00f2ea",
  manual_upload: "#4a3728",
  demo_feed: "#94a3b8",
  facebook: "#1877F2",
};

const PLATFORM_LABELS: Record<string, string> = {
  x: "X",
  reddit: "Reddit",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  substack: "Substack",
  tiktok: "TikTok",
  manual_upload: "Upload",
  demo_feed: "Demo Feed",
  facebook: "Facebook",
};

interface AiRateBySiteChartProps {
  scans: ScanRecord[];
}

export function AiRateBySiteChart({ scans }: AiRateBySiteChartProps) {
  if (scans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary/40 text-sm">
        No scans yet
      </div>
    );
  }

  // Group scans by (date, platform) and compute AI rate per combo
  const grouped: Record<
    string,
    Record<string, { total: number; ai: number }>
  > = {};
  const platformSet = new Set<string>();

  for (const scan of scans) {
    const date = new Date(scan.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const platform = scan.platform;
    platformSet.add(platform);

    if (!grouped[date]) grouped[date] = {};
    if (!grouped[date][platform]) grouped[date][platform] = { total: 0, ai: 0 };

    grouped[date][platform].total++;
    if (isAiWithFloor(scan.verdict, scan.confidence)) {
      grouped[date][platform].ai++;
    }
  }

  const platforms = Array.from(platformSet);

  // Build chart data sorted by date
  const data = Object.entries(grouped)
    .map(([date, platformData]) => {
      const row: Record<string, string | number> = { date };
      for (const p of platforms) {
        if (platformData[p]) {
          row[p] = Math.round(
            (platformData[p].ai / platformData[p].total) * 100,
          );
        }
      }
      return row;
    })
    // Sort chronologically by parsing dates back
    .sort((a, b) => {
      const da = new Date(a.date + " 2026");
      const db = new Date(b.date + " 2026");
      return da.getTime() - db.getTime();
    });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={CHART_COLORS.gridLine}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }}
          axisLine={{ stroke: CHART_COLORS.gridLine }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={42}
        />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          formatter={(value: number, name: string) => [
            `${value}%`,
            PLATFORM_LABELS[name] ?? name,
          ]}
        />
        <Legend
          formatter={(value: string) => (
            <span className="text-xs text-secondary/70">
              {PLATFORM_LABELS[value] ?? value}
            </span>
          )}
        />
        {platforms.map((platform) => (
          <Line
            key={platform}
            type="monotone"
            dataKey={platform}
            stroke={PLATFORM_COLORS[platform] ?? "#94a3b8"}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
