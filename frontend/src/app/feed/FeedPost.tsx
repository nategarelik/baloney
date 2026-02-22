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

          // Timeout: 45s to allow real API detection to complete
          const timeout = setTimeout(() => {
            setState("complete");
          }, 45000);

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
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [post.id, onScan]);

  // Only show real API detection results — no fake fallbacks
  const displayResult: DetectionResult | null =
    result && result.model_used !== "error" ? result : null;

  const showError = result?.model_used === "error" && state === "complete";

  const platformLabel: Record<string, string> = {
    instagram: "Instagram",
    x: "X",
    reddit: "Reddit",
    linkedin: "LinkedIn",
    tiktok: "TikTok",
    facebook: "Facebook",
    threads: "Threads",
    bluesky: "Bluesky",
    substack: "Substack",
    medium: "Medium",
    mastodon: "Mastodon",
    hackernews: "HN",
  };

  const PlatformIcon = post.platform === "instagram" ? Instagram : XIcon;
  const showPlatformLabel =
    post.platform !== "instagram" && post.platform !== "x";

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
            {showPlatformLabel ? (
              <span className="text-[10px] font-medium text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded shrink-0">
                {platformLabel[post.platform] ?? post.platform}
              </span>
            ) : (
              <PlatformIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            )}
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

        {/* Error state — API unavailable */}
        {showError && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-600/80 border border-slate-400/30 px-2.5 py-1 text-xs font-medium text-slate-200">
              Detection unavailable
            </span>
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
