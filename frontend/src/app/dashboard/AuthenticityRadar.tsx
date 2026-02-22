"use client";

import { useState, useEffect } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { getCommunityRadar } from "@/lib/api";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import type { RadarAxisData } from "@/lib/types";

const PLATFORM_COLORS: Record<string, string> = {
  x: "#1DA1F2",
  reddit: "#FF4500",
  instagram: "#E1306C",
  tiktok: "#000000",
  facebook: "#1877F2",
  manual_upload: "#8B5CF6",
  linkedin: "#0A66C2",
};

const AXIS_KEYS: { key: keyof RadarAxisData; label: string }[] = [
  { key: "ai_rate", label: "AI Rate" },
  { key: "avg_confidence", label: "Confidence" },
  { key: "content_diversity", label: "Diversity" },
  { key: "scan_volume", label: "Volume" },
  { key: "consensus_strength", label: "Consensus" },
];

export function AuthenticityRadar() {
  const [data, setData] = useState<RadarAxisData[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommunityRadar()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ChartCard
        title="Authenticity Radar"
        subtitle="Instagram shows 35% AI rate with high confidence — X is cleaner at 25%. Platforms with diverse content types are harder to game."
      >
        <div className="h-64 animate-pulse bg-secondary/5 rounded-lg" />
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard
        title="Authenticity Radar"
        subtitle="Instagram shows 35% AI rate with high confidence — X is cleaner at 25%. Platforms with diverse content types are harder to game."
      >
        <div className="flex items-center justify-center h-64 text-secondary/40 text-sm">
          No data yet
        </div>
      </ChartCard>
    );
  }

  // Transform: one object per axis, with each platform as a key
  const chartData = AXIS_KEYS.map(({ key, label }) => {
    const point: Record<string, string | number> = { axis: label };
    for (const row of data) {
      point[row.platform] = row[key] as number;
    }
    return point;
  });

  const platforms = data.map((d) => d.platform);

  return (
    <ChartCard
      title="Authenticity Radar"
      subtitle="Instagram shows 35% AI rate with high confidence — X is cleaner at 25%. Platforms with diverse content types are harder to game."
    >
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={chartData}>
          <PolarGrid stroke={CHART_COLORS.gridLine} />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          {platforms.map((platform) => (
            <Radar
              key={platform}
              name={platform}
              dataKey={platform}
              stroke={PLATFORM_COLORS[platform] ?? CHART_COLORS.accent}
              fill={PLATFORM_COLORS[platform] ?? CHART_COLORS.accent}
              fillOpacity={0.15}
              strokeWidth={2}
              dot={false}
            />
          ))}
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs text-secondary/70">{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
      <p className="text-xs text-secondary/40 mt-3 italic">Larger polygons = more suspicious platforms. Overlap between polygons reveals which platforms share detection profiles.</p>
    </ChartCard>
  );
}
