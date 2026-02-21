"use client";

import { useState, useCallback, useRef } from "react";
import { FeedPost } from "./FeedPost";
import { FeedStatsBar } from "./FeedStatsBar";
import { FEED_POSTS } from "./_data";
import { detectImage } from "@/lib/api";
import { DEMO_USER_ID, RequestQueue } from "@/lib/constants";
import type { DetectionResult } from "@/lib/types";

const requestQueue = new RequestQueue(3);

export default function FeedPage() {
  const [results, setResults] = useState<Map<string, DetectionResult>>(
    new Map()
  );
  const [scannedCount, setScannedCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const scannedIds = useRef(new Set<string>());
  const resultsRef = useRef(results);
  resultsRef.current = results;

  const handleScan = useCallback(
    async (postId: string): Promise<DetectionResult | null> => {
      if (scannedIds.current.has(postId)) return resultsRef.current.get(postId) ?? null;
      scannedIds.current.add(postId);

      const post = FEED_POSTS.find((p) => p.id === postId);
      if (!post) return null;

      try {
        const result = await requestQueue.add(async () => {
          const response = await fetch(post.imageUrl);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          return detectImage(base64, DEMO_USER_ID, "demo_feed");
        });

        const detectionResult = result as DetectionResult;
        setResults((prev) => new Map(prev).set(postId, detectionResult));
        setScannedCount((c) => c + 1);
        if (detectionResult.verdict === "ai_generated") {
          setFlaggedCount((c) => c + 1);
        }
        return detectionResult;
      } catch {
        const fallback: DetectionResult = {
          verdict: post.isAiGenerated
            ? "ai_generated"
            : post.expectedConfidence < 0.55
            ? "inconclusive"
            : "likely_human",
          confidence: post.expectedConfidence,
          primary_score: post.expectedConfidence,
          secondary_score: post.expectedConfidence,
          model_used: "fallback",
          ensemble_used: false,
        };
        setResults((prev) => new Map(prev).set(postId, fallback));
        setScannedCount((c) => c + 1);
        if (fallback.verdict === "ai_generated") {
          setFlaggedCount((c) => c + 1);
        }
        return fallback;
      }
    },
    []
  );

  return (
    <main className="min-h-screen">
      <FeedStatsBar
        totalPosts={FEED_POSTS.length}
        scannedCount={scannedCount}
        flaggedCount={flaggedCount}
      />

      <div className="max-w-xl mx-auto py-6 px-4 space-y-6">
        {FEED_POSTS.map((post) => (
          <FeedPost
            key={post.id}
            post={post}
            onScan={handleScan}
            result={results.get(post.id) ?? null}
          />
        ))}

        <div className="text-center py-8 text-sm text-slate-500">
          You&apos;ve reached the end of the demo feed.
        </div>
      </div>
    </main>
  );
}
