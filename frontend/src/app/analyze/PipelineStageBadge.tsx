"use client";

interface PipelineStageBadgeProps {
  modelUsed?: string;
}

function parseStage(model: string): { label: string; bg: string } {
  const lower = model.toLowerCase();
  if (lower.includes("synthid-image") || lower.includes("synthid_image"))
    return { label: "SynthID Watermark", bg: "bg-primary/15 text-primary" };
  if (
    lower.includes("synthid-text") ||
    lower.includes("synthid_text") ||
    lower.includes("synthid")
  )
    return { label: "SynthID Watermark", bg: "bg-primary/15 text-primary" };
  if (lower.includes("sightengine"))
    return { label: "SightEngine", bg: "bg-emerald-500/15 text-emerald-700" };
  if (lower.includes("pangram"))
    return { label: "Pangram", bg: "bg-blue-500/15 text-blue-700" };
  if (lower.includes("reality") || lower.includes("defender"))
    return {
      label: "Reality Defender",
      bg: "bg-purple-500/15 text-purple-700",
    };
  if (lower.includes("multi-frame"))
    return {
      label: "Multi-Frame Analysis",
      bg: "bg-secondary/10 text-secondary/70",
    };
  // HF Ensemble badge — commented out (primary APIs only)
  // if (lower.startsWith("hf:") || lower.includes("huggingface") || lower.includes("roberta"))
  //   return { label: "Open-Source Ensemble", bg: "bg-amber-500/10 text-amber-600" };
  if (
    lower.startsWith("local:") ||
    lower.startsWith("backend") ||
    lower.includes("statistical")
  )
    return { label: "Local Ensemble", bg: "bg-green-500/15 text-green-700" };
  return { label: "Ensemble", bg: "bg-secondary/10 text-secondary/70" };
}

export function PipelineStageBadge({ modelUsed }: PipelineStageBadgeProps) {
  if (!modelUsed) return null;

  const { label, bg } = parseStage(modelUsed);

  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${bg}`}
    >
      {label}
    </span>
  );
}
