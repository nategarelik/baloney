"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { detectImage } from "@/lib/api";
import { useUserId } from "@/hooks/useUserId";
import type { DetectionResult } from "@/lib/types";
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

interface ImageDetectorPanelProps {
  externalResult?: DetectionResult | null;
  sourceUrl?: string;
  sourcePageUrl?: string;
}

export function ImageDetectorPanel({
  externalResult,
  sourceUrl,
  sourcePageUrl,
}: ImageDetectorPanelProps) {
  const userId = useUserId();
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
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
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
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
          const data = await detectImage(base64, userId, "manual_upload");
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

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    },
    [handleFile],
  );

  const color = result
    ? VERDICT_COLORS[result.verdict] || "#4a3728"
    : "#4a3728";
  const label = result ? VERDICT_LABELS[result.verdict] || result.verdict : "";

  return (
    <div className="space-y-4" onPaste={handlePaste}>
      {/* Source context (extension flow) or drop zone (direct flow) */}
      {hasExternalSource ? (
        <SourceContext sourceUrl={sourceUrl} sourcePageUrl={sourcePageUrl} type="image" />
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
            <img
              src={preview}
              alt="Uploaded image"
              className="max-h-64 mx-auto rounded-lg"
            />
          ) : (
            <div className="py-8">
              <div className="text-4xl mb-3 opacity-50">&#x1f5bc;&#xfe0f;</div>
              <p className="text-secondary/60 font-medium">
                Drop an image, paste from clipboard, or click to upload
              </p>
              <p className="text-secondary/40 text-sm mt-1">
                PNG, JPG, WebP supported
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
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
            Analyzing image...
          </span>
        </div>
      )}

      {error && <p className="text-primary text-sm">{error}</p>}

      {/* Result — Tier 1: Verdict + confidence + pipeline badge */}
      {result && !loading && (
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
                <PipelineStageBadge modelUsed={result.model_used} />
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

          {/* Tier 2: Human Score — small contextualized stat */}
          <div className="bg-base-dark/70 border border-secondary/8 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="text-lg font-semibold text-secondary">
              {Math.round(result.trust_score * 100)}%
            </div>
            <div>
              <p className="text-secondary/50 text-xs">Human Score</p>
              <p className="text-secondary/30 text-[10px]">How likely this content is genuine</p>
            </div>
          </div>

          {/* Tier 3: Model info */}
          <p className="text-secondary/30 text-xs">
            Model: {result.model_used}
          </p>
        </div>
      )}

      {/* Tier 1: Method breakdown — promoted to primary position */}
      {result &&
        !loading &&
        result.method_scores &&
        Object.keys(result.method_scores).length > 0 && (
          <MethodBreakdown
            methodScores={result.method_scores}
            type="image"
            modelUsed={result.model_used}
          />
        )}
    </div>
  );
}
