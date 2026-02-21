"use client";

import { useState } from "react";
import { detectText } from "@/lib/api";
import { DetectionBadge } from "@/components/DetectionBadge";
import type { TextDetectionResult } from "@/lib/types";
import { TrustScoreGauge } from "./TrustScoreGauge";
import { SentenceHeatmap } from "./SentenceHeatmap";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { DEMO_USER_ID } from "@/lib/constants";

export default function AnalyzePage() {
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

  return (
    <main className="min-h-screen bg-navy text-slate-200">
      {/* Hero */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Text Analyzer</h1>
        <p className="text-slate-400">Deep analysis with sentence-level AI detection</p>
      </section>

      {/* Input */}
      <section className="px-6 pb-8 max-w-4xl mx-auto space-y-4">
        <div className="bg-navy-light rounded-xl border border-navy-lighter p-6 space-y-4">
          <textarea
            className="w-full min-h-[200px] bg-navy border border-navy-lighter rounded-lg p-4 text-slate-200 placeholder-slate-500 resize-y focus:outline-none focus:border-accent text-sm"
            placeholder="Paste text to analyze for AI content..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

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
              "Analyze Text →"
            )}
          </button>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Top summary row */}
            <div className="bg-navy-light rounded-xl border border-navy-lighter p-6 flex flex-wrap items-center gap-8">
              <TrustScoreGauge score={result.trust_score} />

              <div className="flex flex-col gap-3">
                <DetectionBadge
                  verdict={result.verdict}
                  confidence={result.confidence}
                  animate={false}
                  className="text-sm px-3 py-1.5 w-fit"
                />
                <div>
                  <p className="text-slate-400 text-xs">AI Probability</p>
                  <p className="text-white text-lg font-semibold">
                    {Math.round(result.ai_probability * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Words</p>
                  <p className="text-white">{result.text_stats.word_count}</p>
                </div>
              </div>

              {result.caveat && (
                <div className="flex-1 min-w-[200px] bg-navy rounded-lg border border-navy-lighter px-4 py-3">
                  <p className="text-slate-400 text-xs leading-relaxed">{result.caveat}</p>
                </div>
              )}
            </div>

            <SentenceHeatmap sentenceScores={result.sentence_scores} />
            <ScoreBreakdown featureVector={result.feature_vector} />
          </div>
        )}
      </section>
    </main>
  );
}
