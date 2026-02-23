// extension/src/scanners/video-scanner.ts — Video frame capture + multi-frame analysis

import { VIDEO_MAX_FRAMES } from "../config";
import { canScanVideos } from "../guards";
import { requestQueue } from "../request-queue";
import { updateStats, updatePageStats } from "../stats";
import { createDetectionDot } from "../ui/detection-dot";
import { addFlaggedItem } from "../ui/page-indicator";
import { applyContentMode } from "../ui/content-mode";
import type { DetectionResult } from "../types";

function captureVideoFrame(video: HTMLVideoElement, seekTime: number): Promise<string | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || video.clientWidth || 320;
    canvas.height = video.videoHeight || video.clientHeight || 240;

    const onSeeked = (): void => {
      try {
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        resolve(null);
      }
      video.removeEventListener("seeked", onSeeked);
    };

    if (video.readyState >= 2 && Math.abs(video.currentTime - seekTime) < 0.5) {
      try {
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        resolve(null);
      }
    } else {
      video.addEventListener("seeked", onSeeked);
      setTimeout(() => {
        video.removeEventListener("seeked", onSeeked);
        resolve(null);
      }, 3000);
      video.currentTime = seekTime;
    }
  });
}

function captureCurrentFrame(video: HTMLVideoElement): string | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || video.clientWidth || 320;
    canvas.height = video.videoHeight || video.clientHeight || 240;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return null;
  }
}

async function collectFrameUrls(video: HTMLVideoElement): Promise<string[]> {
  const frameUrls: string[] = [];

  if (video.poster) {
    frameUrls.push(video.poster);
  }

  if (video.readyState >= 2 && video.duration > 0 && isFinite(video.duration)) {
    if (!video.paused) {
      const frame = captureCurrentFrame(video);
      if (frame) frameUrls.push(frame);
    } else {
      const savedTime = video.currentTime;
      const numFrames = Math.min(VIDEO_MAX_FRAMES, Math.ceil(video.duration / 2));
      const interval = video.duration / (numFrames + 1);

      for (let i = 1; i <= numFrames; i++) {
        const seekTime = interval * i;
        const frameUrl = await captureVideoFrame(video, seekTime);
        if (frameUrl) frameUrls.push(frameUrl);
      }

      try {
        video.currentTime = savedTime;
      } catch {
        /* ignore */
      }
    }
  } else if (frameUrls.length === 0) {
    const cw = video.videoWidth || video.clientWidth;
    const ch = video.videoHeight || video.clientHeight;
    if (cw > 0 && ch > 0) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        if (dataUrl.length > 1000) {
          frameUrls.push(dataUrl);
        }
      } catch {
        // Cross-origin or no frame data
      }
    }
  }

  if (frameUrls.length === 0 && video.poster) {
    frameUrls.push(video.poster);
  }
  if (frameUrls.length === 0 && video.src && !video.src.startsWith("blob:")) {
    frameUrls.push(video.src);
  }

  return frameUrls;
}

function aggregateFrameResults(frameResults: DetectionResult[]): DetectionResult {
  const confidences = frameResults.map((r) => r.confidence || 0);
  const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  const aiCount = frameResults.filter(
    (r) => r.verdict === "ai_generated" || r.verdict === "heavy_edit",
  ).length;
  const aiRatio = aiCount / frameResults.length;

  let aggregated: DetectionResult;

  if (aiRatio > 0.5 || avgConfidence > 0.65) {
    aggregated = {
      ...frameResults[0],
      verdict: "ai_generated",
      confidence: Math.max(avgConfidence, 0.7),
      model_used: `multi-frame(${frameResults.length}):${frameResults[0].model_used}`,
      frames_analyzed: frameResults.length,
      frames_flagged: aiCount,
    };
  } else if (aiRatio > 0.2 || avgConfidence > 0.45) {
    aggregated = {
      ...frameResults[0],
      verdict: "heavy_edit",
      confidence: avgConfidence,
      model_used: `multi-frame(${frameResults.length}):${frameResults[0].model_used}`,
      frames_analyzed: frameResults.length,
      frames_flagged: aiCount,
    };
  } else {
    const bestResult = frameResults.reduce((best, r) =>
      (r.confidence || 0) > (best.confidence || 0) ? r : best,
    );
    aggregated = {
      ...bestResult,
      model_used: `multi-frame(${frameResults.length}):${bestResult.model_used}`,
      frames_analyzed: frameResults.length,
      frames_flagged: aiCount,
    };
  }

  aggregated.frame_scores = confidences;
  aggregated.frames_flagged_ai = aiCount;
  aggregated.ai_frame_percentage = aiRatio;

  return aggregated;
}

export async function analyzeVideo(video: HTMLVideoElement): Promise<void> {
  if (!canScanVideos()) return;
  if (video.dataset.baloneyScanned) return;
  video.dataset.baloneyScanned = "pending";

  try {
    const frameUrls = await collectFrameUrls(video);

    if (frameUrls.length === 0) {
      video.dataset.baloneyScanned = "error";
      return;
    }

    const frameResults: DetectionResult[] = [];
    for (const frameUrl of frameUrls.slice(0, VIDEO_MAX_FRAMES)) {
      try {
        const result = await requestQueue.add(async () => {
          const response = await new Promise<DetectionResult>((resolve, reject) => {
            chrome.runtime.sendMessage(
              {
                type: frameUrl.startsWith("data:")
                  ? "analyze-video-frame"
                  : "analyze-image",
                url: frameUrl,
                base64: frameUrl.startsWith("data:") ? frameUrl : undefined,
              },
              (response: unknown) => {
                if (chrome.runtime.lastError)
                  reject(new Error(chrome.runtime.lastError.message));
                else resolve(response as DetectionResult);
              },
            );
          });
          return response;
        });
        if (result && result.verdict) frameResults.push(result);
      } catch {
        // Skip failed frames
      }
    }

    if (frameResults.length === 0) {
      video.dataset.baloneyScanned = "error";
      return;
    }

    const aggregatedResult = aggregateFrameResults(frameResults);
    aggregatedResult.duration_seconds = video.duration || 0;
    aggregatedResult.sourceUrl = video.poster || video.src;
    aggregatedResult.sourcePageUrl = window.location.href;

    video.dataset.baloneyScanned = aggregatedResult.verdict;
    video.dataset.baloneyResult = JSON.stringify(aggregatedResult);
    createDetectionDot(video, aggregatedResult);
    addFlaggedItem(
      video,
      aggregatedResult.verdict,
      `Video (${frameResults.length} frames): ${video.title || video.src?.slice(0, 30) || "video"}`,
    );
    applyContentMode(video, aggregatedResult.verdict);
    updateStats(aggregatedResult.verdict);
    updatePageStats("images", aggregatedResult.verdict);
  } catch (error) {
    console.error("[Baloney] Video analysis failed:", error);
    video.dataset.baloneyScanned = "error";
  }
}
