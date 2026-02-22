"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImagePlus } from "lucide-react";
import { detectImage } from "@/lib/api";
import { useUserId } from "@/hooks/useUserId";
import { useToast } from "@/components/ToastProvider";
import { getUserErrorMessage } from "@/lib/error-messages";
import { API_LIMITS, formatFileSize } from "@/lib/constants";
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

const LOADING_STEPS = [
  "Preparing image...",
  "Running AI detection...",
  "Analyzing results...",
];

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
  const { addToast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  const lastFileRef = useRef<File | null>(null);

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

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      // File size validation
      if (file.size > API_LIMITS.IMAGE_MAX_BYTES) {
        setSizeError(
          `File is ${formatFileSize(file.size)} — maximum is ${formatFileSize(API_LIMITS.IMAGE_MAX_BYTES)}`,
        );
        setFileName(file.name);
        setFileSize(file.size);
        return;
      }

      setSizeError(null);
      setError(null);
      setResult(null);
      setFileName(file.name);
      setFileSize(file.size);
      lastFileRef.current = file;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        setLoading(true);
        setLoadingStep(0);

        // Multi-step loading
        stepTimerRef.current = setInterval(() => {
          setLoadingStep((prev) =>
            prev < LOADING_STEPS.length - 1 ? prev + 1 : prev,
          );
        }, 2000);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const data = await detectImage(
            base64,
            userId,
            "manual_upload",
            controller.signal,
          );
          setResult(data);
          addToast("success", "Image analysis complete");
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
      };
      reader.readAsDataURL(file);
    },
    [userId, addToast],
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

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    clearInterval(stepTimerRef.current);
  }, []);

  const handleChange = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setResult(null);
    setError(null);
    setSizeError(null);
    setFileName(null);
    setFileSize(null);
    // Reset input so re-selecting the same file triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  }, []);

  const handleRetry = useCallback(() => {
    if (lastFileRef.current) {
      setError(null);
      handleFile(lastFileRef.current);
    }
  }, [handleFile]);

  const color = result
    ? VERDICT_COLORS[result.verdict] || "#4a3728"
    : "#4a3728";
  const label = result ? VERDICT_LABELS[result.verdict] || result.verdict : "";

  return (
    <div className="space-y-4" onPaste={handlePaste}>
      {/* Source context (extension flow) or drop zone (direct flow) */}
      {hasExternalSource ? (
        <SourceContext
          sourceUrl={sourceUrl}
          sourcePageUrl={sourcePageUrl}
          type="image"
        />
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={!preview ? () => fileInputRef.current?.click() : undefined}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center
            transition-all duration-200
            ${!preview ? "cursor-pointer" : ""}
            ${sizeError ? "border-red-400 bg-red-50/50" : dragOver ? "border-primary bg-primary/10" : "border-secondary/20 hover:border-secondary/40 bg-base-dark/50"}
          `}
        >
          {preview ? (
            <div className="relative group">
              <img
                src={preview}
                alt="Uploaded image"
                className="max-h-64 mx-auto rounded-lg"
              />
              <button
                onClick={handleChange}
                className="absolute top-2 right-2 px-3 py-1.5 bg-secondary/80 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="py-8">
              <ImagePlus className="h-10 w-10 mx-auto mb-3 text-secondary/40" />
              <p className="text-secondary/60 font-medium">
                {dragOver
                  ? "Drop to analyze"
                  : "Drop an image, paste from clipboard, or click to upload"}
              </p>
              <p className="text-secondary/40 text-sm mt-1">
                PNG, JPG, WebP supported (max{" "}
                {formatFileSize(API_LIMITS.IMAGE_MAX_BYTES)})
              </p>
            </div>
          )}

          {/* File info */}
          {fileName && !preview && (
            <p className="text-secondary/50 text-xs mt-2">
              {fileName} ({fileSize ? formatFileSize(fileSize) : ""})
            </p>
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

      {/* Size error */}
      {sizeError && (
        <p role="alert" className="text-red-600 text-sm">
          {sizeError}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="flex items-center gap-3">
            <span className="inline-block w-5 h-5 border-2 border-secondary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-secondary/60 font-medium">
              {LOADING_STEPS[loadingStep]}
            </span>
          </div>
          <button
            onClick={handleCancel}
            className="text-secondary/50 text-sm hover:text-secondary transition-colors underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div role="alert" className="space-y-2">
          <p className="text-red-600 text-sm">{error}</p>
          {lastFileRef.current && (
            <button
              onClick={handleRetry}
              className="text-sm text-primary font-medium underline hover:text-primary/80"
            >
              Try Again
            </button>
          )}
        </div>
      )}

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
              <p className="text-secondary/30 text-[10px]">
                How likely this content is genuine
              </p>
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
            primaryAvailable={result.primaryAvailable}
            confidenceCapped={result.confidenceCapped}
          />
        )}
    </div>
  );
}
