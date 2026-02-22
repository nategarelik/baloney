"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { HandDrawnUnderline } from "@/components/HandDrawnUnderline";
import { detectText } from "@/lib/api";
import { useUserId } from "@/hooks/useUserId";
import { useToast } from "@/components/ToastProvider";
import { getUserErrorMessage } from "@/lib/error-messages";
import { API_LIMITS } from "@/lib/constants";
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

const TEXT_LOADING_STEPS = [
  "Preparing text...",
  "Running AI detection...",
  "Analyzing results...",
];

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

        {/* Tabs — accessible */}
        <div className="flex gap-8 mb-8" role="tablist">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative text-lg font-medium pb-2 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:rounded",
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
  const { addToast } = useToast();
  const [text, setText] = useState("");
  const [result, setResult] = useState<TextDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  const hasExternalSource = !!(externalResult && sourceUrl);

  useEffect(() => {
    if (externalResult) setResult(externalResult);
  }, [externalResult]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(stepTimerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const charCount = text.length;
  const atSoftLimit = charCount > API_LIMITS.TEXT_MAX_LENGTH;
  const atHardLimit = charCount > API_LIMITS.TEXT_HARD_MAX;

  const handleAnalyze = useCallback(async () => {
    if (!text.trim() || atHardLimit) return;
    setLoading(true);
    setLoadingStep(0);
    setError(null);

    stepTimerRef.current = setInterval(() => {
      setLoadingStep((prev) =>
        prev < TEXT_LOADING_STEPS.length - 1 ? prev + 1 : prev,
      );
    }, 2000);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await detectText(
        text,
        userId,
        "manual_upload",
        controller.signal,
      );
      setResult(data);
      addToast("success", "Text analysis complete");
      localStorage.setItem("baloney_has_scanned", "true");
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      const message = getUserErrorMessage(err);
      setError(message);
      addToast("error", message);
    } finally {
      setLoading(false);
      clearInterval(stepTimerRef.current);
      abortRef.current = null;
    }
  }, [text, userId, addToast, atHardLimit]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    clearInterval(stepTimerRef.current);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    handleAnalyze();
  }, [handleAnalyze]);

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
              <span
                className={
                  atHardLimit
                    ? "text-red-600 font-medium"
                    : atSoftLimit
                      ? "text-amber-600 font-medium"
                      : ""
                }
              >
                {charCount.toLocaleString()}
              </span>
              {" / "}
              {API_LIMITS.TEXT_MAX_LENGTH.toLocaleString()} characters
              {charCount > 0 && charCount < 20 && (
                <span className="text-primary ml-2">Minimum 20 characters</span>
              )}
              {charCount >= 20 && charCount < 100 && (
                <span className="text-amber-600 ml-2">
                  Short text may produce less accurate results
                </span>
              )}
              {atSoftLimit && !atHardLimit && (
                <span className="text-amber-600 ml-2">
                  Long text — results may be less accurate
                </span>
              )}
              {atHardLimit && (
                <span className="text-red-600 ml-2">
                  Exceeds maximum length
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading || text.trim().length < 20 || atHardLimit}
              className="btn-primary-3d px-6 py-2.5 bg-primary text-white rounded-full font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {TEXT_LOADING_STEPS[loadingStep]}
                </>
              ) : (
                "Analyze Text"
              )}
            </button>

            {loading && (
              <button
                onClick={handleCancel}
                className="text-secondary/50 text-sm hover:text-secondary transition-colors underline"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="space-y-2">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={handleRetry}
                className="text-sm text-primary font-medium underline hover:text-primary/80"
              >
                Try Again
              </button>
            </div>
          )}
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
                primaryAvailable={result.primaryAvailable}
                confidenceCapped={result.confidenceCapped}
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
