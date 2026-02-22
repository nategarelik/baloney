"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { detectVideo } from "@/lib/api";
import { useUserId } from "@/hooks/useUserId";
import type { VideoDetectionResult } from "@/lib/types";
import { AnimatedPercentage } from "./AnimatedPercentage";
import { MethodBreakdown } from "./MethodBreakdown";
import { SourceContext } from "./SourceContext";
import { PipelineStageBadge } from "./PipelineStageBadge";

const VERDICT_LABELS: Record<string, string> = {
  ai_generated: "AI Generated",
  heavy_edit: "Heavy Edit",
  light_edit: "Light Edit",
  human: "Human",
};

const VERDICT_COLORS: Record<string, string> = {
  ai_generated: "#d4456b",
  heavy_edit: "#f97316",
  light_edit: "#f59e0b",
  human: "#16a34a",
};

interface VideoDetectorPanelProps {
  externalResult?: VideoDetectionResult | null;
  sourceUrl?: string;
  sourcePageUrl?: string;
}

export function VideoDetectorPanel({
  externalResult,
  sourceUrl,
  sourcePageUrl,
}: VideoDetectorPanelProps) {
  const userId = useUserId();
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<VideoDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasExternalSource = !!(externalResult && sourceUrl);

  useEffect(() => {
    if (externalResult) setResult(externalResult);
  }, [externalResult]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) {
        setError("Please upload a video file");
        return;
      }

      setError(null);
      setResult(null);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        setLoading(true);

        try {
          const data = await detectVideo(base64, userId, "manual_upload");
          setResult(data);
          localStorage.setItem("baloney_has_scanned", "true");
          window.dispatchEvent(new Event("storage"));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Analysis failed");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [userId],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const color = result
    ? VERDICT_COLORS[result.verdict] || "#4a3728"
    : "#4a3728";
  const label = result ? VERDICT_LABELS[result.verdict] || result.verdict : "";

  // Determine pipeline stage for badge
  const pipelineLabel = result?.sightengine_native
    ? "SightEngine Native"
    : result?.model_used?.includes("multi-frame")
      ? "Multi-Frame Analysis"
      : undefined;

  return (
    <div className="space-y-4">
      {/* Source context (extension flow) or drop zone (direct flow) */}
      {hasExternalSource ? (
        <SourceContext
          sourceUrl={sourceUrl}
          sourcePageUrl={sourcePageUrl}
          type="video"
        />
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${dragOver ? "border-primary bg-primary/5" : "border-secondary/20 hover:border-secondary/40 bg-base-dark/50"}
          `}
        >
          {preview ? (
            <video
              src={preview}
              controls
              className="max-h-64 mx-auto rounded-lg"
            />
          ) : (
            <div className="py-8">
              <div className="text-4xl mb-3 opacity-50">&#x1f3ac;</div>
              <p className="text-secondary/60 font-medium">
                Drop a video or click to upload
              </p>
              <p className="text-secondary/40 text-sm mt-1">
                MP4, WebM, MOV supported
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-6">
          <span className="inline-block w-5 h-5 border-2 border-secondary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-secondary/60 font-medium">
            Analyzing video frames...
          </span>
        </div>
      )}

      {error && <p className="text-primary text-sm">{error}</p>}

      {/* Result */}
      {result && !loading && (
        <>
          {/* Tier 1: Verdict + confidence + pipeline badge */}
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: `${color}15` }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: color }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-xl" style={{ color }}>
                    {label}
                  </p>
                  <PipelineStageBadge
                    modelUsed={pipelineLabel || result.model_used}
                  />
                </div>
                <p className="text-secondary/50 text-sm">
                  <AnimatedPercentage
                    value={result.confidence}
                    className="font-semibold text-secondary"
                  />{" "}
                  confidence
                </p>
              </div>
            </div>

            {/* Human Score — small contextualized stat */}
            {(result as unknown as Record<string, unknown>).trust_score !==
              undefined && (
              <div className="bg-base-dark/70 border border-secondary/8 rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="text-lg font-semibold text-secondary">
                  {Math.round(
                    ((result as unknown as Record<string, unknown>)
                      .trust_score as number) * 100,
                  )}
                  %
                </div>
                <div>
                  <p className="text-secondary/50 text-xs">Human Score</p>
                  <p className="text-secondary/30 text-[10px]">
                    How likely this content is genuine
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tier 1: Method breakdown — promoted to directly after verdict */}
          {result.method_scores &&
            Object.keys(result.method_scores).length > 0 && (
              <MethodBreakdown
                methodScores={result.method_scores}
                type="video"
                modelUsed={result.model_used}
              />
            )}

          {/* Tier 1.5: Frame stats + per-frame chart (video-specific) */}
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <StatBox
                label="Frames Analyzed"
                value={String(result.frames_analyzed)}
              />
              <StatBox
                label="AI Frames"
                value={String(result.frames_flagged_ai)}
                color={result.frames_flagged_ai > 0 ? "#d4456b" : "#16a34a"}
              />
              <StatBox
                label="AI Frame Rate"
                value={`${Math.round(result.ai_frame_percentage * 100)}%`}
                color={
                  result.ai_frame_percentage > 0.5
                    ? "#d4456b"
                    : result.ai_frame_percentage > 0.3
                      ? "#f59e0b"
                      : "#16a34a"
                }
              />
            </div>

            {/* Per-frame bar chart */}
            <div>
              <p className="text-secondary/50 text-xs mb-2 uppercase tracking-wider font-medium">
                Per-Frame AI Probability
              </p>
              <div className="flex items-end gap-[2px] h-24">
                {result.frame_scores.map((score, i) => {
                  const barColor =
                    score > 0.6
                      ? "#d4456b"
                      : score > 0.3
                        ? "#f59e0b"
                        : "#16a34a";
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm transition-all duration-500 relative group"
                      style={{
                        height: `${Math.max(score * 100, 4)}%`,
                        background: barColor,
                        opacity: 0.85,
                      }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-secondary text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {Math.round(score * 100)}%
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-secondary/30 mt-1">
                <span>Frame 1</span>
                <span>Frame {result.frame_scores.length}</span>
              </div>
            </div>

            {/* Tier 2: Dimmed duration + model info */}
            <div className="flex justify-between text-secondary/30 text-xs opacity-60">
              <span>Duration: {result.duration_seconds}s</span>
              <span>Model: {result.model_used}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-secondary/5 rounded-lg p-3 text-center">
      <p className="font-display text-xl" style={color ? { color } : undefined}>
        {value}
      </p>
      <p className="text-secondary/50 text-[10px] mt-0.5">{label}</p>
    </div>
  );
}
