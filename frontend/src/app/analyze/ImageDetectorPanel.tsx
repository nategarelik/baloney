"use client";

import { useState, useCallback, useRef } from "react";
import { detectImage } from "@/lib/api";
import { DEMO_USER_ID } from "@/lib/constants";
import type { DetectionResult } from "@/lib/types";
import { AnimatedPercentage } from "./AnimatedPercentage";

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

export function ImageDetectorPanel() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
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
        const data = await detectImage(base64, DEMO_USER_ID, "manual_upload");
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

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

  const color = result ? VERDICT_COLORS[result.verdict] || "#4a3728" : "#4a3728";
  const label = result ? VERDICT_LABELS[result.verdict] || result.verdict : "";

  return (
    <div className="space-y-4" onPaste={handlePaste}>
      {/* Drop zone */}
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
            <div className="text-4xl mb-3 opacity-50">🖼️</div>
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-6">
          <span className="inline-block w-5 h-5 border-2 border-secondary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-secondary/60 font-medium">Analyzing image...</span>
        </div>
      )}

      {error && <p className="text-primary text-sm">{error}</p>}

      {/* Result */}
      {result && !loading && (
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 space-y-4">
          {/* Verdict + confidence */}
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
            <div>
              <p className="font-display text-xl" style={{ color }}>
                {label}
              </p>
              <p className="text-secondary/50 text-sm">
                <AnimatedPercentage value={result.confidence} className="font-semibold text-secondary" />
                {" "}confidence
              </p>
            </div>
          </div>

          {/* Score bars */}
          <div className="space-y-3">
            <ScoreBar label="Primary Model" value={result.primary_score} />
            <ScoreBar label="Secondary Analysis" value={result.secondary_score} />
            <ScoreBar label="Trust Score" value={result.trust_score} invert />
          </div>

          {/* Model info */}
          <p className="text-secondary/35 text-xs">
            Model: {result.model_used}
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  value,
  invert = false,
}: {
  label: string;
  value: number;
  invert?: boolean;
}) {
  const pct = Math.round(value * 100);
  const barColor = invert
    ? value > 0.7
      ? "#16a34a"
      : value > 0.4
        ? "#f59e0b"
        : "#d4456b"
    : value > 0.6
      ? "#d4456b"
      : value > 0.3
        ? "#f59e0b"
        : "#16a34a";

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-secondary/70">{label}</span>
        <span className="text-secondary/50">{pct}%</span>
      </div>
      <div className="h-2 bg-secondary/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}
