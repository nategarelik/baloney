"use client";

import { useState } from "react";
import { detectPreview } from "@/lib/api";
import { DetectionBadge } from "@/components/DetectionBadge";
import type { TextDetectionResult } from "@/lib/types";

const PLATFORMS = ["Twitter", "Reddit", "LinkedIn", "Instagram"] as const;
type PlatformName = (typeof PLATFORMS)[number];

const PLATFORM_NOTIFICATIONS: Record<PlatformName, { icon: string; message: string; style: string }> = {
  Twitter: {
    icon: "⚠",
    message: "This post may contain AI-generated content",
    style: "bg-yellow-500/10 border-yellow-500/30 text-yellow-200",
  },
  Reddit: {
    icon: "🏷",
    message: "Suggested flair: AI Content",
    style: "bg-orange-500/10 border-orange-500/30 text-orange-200",
  },
  LinkedIn: {
    icon: "ℹ",
    message: "AI Disclosure recommended for this content",
    style: "bg-blue-500/10 border-blue-500/30 text-blue-200",
  },
  Instagram: {
    icon: "🤖",
    message: "AI-generated content label applied",
    style: "bg-slate-500/10 border-slate-500/30 text-slate-200",
  },
};

function getSentenceColor(aiProbability: number): string {
  if (aiProbability < 0.3) return "rgba(34, 197, 94, 0.15)";
  if (aiProbability < 0.6) return "rgba(245, 158, 11, 0.18)";
  return "rgba(239, 68, 68, 0.2)";
}

function getTrustScoreColor(score: number): string {
  if (score > 0.7) return "#22c55e";
  if (score > 0.4) return "#f59e0b";
  return "#ef4444";
}

export default function PlatformPage() {
  const [text, setText] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformName>("Twitter");
  const [result, setResult] = useState<TextDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSentence, setHoveredSentence] = useState<number | null>(null);

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await detectPreview(text, selectedPlatform.toLowerCase());
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-navy text-slate-200">
      {/* Hero */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Platform Simulator</h1>
        <p className="text-slate-400">See how platforms would handle AI-flagged content</p>
      </section>

      {/* Input section */}
      <section className="px-6 pb-8 max-w-4xl mx-auto space-y-4">
        <div className="bg-navy-light rounded-xl border border-navy-lighter p-6 space-y-4">
          <textarea
            className="w-full min-h-[200px] bg-navy border border-navy-lighter rounded-lg p-4 text-slate-200 placeholder-slate-500 resize-y focus:outline-none focus:border-accent text-sm"
            placeholder="Paste or type content to simulate platform responses..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Platform selector */}
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  selectedPlatform === p
                    ? "bg-accent border-accent text-white"
                    : "bg-navy border-navy-lighter text-slate-400 hover:text-white hover:border-slate-500"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="px-6 py-2.5 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Content →"
            )}
          </button>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Score summary */}
            <div className="bg-navy-light rounded-xl border border-navy-lighter p-6">
              <h2 className="text-white font-semibold mb-4">Analysis Results</h2>
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-center">
                  <p
                    className="text-5xl font-bold"
                    style={{ color: getTrustScoreColor(result.trust_score) }}
                  >
                    {Math.round(result.trust_score * 100)}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">Trust Score</p>
                </div>

                <DetectionBadge
                  verdict={result.verdict}
                  confidence={result.confidence}
                  animate={false}
                  className="text-sm px-3 py-1.5"
                />

                <div className="flex-1 min-w-[200px]">
                  <p className="text-slate-400 text-xs mb-1">Edit Magnitude</p>
                  <div className="h-2 bg-navy rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${Math.round(result.edit_magnitude * 100)}%` }}
                    />
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{Math.round(result.edit_magnitude * 100)}%</p>
                </div>
              </div>
            </div>

            {/* Sentence heatmap */}
            {result.sentence_scores.length > 0 && (
              <div className="bg-navy-light rounded-xl border border-navy-lighter p-6">
                <h2 className="text-white font-semibold mb-3">Sentence Heatmap</h2>
                <div className="text-sm leading-7 relative">
                  {result.sentence_scores.map((s, i) => (
                    <span
                      key={i}
                      className="relative cursor-default rounded px-0.5 mx-0.5"
                      style={{ backgroundColor: getSentenceColor(s.ai_probability) }}
                      onMouseEnter={() => setHoveredSentence(i)}
                      onMouseLeave={() => setHoveredSentence(null)}
                    >
                      {s.text}
                      {hoveredSentence === i && (
                        <span className="absolute -top-7 left-0 bg-navy-lighter text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 border border-navy-lighter">
                          AI: {Math.round(s.ai_probability * 100)}%
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Platform notification cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PLATFORMS.map((p) => {
                const notif = PLATFORM_NOTIFICATIONS[p];
                return (
                  <div
                    key={p}
                    className="bg-navy-light rounded-xl border border-navy-lighter p-5 flex flex-col gap-3"
                  >
                    <p className="text-white font-semibold text-sm">{p}</p>
                    <div className={`rounded-lg border px-4 py-2 text-sm ${notif.style}`}>
                      <span className="mr-2">{notif.icon}</span>
                      {notif.message}
                    </div>
                    <p className="text-slate-500 text-xs mt-auto">Powered by Baloney API</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
