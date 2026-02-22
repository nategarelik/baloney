"use client";

import { useState, useEffect } from "react";
import { BarChart3, Bot, Percent } from "lucide-react";
import { ChartCard } from "@/components/ChartCard";
import { AiRateBySiteChart } from "./AiRateBySiteChart";
import { RecentScansTable } from "./RecentScansTable";
import { DEMO_USER_ID } from "@/lib/constants";
import { getMyScans } from "@/lib/api";
import type { ScanRecord } from "@/lib/types";

export default function DashboardPage() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getMyScans(DEMO_USER_ID, 200);
        setScans(res.scans);
      } catch (err) {
        console.error("Failed to fetch scans:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalScans = scans.length;
  const aiDetected = scans.filter(
    (s) => s.verdict === "ai_generated" || s.verdict === "heavy_edit",
  ).length;
  const aiRate = totalScans > 0 ? Math.round((aiDetected / totalScans) * 100) : 0;

  return (
    <main className="min-h-screen bg-base">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16 page-top-offset">
        <h1 className="text-3xl font-display text-secondary mb-2">Dashboard</h1>
        <p className="text-secondary/50 text-sm mb-6">
          Your AI content detection analytics
        </p>

        {/* ── 3 stat cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              icon: BarChart3,
              label: "Total Scans",
              value: totalScans,
            },
            {
              icon: Bot,
              label: "AI Detected",
              value: aiDetected,
            },
            {
              icon: Percent,
              label: "AI Rate",
              value: `${aiRate}%`,
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

        {/* ── AI Rate by Site ── */}
        <div className="mb-6">
          <ChartCard
            title="AI Rate by Site"
            subtitle="AI detection rate per platform over time"
          >
            {loading ? (
              <div className="h-64 animate-pulse bg-secondary/5 rounded-lg" />
            ) : (
              <AiRateBySiteChart scans={scans} />
            )}
          </ChartCard>
        </div>

        {/* ── Recent Scans ── */}
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-5">
          <h2 className="text-lg font-display text-secondary mb-4">
            Recent Scans
          </h2>
          {loading ? (
            <div className="h-48 animate-pulse bg-secondary/5 rounded-lg" />
          ) : scans.length === 0 ? (
            <p className="text-secondary/40 text-sm text-center py-8">
              No scans yet. Use the extension or Analyze page to get started.
            </p>
          ) : (
            <RecentScansTable scans={scans} />
          )}
        </div>
      </div>
    </main>
  );
}
