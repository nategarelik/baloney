"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, TrendingUp, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import { getCommunityAnalytics } from "@/lib/api";
import type { CommunityAnalytics } from "@/lib/types";

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

const CONTENT_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  image: "Image",
  video: "Video",
};

export default function CommunityDashboardPage() {
  const [analytics, setAnalytics] = useState<CommunityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await getCommunityAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error("Failed to fetch community data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const platformData = (analytics?.by_platform ?? []).map((d) => ({
    platform: PLATFORM_LABELS[d.platform] ?? d.platform,
    Human: d.total - d.ai_count,
    AI: d.ai_count,
  }));

  const contentTypeData = (analytics?.by_content_type ?? []).map((d) => ({
    type: CONTENT_TYPE_LABELS[d.content_type] ?? d.content_type,
    Human: d.total - d.ai_count,
    AI: d.ai_count,
  }));

  return (
    <main className="min-h-screen bg-base">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16 page-top-offset">
        <h1 className="text-3xl font-display text-secondary mb-2">
          Community Dashboard
        </h1>
        <p className="text-secondary/50 text-sm mb-6">
          Aggregated AI detection data from all Baloney users
        </p>

        {/* ── 3 stat cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              icon: BarChart3,
              label: "Total Scans",
              value: analytics?.total_scans.toLocaleString() ?? "0",
            },
            {
              icon: Users,
              label: "Contributing Users",
              value: analytics?.total_users.toLocaleString() ?? "0",
            },
            {
              icon: TrendingUp,
              label: "Community AI Rate",
              value: analytics
                ? `${Math.round(analytics.ai_rate * 100)}%`
                : "0%",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-base-dark rounded-xl border border-secondary/10 p-5 flex items-center gap-4"
            >
              <div className="p-2.5 rounded-lg bg-secondary/5">
                <stat.icon className="h-5 w-5 text-secondary/50" />
              </div>
              <div>
                <p className="text-xs text-secondary/50 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-display text-secondary">
                  {loading ? "..." : stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Website */}
          <ChartCard
            title="By Website"
            subtitle="AI vs Human content per platform"
          >
            {loading ? (
              <div className="h-64 animate-pulse bg-secondary/5 rounded-lg" />
            ) : platformData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-secondary/40 text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={platformData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={CHART_COLORS.gridLine}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="platform"
                    tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.gridLine }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend
                    formatter={(value: string) => (
                      <span className="text-xs text-secondary/70">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="Human"
                    fill={CHART_COLORS.human}
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="AI"
                    fill={CHART_COLORS.ai}
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* By Medium */}
          <ChartCard title="By Medium" subtitle="AI vs Human content per type">
            {loading ? (
              <div className="h-64 animate-pulse bg-secondary/5 rounded-lg" />
            ) : contentTypeData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-secondary/40 text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={contentTypeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={CHART_COLORS.gridLine}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="type"
                    tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.gridLine }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend
                    formatter={(value: string) => (
                      <span className="text-xs text-secondary/70">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="Human"
                    fill={CHART_COLORS.human}
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="AI"
                    fill={CHART_COLORS.ai}
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>
    </main>
  );
}
