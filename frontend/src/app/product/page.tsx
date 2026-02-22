"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HandDrawnUnderline } from "@/components/HandDrawnUnderline";
import { getCommunityAnalytics } from "@/lib/api";
import type { CommunityAnalytics } from "@/lib/types";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Baloney — Product Page                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

const apiServices = [
  {
    name: "SynthID",
    provider: "Google DeepMind",
    desc: "Watermark detector for text and images. First stage in both pipelines — if a watermark is found, we return a high-confidence AI verdict immediately.",
  },
  {
    name: "Pangram",
    provider: "Pangram API",
    desc: "Best-in-class commercial text detector. Excellent at catching subtly edited AI text that evades open-source models.",
  },
  {
    name: "SightEngine",
    provider: "SightEngine API",
    desc: "Generative AI image detector purpose-built for content from Kling, Sora, Veo, DALL-E, Midjourney, Stable Diffusion, and other frontier models.",
  },
  // Reality Defender commented out — primary APIs only
  // {
  //   name: "Reality Defender",
  //   provider: "Reality Defender API",
  //   desc: "Specialized deepfake detection. Triggered on ambiguous SightEngine results for a second opinion on manipulated media.",
  // },
];

// Open-source models commented out — primary APIs only
// const openSourceModels = [
//   { name: "RoBERTa OpenAI Detector", id: "openai-community/roberta-base-openai-detector", desc: "..." },
//   { name: "ChatGPT Detector", id: "Hello-SimpleAI/chatgpt-detector-roberta", desc: "..." },
//   { name: "MiniLM-L6-v2", id: "sentence-transformers/all-MiniLM-L6-v2", desc: "..." },
//   { name: "AI Image Detector", id: "umm-maybe/AI-image-detector", desc: "..." },
//   { name: "SDXL Detector", id: "Organika/sdxl-detector", desc: "..." },
// ];

const supportedSites = [
  {
    name: "X",
    url: "https://x.com",
    color: "#000000",
    logo: "/logos/x-logo.png",
  },
  {
    name: "Instagram",
    url: "https://instagram.com",
    color: "#E1306C",
    logo: "https://www.google.com/s2/favicons?domain=instagram.com&sz=64",
  },
  {
    name: "Reddit",
    url: "https://reddit.com",
    color: "#FF4500",
    logo: "https://www.google.com/s2/favicons?domain=reddit.com&sz=64",
  },
  {
    name: "Facebook",
    url: "https://facebook.com",
    color: "#1877F2",
    logo: "https://www.google.com/s2/favicons?domain=facebook.com&sz=64",
  },
  {
    name: "TikTok",
    url: "https://tiktok.com",
    color: "#000000",
    logo: "https://www.google.com/s2/favicons?domain=tiktok.com&sz=64",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com",
    color: "#0A66C2",
    logo: "https://www.google.com/s2/favicons?domain=linkedin.com&sz=64",
    scale: 1.3,
  },
  {
    name: "Medium",
    url: "https://medium.com",
    color: "#000000",
    logo: "/logos/medium-logo.png",
  },
  {
    name: "Substack",
    url: "https://substack.com",
    color: "#FF6719",
    logo: "https://www.google.com/s2/favicons?domain=substack.com&sz=64",
  },
  {
    name: "Threads",
    url: "https://threads.net",
    color: "#000000",
    logo: "/logos/threads-logo.png",
  },
];

const installSteps = [
  {
    step: "1",
    title: "Install Extension",
    desc: "Add Baloney to Chrome from the extension page with one click.",
  },
  {
    step: "2",
    title: "Browse Normally",
    desc: "Visit any social media platform. Baloney quietly scans content in the background.",
  },
  {
    step: "3",
    title: "See AI Everywhere",
    desc: "Colored dots on images, underlines on text, and a full analysis sidepanel on click.",
  },
];

