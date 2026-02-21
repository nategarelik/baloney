"use client";

import { ScanSearch, AlertTriangle, TrendingUp } from "lucide-react";
import { ChartCard } from "@/components/ChartCard";
import { StatCard } from "@/components/StatCard";
import { ExposureDonut } from "./ExposureDonut";
import { ScanTimeline } from "./ScanTimeline";
import { PlatformBreakdown } from "./PlatformBreakdown";
import { RecentScansTable } from "./RecentScansTable";
import type { PersonalAnalytics, ScanRecord } from "@/lib/types";

interface PersonalTabProps {
  analytics: PersonalAnalytics | null;
  scans: ScanRecord[];
  loading: boolean;
}

export function PersonalTab({ analytics, scans, loading }: PersonalTabProps) {
  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-navy-light rounded-xl border border-navy-lighter p-5 h-28 animate-pulse" />
          ))}
        </div>
        <div className="bg-navy-light rounded-xl border border-navy-lighter p-5 h-72 animate-pulse" />
      </div>
    );
  }

  const aiCount = analytics.by_verdict.find((v) => v.verdict === "ai_generated")?.count ?? 0;
  const avgConfidence = scans.length > 0
    ? scans.reduce((sum, s) => sum + s.confidence, 0) / scans.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Top row: donut + stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ChartCard title="AI Exposure" subtitle="Your AI content rate">
          <ExposureDonut aiRate={analytics.ai_exposure_rate} totalScans={analytics.total_scans} />
        </ChartCard>
        <StatCard
          icon={ScanSearch}
          label="Total Scans"
          value={analytics.total_scans.toLocaleString()}
          subtext="All-time detections"
        />
        <StatCard
          icon={AlertTriangle}
          label="AI Detected"
          value={aiCount.toLocaleString()}
          subtext={`${Math.round(analytics.ai_exposure_rate * 100)}% of your content`}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Confidence"
          value={`${Math.round(avgConfidence * 100)}%`}
          subtext="Across all scans"
        />
      </div>

      {/* Scan timeline */}
      <ChartCard title="Scan Activity" subtitle="Daily scan volume over time">
        <ScanTimeline scans={scans} />
      </ChartCard>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Platform Breakdown" subtitle="Scans and AI detections by platform">
          <PlatformBreakdown data={analytics.by_platform} />
        </ChartCard>
        <ChartCard title="Recent Scans" subtitle="Your latest detection results">
          <RecentScansTable scans={scans} />
        </ChartCard>
      </div>
    </div>
  );
}
