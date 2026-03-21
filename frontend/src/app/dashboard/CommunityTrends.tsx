"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import type { SampleMetadata, TrendDay } from "@/lib/types";

const CONFIDENCE_SUBTEXT: Record<string, string> = {
  high: "",
  medium: "",
  low: " — low confidence",
  insufficient: " — insufficient data for reliable trend",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "text-secondary/40",
  medium: "text-secondary/40",
  low: "text-amber-400/70",
  insufficient: "text-secondary/30",
};

interface CommunityTrendsProps {
  trends: TrendDay[];
  sampleMetadata?: SampleMetadata;
}

export function CommunityTrends({ trends, sampleMetadata }: CommunityTrendsProps) {
  const data = trends.map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    "AI Rate": Math.round(t.ai_rate * 100),
    total: t.total,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} />
          <XAxis dataKey="date" tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }} />
          <YAxis
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value: number) => [`${value}%`, "AI Rate"]}
          />
          <Area
            type="monotone"
            dataKey="AI Rate"
            stroke={CHART_COLORS.accent}
            strokeWidth={2}
            fill="url(#aiGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
      {sampleMetadata && (
        <p
          className={`text-xs mt-2 ${CONFIDENCE_COLORS[sampleMetadata.confidence_level]}`}
        >
          {sampleMetadata.sample_size.toLocaleString()} scans over{" "}
          {sampleMetadata.period}
          {CONFIDENCE_SUBTEXT[sampleMetadata.confidence_level]}
        </p>
      )}
    </div>
  );
}
