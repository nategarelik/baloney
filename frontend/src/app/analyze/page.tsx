"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { HandDrawnUnderline } from "@/components/HandDrawnUnderline";
import { detectText } from "@/lib/api";
import { useUserId } from "@/hooks/useUserId";
import type { TextDetectionResult, VideoDetectionResult } from "@/lib/types";
import { TrustScoreGauge } from "./TrustScoreGauge";
import { SentenceHeatmap } from "./SentenceHeatmap";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { AnimatedPercentage } from "./AnimatedPercentage";
import { ImageDetectorPanel } from "./ImageDetectorPanel";
import { VideoDetectorPanel } from "./VideoDetectorPanel";
import { MethodBreakdown } from "./MethodBreakdown";
import { SourceContext } from "./SourceContext";
import { PipelineStageBadge } from "./PipelineStageBadge";

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
  return (
    <Suspense fallback={<AnalyzeSkeleton />}>
      <AnalyzeContent />
    </Suspense>
  );
}

function AnalyzeSkeleton() {
  return (
    <main className="min-h-screen bg-base">
      <div className="max-w-4xl mx-auto px-6 py-12 page-top-offset">
        <div className="h-10 w-48 bg-secondary/8 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-80 bg-secondary/5 rounded animate-pulse mb-8" />
      </div>
    </main>
  );
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("text");
  const [externalTextResult, setExternalTextResult] =
    useState<TextDetectionResult | null>(null);
  const [externalImageResult, setExternalImageResult] = useState<
    import("@/lib/types").DetectionResult | null
  >(null);
  const [externalVideoResult, setExternalVideoResult] =
    useState<VideoDetectionResult | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | undefined>();
  const [sourcePageUrl, setSourcePageUrl] = useState<string | undefined>();

  useEffect(() => {
    const resultParam = searchParams.get("result");
    if (!resultParam) return;

    try {
      const parsed = JSON.parse(decodeURIComponent(resultParam));
      const result = parsed.result || parsed;
      const type = parsed.type;

      // Extract source URLs
      setSourceUrl(parsed.sourceUrl || result.sourceUrl);
      setSourcePageUrl(parsed.sourcePageUrl || result.sourcePageUrl);

      if (type === "text" || result.feature_vector || result.sentence_scores) {
        setActiveTab("text");
        setExternalTextResult(result);
      } else if (type === "video" || result.frame_scores) {
        setActiveTab("video");
        setExternalVideoResult(result);
      } else {
        setActiveTab("image");
        setExternalImageResult(result);
      }
    } catch {
      // Invalid JSON, ignore
    }
  }, [searchParams]);

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
        {activeTab === "text" && (
          <TextPanel
            externalResult={externalTextResult}
            sourceUrl={sourceUrl}
            sourcePageUrl={sourcePageUrl}
          />
        )}
        {activeTab === "image" && (
          <ImageDetectorPanel
            externalResult={externalImageResult}
            sourceUrl={sourceUrl}
            sourcePageUrl={sourcePageUrl}
          />
        )}
        {activeTab === "video" && (
          <VideoDetectorPanel
            externalResult={externalVideoResult}
            sourceUrl={sourceUrl}
            sourcePageUrl={sourcePageUrl}
          />
        )}
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────
// Text Panel (migrated from old page)
// ──────────────────────────────────────────────

function TextPanel({
  externalResult,
  sourceUrl,
  sourcePageUrl,
}: {
  externalResult?: TextDetectionResult | null;
  sourceUrl?: string;
  sourcePageUrl?: string;
}) {
  const userId = useUserId();
  const [text, setText] = useState("");
  const [result, setResult] = useState<TextDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasExternalSource = !!(externalResult && sourceUrl);

  useEffect(() => {
    if (externalResult) setResult(externalResult);
  }, [externalResult]);

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await detectText(text, userId, "manual_upload");
      setResult(data);
      localStorage.setItem("baloney_has_scanned", "true");
      window.dispatchEvent(new Event("storage"));
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
      {/* Source context (extension flow) or input area (direct flow) */}
      {hasExternalSource ? (
        <SourceContext
          sourceUrl={sourceUrl}
          sourcePageUrl={sourcePageUrl}
          type="text"
        />
      ) : (
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 space-y-4">
          <textarea
            className="w-full min-h-[200px] bg-base border border-secondary/10 rounded-lg p-4 text-secondary placeholder-secondary/40 resize-y focus:outline-none focus:border-primary/50 text-sm font-body"
            placeholder="Paste text to analyze for AI content..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <div className="text-xs text-secondary/40">
              {text.length} characters
              {text.length > 0 && text.length < 20 && (
                <span className="text-primary ml-2">Minimum 20 characters</span>
              )}
              {text.length >= 20 && text.length < 100 && (
                <span className="text-amber-600 ml-2">
                  Short text may produce less accurate results
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || text.trim().length < 20}
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
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Tier 1: Summary row — gauge + verdict + AI probability + pipeline badge */}
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 flex flex-wrap items-center gap-8">
            <TrustScoreGauge score={result.trust_score} />

            <div className="flex flex-col gap-3">
              {/* Verdict badge + pipeline stage */}
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-1.5 rounded-full text-sm font-semibold text-white w-fit"
                  style={{ background: verdictColor }}
                >
                  {verdictLabel}
                </div>
                <PipelineStageBadge modelUsed={result.model_used} />
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

          {/* Tier 1: Method breakdown — promoted position */}
          {result.method_scores &&
            Object.keys(result.method_scores).length > 0 && (
              <MethodBreakdown
                methodScores={result.method_scores}
                type="text"
                modelUsed={result.model_used}
              />
            )}

          {/* Tier 2: Sentence heatmap — slightly dimmed */}
          <div className="opacity-80">
            <SentenceHeatmap sentenceScores={result.sentence_scores} />
          </div>

          {/* Tier 3: Score breakdown — dimmed */}
          <div className="opacity-60">
            <ScoreBreakdown featureVector={result.feature_vector} />
          </div>
        </div>
      )}
    </div>
  );
}
