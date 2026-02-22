"use client";

import { useState, useEffect } from "react";
import { getInformationDietScore, getMyScans } from "@/lib/api";
import { useUserId } from "@/hooks/useUserId";
import type { InformationDietScore, ScanRecord } from "@/lib/types";
import { cn } from "@/lib/cn";
import { TrendingUp, Eye, BarChart3, Shield, Lightbulb } from "lucide-react";

const GRADE_COLORS: Record<string, string> = {
  "A+": "#22c55e",
  A: "#22c55e",
  "A-": "#22c55e",
  "B+": "#84cc16",
  B: "#84cc16",
  "B-": "#84cc16",
  "C+": "#eab308",
  C: "#eab308",
  "C-": "#eab308",
  "D+": "#f97316",
  D: "#f97316",
  "D-": "#f97316",
  F: "#ef4444",
};

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const color = GRADE_COLORS[grade] || "#94a3b8";
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="12"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform="rotate(-90 100 100)"
          className="transition-all duration-1000 ease-out"
        />
        <text
          x="100"
          y="85"
          textAnchor="middle"
          fill="#fff"
          fontSize="36"
          fontWeight="800"
        >
          {grade}
        </text>
        <text x="100" y="115" textAnchor="middle" fill="#94a3b8" fontSize="16">
          {Math.round(score)} / 100
        </text>
      </svg>
    </div>
  );
}

function BreakdownCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="bg-navy-light rounded-xl border border-navy-lighter p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <span className="text-sm text-slate-400">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
    </div>
  );
}

function getTips(score: number): string[] {
  if (score >= 80)
    return [
      "Your information diet is excellent! Keep diversifying your sources.",
      "Consider sharing your habits with others to help them improve.",
      "Stay vigilant — AI content is becoming harder to detect.",
    ];
  if (score >= 60)
    return [
      "Try browsing more diverse sources to improve your score.",
      "Use the extension's blur mode to pause before consuming AI content.",
      "Scan more content regularly to build awareness.",
    ];
  if (score >= 40)
    return [
      "Your AI content exposure is moderately high. Try to diversify.",
      "Enable the extension on all sites for better coverage.",
      "Check the dashboard weekly to track your improvement.",
    ];
  return [
    "Your information diet needs attention — high AI content exposure.",
    "Start by enabling Baloney on your most-visited sites.",
    "Use blur mode to become more conscious of AI content.",
    "Visit different news sources and platforms to diversify.",
  ];
}

export default function MyDietPage() {
  const userId = useUserId();
  const [diet, setDiet] = useState<InformationDietScore | null>(null);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dietRes, scansRes] = await Promise.all([
          getInformationDietScore(userId),
          getMyScans(userId, 20),
        ]);
        setDiet(dietRes);
        setScans(scansRes.scans);
      } catch (err) {
        console.error("Failed to load diet data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-navy text-slate-200">
        <section className="px-6 py-12 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">
            My Information Diet
          </h1>
          <div className="mt-12 flex justify-center">
            <div className="animate-pulse text-slate-500">
              Loading your diet score...
            </div>
          </div>
        </section>
      </main>
    );
  }

  const score = diet?.score ?? 0;
  const grade = diet?.letter_grade ?? "—";
  const tips = getTips(score);

  return (
    <main className="min-h-screen bg-navy text-slate-200">
      {/* Hero */}
      <section className="px-6 py-12 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          My Information Diet
        </h1>
        <p className="text-slate-400">
          How healthy is your content consumption?
        </p>
      </section>

      {/* Score Gauge */}
      <section className="px-6 pb-8 max-w-4xl mx-auto flex justify-center">
        <div className="bg-navy-light rounded-2xl border border-navy-lighter p-8">
          <ScoreGauge score={score} grade={grade} />
        </div>
      </section>

      {/* Breakdown Cards */}
      <section className="px-6 pb-8 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        <BreakdownCard
          icon={BarChart3}
          title="AI Ratio"
          value={`${Math.round((diet?.ai_content_ratio ?? 0) * 100)}%`}
          subtitle="of content is AI-generated"
          color="#ef4444"
        />
        <BreakdownCard
          icon={Eye}
          title="Source Diversity"
          value={`${Math.round((diet?.source_diversity ?? 0) * 100)}%`}
          subtitle="variety in your sources"
          color="#3b82f6"
        />
        <BreakdownCard
          icon={TrendingUp}
          title="Trend"
          value={
            (diet?.trend_direction ?? 0) > 0
              ? "Improving"
              : (diet?.trend_direction ?? 0) < 0
                ? "Declining"
                : "Stable"
          }
          subtitle="compared to last week"
          color={
            (diet?.trend_direction ?? 0) > 0
              ? "#22c55e"
              : (diet?.trend_direction ?? 0) < 0
                ? "#ef4444"
                : "#eab308"
          }
        />
        <BreakdownCard
          icon={Shield}
          title="Awareness"
          value={`${Math.round((diet?.awareness_actions ?? 0) * 100)}%`}
          subtitle="proactive scanning rate"
          color="#8b5cf6"
        />
      </section>

      {/* Tips */}
      <section className="px-6 pb-8 max-w-4xl mx-auto">
        <div className="bg-navy-light rounded-xl border border-navy-lighter p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">
              Tips to Improve
            </h2>
          </div>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-slate-300"
              >
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recent Scans */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <div className="bg-navy-light rounded-xl border border-navy-lighter p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Recent Scans
          </h2>
          {scans.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No scans yet. Install the extension to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-navy-lighter">
                    <th className="pb-2 font-medium">Platform</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Verdict</th>
                    <th className="pb-2 font-medium">Confidence</th>
                    <th className="pb-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((scan) => {
                    const verdictColor =
                      scan.verdict === "ai_generated"
                        ? "text-red-400"
                        : scan.verdict === "heavy_edit"
                          ? "text-orange-400"
                          : scan.verdict === "light_edit"
                            ? "text-amber-400"
                            : "text-green-400";
                    return (
                      <tr
                        key={scan.id}
                        className="border-b border-navy-lighter/50"
                      >
                        <td className="py-2 text-slate-300 capitalize">
                          {scan.platform}
                        </td>
                        <td className="py-2 text-slate-400 capitalize">
                          {scan.content_type}
                        </td>
                        <td
                          className={cn(
                            "py-2 font-medium capitalize",
                            verdictColor,
                          )}
                        >
                          {scan.verdict.replace("_", " ")}
                        </td>
                        <td className="py-2 text-slate-300">
                          {Math.round(scan.confidence * 100)}%
                        </td>
                        <td className="py-2 text-slate-500">
                          {new Date(scan.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