export default function ProductPage() {
  const [analytics, setAnalytics] = useState<CommunityAnalytics | null>(null);

  useEffect(() => {
    getCommunityAnalytics()
      .then(setAnalytics)
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-base">
      {/* ── 1. Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 page-top-offset text-center">
        <h1 className="font-display text-4xl md:text-5xl text-secondary mb-5 leading-tight">
          Ever been fooled by AI?
        </h1>
        <p className="text-secondary/70 text-lg max-w-2xl mx-auto leading-relaxed">
          See what&apos;s AI right in your browser, instantly.
        </p>
      </section>

      {/* ── 2. What is Baloney? ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl text-secondary mb-1 inline-block">
            What is Baloney?
            <HandDrawnUnderline width={200} className="mx-auto mt-1" />
          </h2>
          <p className="text-secondary/70 mt-4 max-w-2xl mx-auto leading-relaxed">
            Baloney is a multi-modal AI content detection platform shipped as a{" "}
            <span className="text-primary font-medium">Chrome extension</span>{" "}
            and a{" "}
            <span className="text-primary font-medium">web dashboard</span>. It
            analyzes text, images, and video in real time, so you always know
            what you&apos;re looking at.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Text Detection",
              desc: "Highlight any text on a page. Our cascading pipeline returns a verdict in under a second.",
            },
            {
              title: "Image Detection",
              desc: "Images are auto-scanned with a discrete colored dot. Hover to see the confidence; click for full analysis.",
            },
            {
              title: "Video Detection",
              desc: "Poster frames and captured keyframes are run through the image pipeline for per-frame verdicts.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-secondary/5 rounded-lg p-6 text-center"
            >
              <h3 className="font-display text-xl text-secondary mb-2">
                {item.title}
              </h3>
              <p className="text-secondary/70 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. How It Works ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl text-secondary mb-10 text-center">
          How It Works
        </h2>

        {/* Text Pipeline — Cascading */}
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 mb-6">
          <h3 className="font-display text-xl text-secondary mb-1">
            Text Detection
          </h3>
          <p className="text-secondary/50 text-sm mb-4">
            Models run sequentially. Each stage can exit early with a
            high-confidence verdict, saving latency and cost.
          </p>
          <div className="space-y-4">
            {[
              {
                stage: "Stage 1",
                label: "SynthID",
                detail:
                  "Google's watermark detector. If a watermark is found, we return a high-confidence AI verdict immediately and stop.",
                exit: true,
              },
              {
                stage: "Stage 2",
                label: "Pangram API",
                detail:
                  "Best-in-class commercial text detector. Excellent at catching subtly edited AI text that evades open-source models. If high confidence, use result and stop.",
                exit: true,
              },
              // Stage 3 (HF Ensemble fallback) commented out — primary APIs only
            ].map((s) => (
              <div key={s.stage} className="bg-secondary/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-primary font-semibold text-sm">
                    {s.stage}
                  </span>
                  {s.exit && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-800/20 text-green-600">
                      early exit
                    </span>
                  )}
                </div>
                <p className="font-display text-secondary text-base mb-1">
                  {s.label}
                </p>
                <p className="text-secondary/60 text-xs leading-relaxed">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Image/Video Pipeline — Cascading */}
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 mb-6">
          <h3 className="font-display text-xl text-secondary mb-1">
            Image / Video Detection
          </h3>
          <div className="space-y-4">
            {[
              {
                stage: "Stage 1",
                label: "SynthID",
                detail:
                  "Google's watermark detector for images. If a watermark is found, we return a high-confidence AI verdict immediately and stop.",
                exit: true,
              },
              {
                stage: "Stage 2",
                label: "SightEngine Generative AI",
                detail:
                  "Commercial API purpose-built for detecting content from Kling, Sora, Veo, DALL-E, Midjourney, Stable Diffusion, and other frontier models. If high confidence, use result and stop.",
                exit: true,
              },
              // Stage 3 (Reality Defender) and Stage 4 (HF Ensemble) commented out — primary APIs only
            ].map((s) => (
              <div key={s.stage} className="bg-secondary/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-primary font-semibold text-sm">
                    {s.stage}
                  </span>
                  {s.exit && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-800/20 text-green-600">
                      early exit
                    </span>
                  )}
                </div>
                <p className="font-display text-secondary text-base mb-1">
                  {s.label}
                </p>
                <p className="text-secondary/60 text-xs leading-relaxed">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Detection Results ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl text-secondary mb-10 text-center">
          Detection Results
          <HandDrawnUnderline width={180} className="mx-auto mt-1" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: "Total Scans",
              value: analytics ? analytics.total_scans.toLocaleString() : "...",
            },
            {
              label: "Contributing Users",
              value: analytics ? analytics.total_users.toLocaleString() : "...",
            },
            {
              label: "Community AI Rate",
              value: analytics
                ? `${Math.round(analytics.ai_rate * 100)}%`
                : "...",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-base-dark rounded-xl border border-secondary/10 p-6 text-center"
            >
              <p className="font-display text-3xl text-primary mb-1">
                {s.value}
              </p>
              <p className="text-secondary/50 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Safety & Ethics ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl text-secondary mb-8 text-center">
          Safety &amp; Ethics
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            {
              title: "No PII Collected",
              desc: "We never collect personally identifiable information. User IDs are anonymous session tokens.",
            },
            {
              title: "Server-Side Processing",
              desc: "All detection runs on our server. No model weights or inference happen on your device.",
            },
            {
              title: "Transparent Detection",
              desc: "Commercial APIs with published accuracy benchmarks. Statistical analysis runs locally with open methodology.",
            },
            {
              title: "No Permanent Storage",
              desc: "Content is analyzed in memory and discarded. We store verdicts and metadata, never the content itself.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-secondary/5 rounded-lg p-4">
              <h3 className="font-display text-secondary text-base mb-1">
                {item.title}
              </h3>
              <p className="text-secondary/60 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Installation ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl text-secondary mb-10 text-center">
          Get Started in 3 Steps
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {installSteps.map((s) => (
            <div
              key={s.step}
              className="bg-base-dark rounded-xl border border-secondary/10 p-6 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-display text-lg">
                  {s.step}
                </span>
              </div>
              <h3 className="font-display text-xl text-secondary mb-2">
                {s.title}
              </h3>
              <p className="text-secondary/70 text-sm leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/extension"
            className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Install Baloney Extension
          </Link>
        </div>
      </section>

      {/* ── 12. Sites We Natively Support ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl text-secondary mb-10 text-center">
          Sites We Natively Support
        </h2>
        <div className="flex justify-center gap-5 mb-5">
          {supportedSites.slice(0, 5).map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              title={site.name}
              className="relative w-11 h-11 rounded-full bg-white hover:scale-110 transition-transform shadow-lg overflow-hidden"
            >
              <img
                src={site.logo}
                alt={site.name}
                className="w-11 h-11 rounded-full object-cover"
                style={
                  site.scale ? { transform: `scale(${site.scale})` } : undefined
                }
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 via-transparent to-black/10 pointer-events-none" />
            </a>
          ))}
        </div>
        <div className="flex justify-center gap-5">
          {supportedSites.slice(5, 9).map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              title={site.name}
              className="relative w-11 h-11 rounded-full bg-white hover:scale-110 transition-transform shadow-lg overflow-hidden"
            >
              <img
                src={site.logo}
                alt={site.name}
                className="w-11 h-11 rounded-full object-cover"
                style={
                  site.scale ? { transform: `scale(${site.scale})` } : undefined
                }
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 via-transparent to-black/10 pointer-events-none" />
            </a>
          ))}
        </div>
      </section>

      {/* ── 13. AI in Development ── */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        <div className="bg-secondary/5 rounded-lg p-6 text-center max-w-2xl mx-auto">
          <h2 className="font-display text-xl text-secondary mb-2">
            AI in Development
          </h2>
          <p className="text-secondary/70 text-sm leading-relaxed">
            Baloney was built with the assistance of AI coding tools. We believe
            in full transparency about AI usage in our own development process.
            For a complete disclosure of AI tools used, see our{" "}
            <a
              href="https://github.com/nategarelik/baloney/blob/master/docs/AI_CITATION.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:opacity-80 transition-opacity"
            >
              AI Citation document
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
