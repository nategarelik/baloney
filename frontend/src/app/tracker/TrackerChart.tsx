"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getTrackerTrends } from "@/lib/api";
import type { TrendDay } from "@/lib/types";

interface TrackerChartProps {
  platform: string;
  contentType: string;
  footnote?: string;
}

export function TrackerChart({ platform, contentType, footnote }: TrackerChartProps) {
  const [trends, setTrends] = useState<TrendDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getTrackerTrends(platform, contentType, 30)
      .then((res) => setTrends(res.trends))
      .catch((err) => setError(err.message ?? "Failed to load data"))
      .finally(() => setLoading(false));
  }, [platform, contentType]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-secondary/40">
        Loading chart data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-primary/60">
        {error}
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-secondary/40">
        No data available for this combination yet.
      </div>
    );
  }

  // Convert ai_rate to percentage for display
  const chartData = trends.map((t) => ({
    ...t,
    ai_pct: Math.round(t.ai_rate * 100),
  }));

  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,55,40,0.1)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#4a3728", opacity: 0.5, fontSize: 12 }}
              tickFormatter={(d: string) => {
                const parts = d.split("-");
                return `${parts[1]}/${parts[2]}`;
              }}
            />
            <YAxis
              tick={{ fill: "#4a3728", opacity: 0.5, fontSize: 12 }}
              tickFormatter={(v: number) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f0e6ca",
                border: "1px solid rgba(74,55,40,0.15)",
                borderRadius: "8px",
                color: "#4a3728",
              }}
              formatter={(value: number) => [`${value}%`, "AI Rate"]}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="ai_pct"
              stroke="#d4456b"
              strokeWidth={2}
              fill="#d4456b"
              fillOpacity={0.12}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {footnote && (
        <p className="mt-3 text-xs italic text-secondary/40">{footnote}</p>
      )}
    </div>
  );
}
