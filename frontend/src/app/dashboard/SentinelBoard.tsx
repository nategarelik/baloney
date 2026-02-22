"use client";

import { useEffect, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import { getSentinelDistribution } from "@/lib/api";
import { ChartCard } from "@/components/ChartCard";
import type { SentinelLevel } from "@/lib/types";

interface SentinelBoardProps {
  userLevel?: string;
}

export function SentinelBoard({ userLevel }: SentinelBoardProps) {
  const [data, setData] = useState<SentinelLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSentinelDistribution()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ChartCard
        title="Community Sentinel Board"
        subtitle="Experienced scanners catch 3-5x more AI content. Level up from Novice (0-169) to Sentinel (680+) by scanning consistently across platforms."
      >
        <div className="h-64 animate-pulse bg-secondary/5 rounded-lg" />
      </ChartCard>
    );
  }

  if (data.length === 0) {
    return (
      <ChartCard
        title="Community Sentinel Board"
        subtitle="Experienced scanners catch 3-5x more AI content. Level up from Novice (0-169) to Sentinel (680+) by scanning consistently across platforms."
      >
        <p className="text-sm text-secondary/50 py-8 text-center">
          No sentinel data available yet.
        </p>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Community Sentinel Board"
      subtitle="Experienced scanners catch 3-5x more AI content. Level up from Novice (0-169) to Sentinel (680+) by scanning consistently across platforms."
    >
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart layout="vertical" data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.gridLine}
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="level"
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
            width={75}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs text-secondary/70">{value}</span>
            )}
          />
          <Bar
            dataKey="count"
            fill="#e8c97a"
            barSize={20}
            radius={[0, 4, 4, 0]}
            name="Users"
          />
          <Line
            type="monotone"
            dataKey="avg_ai_caught"
            stroke={CHART_COLORS.ai}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.ai, r: 4 }}
            name="Avg AI Caught"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {userLevel && (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-secondary/70">
            You are{" "}
            <span className="font-semibold text-primary">{userLevel}</span>{" "}
            level
          </span>
        </div>
      )}
    </ChartCard>
  );
}
