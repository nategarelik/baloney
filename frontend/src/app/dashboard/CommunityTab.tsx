"use client";

import { Users, TrendingUp } from "lucide-react";
import { ChartCard } from "@/components/ChartCard";
import { StatCard } from "@/components/StatCard";
import { ShareToggle } from "@/components/ShareToggle";
import { CommunityCounter } from "./CommunityCounter";
import { CommunityTrends } from "./CommunityTrends";
import { PlatformGroupedBar } from "./PlatformGroupedBar";
import { DomainLeaderboard } from "./DomainLeaderboard";
import { ConfidenceHistogram } from "./ConfidenceHistogram";
import type {
  CommunityAnalytics,
  CommunityTrends as CommunityTrendsType,
  DomainLeaderboard as DomainLeaderboardType,
  ScanRecord,
} from "@/lib/types";
import { useUserId } from "@/hooks/useUserId";

interface CommunityTabProps {
  analytics: CommunityAnalytics | null;
  trends: CommunityTrendsType | null;
  leaderboard: DomainLeaderboardType | null;
  scans: ScanRecord[];
  loading: boolean;
}

export function CommunityTab({
  analytics,
  trends,
  leaderboard,
  scans,
  loading,
}: CommunityTabProps) {
  const userId = useUserId();
  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-base-dark rounded-xl border border-secondary/10 p-5 h-28 animate-pulse"
            />
          ))}
        </div>
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-5 h-72 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top row: counter + stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-5 flex flex-col items-center justify-center">
          <CommunityCounter
            target={analytics.total_scans}
            label="Total Community Scans"
          />
        </div>
        <StatCard
          icon={Users}
          label="Contributing Users"
          value={analytics.total_users.toLocaleString()}
          subtext="Users sharing anonymized data"
        />
        <StatCard
          icon={TrendingUp}
          label="Community AI Rate"
          value={`${Math.round(analytics.ai_rate * 100)}%`}
          subtext="Of all scanned content"
        />
      </div>

      {/* Trends chart */}
      {trends && (
        <ChartCard
          title="AI Detection Trends"
          subtitle="30-day AI content rate across the community"
        >
          <CommunityTrends
            trends={trends.trends}
            sampleMetadata={trends.sample_metadata}
          />
        </ChartCard>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Platform Distribution"
          subtitle="AI content by platform"
        >
          <PlatformGroupedBar data={analytics.by_platform} />
        </ChartCard>
        {leaderboard && (
          <ChartCard
            title="Domain Leaderboard"
            subtitle="Top domains by AI detection rate"
          >
            <DomainLeaderboard domains={leaderboard.domains} />
          </ChartCard>
        )}
      </div>

      {/* Confidence histogram */}
      <ChartCard
        title="Confidence Distribution"
        subtitle="Distribution of detection confidence scores"
      >
        <ConfidenceHistogram scans={scans} />
      </ChartCard>

      {/* Share toggle */}
      <ShareToggle userId={userId} />
    </div>
  );
}
