"use client";

import { useState, useEffect, useCallback } from "react";
import { getMyScans, getPersonalAnalytics } from "@/lib/api";
import type { PersonalAnalytics, ScanRecord } from "@/lib/types";
import { PersonalTab } from "./PersonalTab";
import { EmptyDashboard } from "./EmptyDashboard";

export default function DashboardPage() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [analytics, setAnalytics] = useState<PersonalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [scansRes, analyticsRes] = await Promise.all([
        getMyScans(200),
        getPersonalAnalytics(),
      ]);
      setScans(scansRes.scans);
      setAnalytics(analyticsRes);
      setEmpty(scansRes.scans.length === 0);
    } catch {
      // Unauthenticated or no data — show empty state
      setEmpty(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <main className="min-h-screen bg-base">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16 page-top-offset">
        <h1 className="text-3xl font-display text-secondary mb-2">
          Dashboard
        </h1>
        <p className="text-secondary/50 text-sm mb-6">
          Your personal AI detection analytics
        </p>

        {loading ? (
          <PersonalTab analytics={null} scans={[]} loading />
        ) : empty ? (
          <EmptyDashboard />
        ) : (
          <PersonalTab analytics={analytics} scans={scans} loading={false} />
        )}
      </div>
    </main>
  );
}
