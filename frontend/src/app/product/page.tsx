"use client";

import Link from "next/link";
import { HandDrawnUnderline } from "@/components/HandDrawnUnderline";

const supportedSites = [
  { name: "X", url: "https://x.com", logo: "/logos/x-logo.png" },
  {
    name: "Instagram",
    url: "https://instagram.com",
    logo: "https://www.google.com/s2/favicons?domain=instagram.com&sz=64",
  },
  {
    name: "Reddit",
    url: "https://reddit.com",
    logo: "https://www.google.com/s2/favicons?domain=reddit.com&sz=64",
  },
  {
    name: "Facebook",
    url: "https://facebook.com",
    logo: "https://www.google.com/s2/favicons?domain=facebook.com&sz=64",
  },
  {
    name: "TikTok",
    url: "https://tiktok.com",
    logo: "https://www.google.com/s2/favicons?domain=tiktok.com&sz=64",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com",
    logo: "https://www.google.com/s2/favicons?domain=linkedin.com&sz=64",
    scale: 1.3,
  },
  { name: "Medium", url: "https://medium.com", logo: "/logos/medium-logo.png" },
  {
    name: "Substack",
    url: "https://substack.com",
    logo: "https://www.google.com/s2/favicons?domain=substack.com&sz=64",
  },
  {
    name: "Threads",
    url: "https://threads.net",
    logo: "/logos/threads-logo.png",
  },
];

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-base">
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-12 page-top-offset text-center">
        <h1 className="font-display text-4xl md:text-5xl text-secondary mb-5 leading-tight">
          The cost of generating a lie is now zero.
          <br />
          The cost of verifying truth shouldn&apos;t be.
        </h1>
        <p className="text-secondary/70 text-lg max-w-2xl mx-auto leading-relaxed">
          GPT, Gemini, Claude &mdash; free, instant, infinite. But verifying
          what&apos;s real still costs human time and attention.{" "}
          <span className="text-primary font-semibold">Baloney</span> closes
          that gap with multi-signal AI detection across text, images, and
          video &mdash; right inside your browser.
        </p>
      </section>

      {/* ── The Asymmetry ── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              label: "Generating AI content",
              value: "Free",
              sub: "Unlimited text, images, and video from any frontier model",
            },
            {
              label: "Detecting AI content",
              value: "Hard",
              sub: "No single method catches everything across modalities",
            },
            {
              label: "Trusting what you see",
              value: "Broken",
              sub: "Platforms can't grade their own homework. Users have no tools.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-base-dark rounded-xl border border-secondary/10 p-6 text-center"
            >
              <p className="font-display text-2xl text-primary mb-1">
                {item.value}
              </p>
              <p className="font-display text-secondary text-sm mb-2">
                {item.label}
              </p>
              <p className="text-secondary/50 text-xs leading-relaxed">
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What Baloney Does ── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl text-secondary mb-1 inline-block">
            What Baloney Does
            <HandDrawnUnderline width={200} className="mx-auto mt-1" />
          </h2>
          <p className="text-secondary/70 mt-4 max-w-2xl mx-auto leading-relaxed">
            A Chrome extension and{" "}
            <a
              href="https://baloney.app/dashboard/community"
              className="text-primary underline hover:opacity-80"
            >
              web dashboard
            </a>{" "}
            that detect AI-generated content as you browse. No copy-pasting
            into a separate tool. It works where you already are.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Text",
              desc: "Highlight any text on a page. Our pipeline runs multiple independent signals and returns a verdict with confidence in under a second.",
            },
            {
              title: "Images",
              desc: "Every image gets a small colored dot. Pink means AI-generated. Green means human. Hover for the confidence score, click for the full breakdown.",
            },
            {
              title: "Video",
              desc: "Video frames are captured and routed through the image pipeline. Same multi-signal approach, applied to every frame.",
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

      {/* ── Architecture ── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          How It Works
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          Every scan runs through a multi-signal ensemble. Each signal is
          independent. If one fails, the others still work. We show you
          exactly which methods contributed to the verdict and why.
        </p>

        {/* System diagram */}
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 mb-6">
          <h3 className="font-display text-lg text-secondary mb-4">
            System Architecture
          </h3>
          <div className="bg-secondary/5 rounded-lg p-5 font-mono text-xs text-secondary/70 leading-relaxed overflow-x-auto">
            <pre>{`┌─────────────────┐     POST /api/detect/*     ┌──────────────────────┐
│ Chrome Extension │ ─────────────────────────▶ │ Vercel (Next.js 16)  │
│ (Manifest V3)    │                            │ API Routes           │
└─────────────────┘                             └──────────┬───────────┘
                                                           │
         ┌─────────────────────────────────────────────────┤
         │                                                 │
         ▼                                                 ▼
┌─────────────────────┐                        ┌───────────────────────┐
│ Detection Ensemble  │                        │ Supabase Postgres     │
│                     │                        │                       │
│  Text:              │                        │  7 tables             │
│   ① SynthID         │                        │  11 analytics views   │
│   ② Pangram (99.8%) │                        │  4 RPC functions      │
│   ③ Statistical     │                        │                       │
│                     │                        │  record_scan_with_    │
│  Image:             │                        │    provenance()       │
│   ① SynthID         │                        │  compute_exposure_    │
│   ② SightEngine     │                        │    score()            │
│   ③ Frequency/DCT   │                        │  compute_slop_index() │
│   ④ Metadata/EXIF   │                        │                       │
└─────────────────────┘                        └───────────────────────┘

         ┌──────────────────────────────────────────┐
         │ Web Dashboard (baloney.app)              │
         │                                          │
         │  /analyze        — AI Detector           │
         │  /dashboard      — Live Scan Feed        │
         │  /dashboard/community — Analytics        │
         │  /evaluation     — ROC, Ablation, Bench  │
         │  /tracker        — Platform Trends       │
         └──────────────────────────────────────────┘`}</pre>
          </div>
        </div>

        {/* Text pipeline */}
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 mb-6">
          <h3 className="font-display text-lg text-secondary mb-1">
            Text Detection Pipeline
          </h3>
          <p className="text-secondary/50 text-sm mb-4">
            Three independent signals. SynthID checks for Google&apos;s
            invisible watermarks first &mdash; if found, we return immediately
            with high confidence.
          </p>
          <div className="space-y-3">
            {[
              {
                name: "Google SynthID",
                detail:
                  "Detects invisible cryptographic watermarks embedded in all Gemini-generated text. If present, returns 0.97 confidence immediately.",
                tag: "watermark",
              },
              {
                name: "Pangram API",
                detail:
                  "99.85% accuracy commercial detector (Emi & Spero 2024, arXiv:2402.14873). Catches subtly edited AI text that evades open-source models.",
                tag: "99.85%",
              },
              {
                name: "Statistical Analysis",
                detail:
                  "12 features: burstiness, entropy, readability, hedging ratio, transition word density, type-token ratio, repetition patterns, and more.",
                tag: "12 features",
              },
            ].map((s) => (
              <div key={s.name} className="bg-secondary/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display text-secondary text-base">
                    {s.name}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {s.tag}
                  </span>
                </div>
                <p className="text-secondary/60 text-xs leading-relaxed">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Image pipeline */}
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
          <h3 className="font-display text-lg text-secondary mb-1">
            Image Detection Pipeline
          </h3>
          <p className="text-secondary/50 text-sm mb-4">
            Four independent signals. Video frames are captured and routed
            through this same pipeline.
          </p>
          <div className="space-y-3">
            {[
              {
                name: "Google SynthID",
                detail:
                  "Detects invisible watermarks in Imagen-generated images via Vertex AI. If present, returns 0.95 confidence immediately.",
                tag: "watermark",
              },
              {
                name: "SightEngine API",
                detail:
                  "98.3% accuracy, ARIA benchmark #1. Covers 120+ generators including Sora, Veo, DALL-E, Midjourney, Stable Diffusion, Kling.",
                tag: "98.3%",
              },
              {
                name: "Frequency / DCT Analysis",
                detail:
                  "Local variance uniformity and high-frequency energy measurements. AI images have distinct spectral signatures in the frequency domain.",
                tag: "spectral",
              },
              {
                name: "Metadata / EXIF",
                detail:
                  "Camera provenance, EXIF markers, C2PA content credentials. Real photos leave hardware traces that AI generators don't.",
                tag: "provenance",
              },
            ].map((s) => (
              <div key={s.name} className="bg-secondary/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display text-secondary text-base">
                    {s.name}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {s.tag}
                  </span>
                </div>
                <p className="text-secondary/60 text-xs leading-relaxed">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Evaluation ── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          We Prove It Works
          <HandDrawnUnderline width={180} className="mx-auto mt-1" />
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          Any team can plug in an API. We built a 207-sample evaluation
          pipeline across 15 content categories to prove the ensemble
          actually works.{" "}
          <a
            href="https://baloney.app/evaluation"
            className="text-primary underline hover:opacity-80"
          >
            See the full evaluation dashboard.
          </a>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "0.982", label: "ROC AUC" },
            { value: "207", label: "Benchmark Samples" },
            { value: "3", label: "Modalities" },
            { value: "15", label: "Content Categories" },
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
        <p className="text-secondary/50 text-xs text-center mt-6">
          The ablation study proves the ensemble beats any single method.
          Bootstrap confidence intervals and Bayesian PPV analysis included.
        </p>
      </section>

      {/* ── The Bigger Picture ── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          The Detector Is Valuable. The Data Is the Product.
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          Every scan generates a data point: this content, this platform, this
          time, AI-generated with this confidence. At scale, that becomes
          something nobody else has &mdash; a real-time map of AI content
          across the internet.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <h3
              className="font-display text-base mb-2"
              style={{ color: "#e8c97a" }}
            >
              AI Slop Index
            </h3>
            <p className="text-secondary/70 text-sm leading-relaxed">
              We grade every platform from A+ to F based on AI content
              pollution. Social media companies can&apos;t independently
              measure their own bot problem. They need independent
              measurement.{" "}
              <a
                href="https://baloney.app/dashboard/community"
                className="text-primary underline hover:opacity-80"
              >
                See the live index.
              </a>
            </p>
          </div>
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <h3
              className="font-display text-base mb-2"
              style={{ color: "#e8c97a" }}
            >
              Content Provenance
            </h3>
            <p className="text-secondary/70 text-sm leading-relaxed">
              SHA-256 content hashes track the same content across platforms.
              Multiple independent scans build crowd-sourced consensus. No raw
              content stored &mdash; only hashes and metadata.
            </p>
          </div>
        </div>
      </section>

      {/* ── Honesty Section ── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          What We Can&apos;t Do
        </h2>
        <p className="text-secondary/70 text-center max-w-xl mx-auto mb-8 leading-relaxed">
          No detection system is perfect. Honesty about limitations matters
          more than marketing claims.
        </p>
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            "Short text under ~50 words lacks enough signal for reliable classification.",
            "Heavily human-edited AI text blends signals and may read as human-written.",
            "Screenshots of AI-generated text bypass our text pipeline entirely.",
            "Brand-new generators not in our training data may evade detection until we retrain.",
          ].map((lim, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-primary font-semibold text-sm mt-0.5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-secondary/70 text-sm leading-relaxed">
                {lim}
              </p>
            </div>
          ))}
        </div>
        <div className="bg-secondary/5 rounded-lg p-4 mt-8 max-w-2xl mx-auto">
          <p className="text-secondary/60 text-sm leading-relaxed text-center">
            We prioritize minimizing{" "}
            <strong className="text-secondary/80">false positives</strong>{" "}
            &mdash; incorrectly labeling human content as AI. A false
            accusation erodes trust far more than a missed detection.
          </p>
        </div>
      </section>

      {/* ── Privacy ── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-8 text-center">
          Privacy
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            {
              title: "No PII collected",
              desc: "User IDs are anonymous session tokens. We never collect personally identifiable information.",
            },
            {
              title: "Content never stored",
              desc: "Text and images are analyzed in memory and discarded. We store verdicts and metadata only.",
            },
            {
              title: "Server-side processing",
              desc: "All detection runs on our servers. No model weights or inference on your device.",
            },
            {
              title: "Community sharing is opt-in",
              desc: "Your scans are private by default. You choose whether to contribute to aggregate analytics.",
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

      {/* ── Get Started ── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-10 text-center">
          Get Started
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Install the Extension",
              desc: "Add Baloney to Chrome. One click, zero config.",
            },
            {
              step: "2",
              title: "Browse Normally",
              desc: "Visit any supported site. Baloney scans content as you scroll.",
            },
            {
              step: "3",
              title: "See What's Real",
              desc: "Colored dots on images, underlines on text, full method breakdown on click.",
            },
          ].map((s) => (
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
          <span className="inline-block px-6 py-2.5 bg-secondary/10 text-secondary/70 font-medium rounded-full text-sm border border-secondary/15">
            Chrome Web Store &mdash; Under Review
          </span>
        </div>
      </section>

      {/* ── Supported Sites ── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-10 text-center">
          Works On
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
                  "scale" in site
                    ? { transform: `scale(${site.scale})` }
                    : undefined
                }
              />
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
                  "scale" in site
                    ? { transform: `scale(${site.scale})` }
                    : undefined
                }
              />
            </a>
          ))}
        </div>
      </section>

      {/* ── Try It Live ── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-8 text-center">
          <h2 className="font-display text-2xl text-secondary mb-3">
            Try It Right Now
          </h2>
          <p className="text-secondary/70 text-sm mb-6 max-w-lg mx-auto">
            Paste any text into the analyzer or explore the community
            dashboard. Everything is live.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/analyze"
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Analyze Content
            </Link>
            <Link
              href="/evaluation"
              className="px-6 py-2.5 border border-secondary/20 text-secondary font-semibold rounded-lg hover:bg-secondary/5 transition-colors text-sm"
            >
              Evaluation
            </Link>
            <Link
              href="/dashboard/community"
              className="px-6 py-2.5 border border-secondary/20 text-secondary font-semibold rounded-lg hover:bg-secondary/5 transition-colors text-sm"
            >
              Community Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Open Source ── */}
      <section className="max-w-4xl mx-auto px-6 pt-14 pb-24 text-center">
        <a
          href="https://github.com/nategarelik/baloney"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2.5 border-2 border-secondary/20 text-secondary font-semibold rounded-full hover:bg-secondary/5 transition-colors text-sm"
        >
          View Source on GitHub
        </a>
      </section>
    </main>
  );
}
