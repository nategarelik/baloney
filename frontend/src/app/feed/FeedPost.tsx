"use client";

import { useRef, useEffect, useState } from "react";
import { Instagram } from "lucide-react";
import { DetectionBadge } from "@/components/DetectionBadge";
import type { DetectionResult, FeedPostData } from "@/lib/types";

type ScanState = "idle" | "scanning" | "complete";

interface FeedPostProps {
  post: FeedPostData;
  onScan: (postId: string) => Promise<DetectionResult | null>;
  result: DetectionResult | null;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function FeedPost({ post, onScan, result }: FeedPostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ScanState>("idle");
  const scannedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !scannedRef.current) {
          scannedRef.current = true;
          setState("scanning");

          // Timeout fallback: 5s → use curated data
          const timeout = setTimeout(() => {
            setState("complete");
          }, 5000);

          onScan(post.id)
            .then(() => {
              clearTimeout(timeout);
              setState("complete");
            })
            .catch(() => {
              clearTimeout(timeout);
              setState("complete");
            });
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [post.id, onScan]);

  // Use API result if available, otherwise fallback to curated data
  const displayResult: DetectionResult | null =
    result ??
    (state === "complete"
      ? {
          verdict: post.isAiGenerated ? "ai_generated" : post.expectedConfidence < 0.55 ? "inconclusive" : "likely_human",
          confidence: post.expectedConfidence,
          primary_score: post.expectedConfidence,
          secondary_score: post.expectedConfidence,
          model_used: "fallback",
          ensemble_used: false,
        }
      : null);

  const PlatformIcon = post.platform === "instagram" ? Instagram : XIcon;

  return (
    <div
      ref={containerRef}
      className="bg-navy-light rounded-xl border border-navy-lighter overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.avatarUrl}
          alt={post.displayName}
          className="w-9 h-9 rounded-full bg-navy-lighter"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-white truncate">
              {post.displayName}
            </span>
            <PlatformIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          </div>
          <span className="text-xs text-slate-500">
            @{post.username} &middot; {post.timestamp}
          </span>
        </div>
      </div>

      {/* Image container */}
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imageUrl}
          alt={post.caption}
          className="w-full aspect-square object-cover"
          loading="lazy"
        />

        {/* Scanning overlay */}
        {state === "scanning" && (
          <div className="absolute inset-0 bg-accent/10 animate-scan-pulse flex items-center justify-center">
            <div className="bg-navy/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-slate-300 font-medium">
              Scanning...
            </div>
          </div>
        )}

        {/* Detection badge */}
        {state === "complete" && displayResult && (
          <div className="absolute top-3 right-3">
            <DetectionBadge
              verdict={displayResult.verdict}
              confidence={displayResult.confidence}
              animate
            />
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="px-4 py-3">
        <p className="text-sm text-slate-300 leading-relaxed">{post.caption}</p>
      </div>
    </div>
  );
}
