"use client";

import { useState, useEffect, useCallback } from "react";
import { PersonalTab } from "./PersonalTab";
import { CommunityTab } from "./CommunityTab";
import { SlopIndexCard } from "./SlopIndexCard";
import { ExposureScoreCard } from "./ExposureScoreCard";
import { InformationDietCard } from "./InformationDietCard";
import { ProvenanceTable } from "./ProvenanceTable";
import { DEMO_USER_ID } from "@/lib/constants";
import { cn } from "@/lib/cn";
import {
  getPersonalAnalytics,
  getMyScans,
  getCommunityAnalytics,
  getCommunityTrends,
  getDomainLeaderboard,
} from "@/lib/api";
import type {
  PersonalAnalytics,
  CommunityAnalytics,
  CommunityTrends,
  DomainLeaderboard,
  ScanRecord,
} from "@/lib/types";

export default function DashboardPage() {
  const [tab, setTab] = useState<"personal" | "community">("personal");

  // Personal data
  const [personalData, setPersonalData] = useState<PersonalAnalytics | null>(null);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [personalLoading, setPersonalLoading] = useState(true);

  // Community data
  const [communityData, setCommunityData] = useState<CommunityAnalytics | null>(null);
  const [trends, setTrends] = useState<CommunityTrends | null>(null);
  const [leaderboard, setLeaderboard] = useState<DomainLeaderboard | null>(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityFetched, setCommunityFetched] = useState(false);

  // Fetch personal data on mount
  useEffect(() => {
    async function fetchPersonal() {
      try {
        const [analyticsRes, scansRes] = await Promise.all([
          getPersonalAnalytics(DEMO_USER_ID),
          getMyScans(DEMO_USER_ID, 200),
        ]);
        setPersonalData(analyticsRes);
        setScans(scansRes.scans);
      } catch (err) {
        console.error("Failed to fetch personal analytics:", err);
      } finally {
        setPersonalLoading(false);
      }
    }
    fetchPersonal();
  }, []);

  // Fetch community data lazily on first tab switch
  const fetchCommunity = useCallback(async () => {
    if (communityFetched) return;
    setCommunityLoading(true);
    try {
      const [communityRes, trendsRes, leaderboardRes] = await Promise.all([
        getCommunityAnalytics(),
        getCommunityTrends(30),
        getDomainLeaderboard(15),
      ]);
      setCommunityData(communityRes);
      setTrends(trendsRes);
      setLeaderboard(leaderboardRes);
      setCommunityFetched(true);
    } catch (err) {
      console.error("Failed to fetch community analytics:", err);
    } finally {
      setCommunityLoading(false);
    }
  }, [communityFetched]);

  useEffect(() => {
    if (tab === "community") {
      fetchCommunity();
    }
  }, [tab, fetchCommunity]);

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400 text-sm mb-6">
          Your AI content detection analytics
        </p>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8">
          {(["personal", "community"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition capitalize",
                tab === t
                  ? "bg-accent text-white"
                  : "bg-navy-light text-slate-400 hover:text-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "personal" ? (
          <div className="space-y-6">
            <InformationDietCard />
            <ExposureScoreCard />
            <PersonalTab
              analytics={personalData}
              scans={scans}
              loading={personalLoading}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <SlopIndexCard />
            <CommunityTab
              analytics={communityData}
              trends={trends}
              leaderboard={leaderboard}
              scans={scans}
              loading={communityLoading}
            />
            <ProvenanceTable />
          </div>
        )}
      </div>
    </main>
  );
}
