"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { HandDrawnUnderline } from "@/components/HandDrawnUnderline";
import { detectText } from "@/lib/api";
import { DEMO_USER_ID } from "@/lib/constants";
import type { TextDetectionResult } from "@/lib/types";
import { TrustScoreGauge } from "./TrustScoreGauge";
import { SentenceHeatmap } from "./SentenceHeatmap";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { AnimatedPercentage } from "./AnimatedPercentage";
import { ImageDetectorPanel } from "./ImageDetectorPanel";

const TABS = [
  { id: "text", label: "Text" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const VERDICT_COLORS: Record<string, string> = {
  ai_generated: "#d4456b",
  heavy_edit: "#f97316",
  light_edit: "#f59e0b",
  human: "#16a34a",
};

const VERDICT_LABELS: Record<string, string> = {
  ai_generated: "AI Generated",
  heavy_edit: "Heavy Edit",
  light_edit: "Light Edit",
  human: "Human Written",
};

export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState<TabId>("text");

  return (
    <main className="min-h-screen bg-base">
      <div className="max-w-4xl mx-auto px-6 py-12 page-top-offset">
        {/* Header */}
        <h1 className="font-display text-4xl text-secondary mb-2">
          AI Detector
        </h1>
        <p className="text-secondary/50 mb-8">
          Analyze text, images, and video for AI-generated content
        </p>

        {/* Tabs */}
        <div className="flex gap-8 mb-8">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative text-lg font-medium pb-2 transition-opacity",
                  isActive
                    ? "text-secondary opacity-100"
                    : "text-secondary/50 hover:text-secondary/70",
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 flex justify-center">
                    <HandDrawnUnderline width={tab.label.length * 12} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "text" && <TextPanel />}
        {activeTab === "image" && <ImageDetectorPanel />}
        {activeTab === "video" && <VideoPanel />}
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────
// Text Panel (migrated from old page)
// ──────────────────────────────────────────────

function TextPanel() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<TextDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await detectText(text, DEMO_USER_ID, "manual_upload");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const verdictColor = result
    ? VERDICT_COLORS[result.verdict] || "#4a3728"
    : "#4a3728";
  const verdictLabel = result
    ? VERDICT_LABELS[result.verdict] || result.verdict
    : "";

  return (
    <div className="space-y-4">
      <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 space-y-4">
        <textarea
          className="w-full min-h-[200px] bg-base border border-secondary/10 rounded-lg p-4 text-secondary placeholder-secondary/40 resize-y focus:outline-none focus:border-primary/50 text-sm font-body"
          placeholder="Paste text to analyze for AI content..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className="btn-primary-3d px-6 py-2.5 bg-primary text-white rounded-full font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Text"
          )}
        </button>

        {error && <p className="text-primary text-sm">{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary row */}
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 flex flex-wrap items-center gap-8">
            <TrustScoreGauge score={result.trust_score} />

            <div className="flex flex-col gap-3">
              {/* Verdict badge */}
              <div
                className="px-3 py-1.5 rounded-full text-sm font-semibold text-white w-fit"
                style={{ background: verdictColor }}
              >
                {verdictLabel}
              </div>
              <div>
                <p className="text-secondary/50 text-xs">AI Probability</p>
                <p className="text-secondary text-lg font-semibold">
                  <AnimatedPercentage value={result.ai_probability} />
                </p>
              </div>
              <div>
                <p className="text-secondary/50 text-xs">Words</p>
                <p className="text-secondary">{result.text_stats.word_count}</p>
              </div>
            </div>

            {result.caveat && (
              <div className="flex-1 min-w-[200px] bg-base rounded-lg border border-secondary/10 px-4 py-3">
                <p className="text-secondary/50 text-xs leading-relaxed">
                  {result.caveat}
                </p>
              </div>
            )}
          </div>

          <SentenceHeatmap sentenceScores={result.sentence_scores} />
          <ScoreBreakdown featureVector={result.feature_vector} />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Video Panel (placeholder with upload)
// ──────────────────────────────────────────────

function VideoPanel() {
  return (
    <div className="bg-base-dark rounded-xl border border-secondary/10 p-8 text-center">
      <div className="text-4xl mb-3 opacity-50">🎬</div>
      <p className="font-display text-xl text-secondary mb-2">
        Video Detection
      </p>
      <p className="text-secondary/50 text-sm max-w-md mx-auto">
        Video analysis uses frame extraction to detect AI-generated content.
        Upload a video or paste a URL to analyze individual frames.
      </p>
      <div className="mt-6 inline-block px-5 py-2 rounded-full border-2 border-secondary/15 text-secondary/40 text-sm font-medium">
        Coming Soon
      </div>
    </div>
  );
}
