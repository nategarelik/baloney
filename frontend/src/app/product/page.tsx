"use client";

import Link from "next/link";
import { HandDrawnUnderline } from "@/components/HandDrawnUnderline";

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

const stats = [
  { label: "Scans Run", value: "[TBD]" },
  { label: "Accuracy", value: "[TBD]" },
  { label: "Modalities", value: "3" },
  { label: "Average Latency", value: "[TBD]" },
];

const limitations = [
  "Short text under ~50 words lacks enough signal for reliable classification.",
  "Heavily human-edited AI text blends signals and may read as human-written.",
  "Screenshots of AI-generated text bypass our text pipeline entirely.",
  "Brand-new generative models not present in our training data may evade detection until we retrain.",
];

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
    desc: "Add Baloney to Chrome from the extension page. One click, zero config.",
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
  return (
    <main className="min-h-screen bg-base">
      {/* ── 1. Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 page-top-offset text-center">
        <h1 className="font-display text-4xl md:text-5xl text-secondary mb-5 leading-tight">
          Ever been fooled by AI?
        </h1>
        <p className="text-secondary/70 text-lg max-w-2xl mx-auto leading-relaxed">
          AI-generated text, images, and videos are flooding every social
          platform you use. Most of it is invisible. Some of it is designed to
          deceive. <span className="text-primary font-semibold">Baloney</span>{" "}
          gives you the power to see what&apos;s real and what isn&apos;t
          &mdash; right inside your browser.
        </p>
      </section>

      {/* ── 2. The Problem ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          The Problem
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-generated deception is no longer hypothetical. It&apos;s happening
          right now, to real people, with real consequences.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#e8c97a" }}
            >
              Email Deepfake
            </div>
            <p className="text-secondary/70 text-sm leading-relaxed">
              [Example: Mnookin email deepfake incident &mdash; a university
              president targeted by an AI-generated voice clone used to
              authorize fraudulent wire transfers.]
            </p>
          </div>
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#e8c97a" }}
            >
              AI Content Flood
            </div>
            <p className="text-secondary/70 text-sm leading-relaxed">
              [Example: Neetcode tweet about AI-generated content dominating
              feeds &mdash; developers noticing the majority of online
              discussion is now synthetic.]
            </p>
          </div>
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#e8c97a" }}
            >
              Video Deception
            </div>
            <p className="text-secondary/70 text-sm leading-relaxed">
              [Example: AI-generated video deception &mdash; deepfake videos
              used to spread misinformation during elections, financial scams,
              and social engineering attacks.]
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. What is Baloney? ── */}
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
            analyzes text, images, and video in real time &mdash; so you always
            know what you&apos;re looking at.
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
            Text Detection &mdash; Cascading Pipeline
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
          <p className="text-secondary/40 text-xs mt-4 italic">
            [More details coming &mdash; placeholder for in-depth model
            descriptions]
          </p>
        </div>

        {/* Image/Video Pipeline — Cascading */}
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 mb-6">
          <h3 className="font-display text-xl text-secondary mb-1">
            Image / Video Detection &mdash; Cascading Pipeline
          </h3>
          <p className="text-secondary/50 text-sm mb-4">
            Same early-exit strategy. Video additionally uses multi-frame
            extraction (poster + keyframes) before routing through this
            pipeline.
          </p>
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
          <p className="text-secondary/40 text-xs mt-4 italic">
            [More details coming &mdash; placeholder for in-depth model
            descriptions]
          </p>
        </div>
      </section>

      {/* ── 5. Technologies & Models ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl text-secondary mb-10 text-center">
          Technologies &amp; Models
        </h2>

        {/* API Services */}
        <h3 className="font-display text-lg text-secondary mb-4">
          API Services
        </h3>
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {apiServices.map((s) => (
            <div
              key={s.name}
              className="bg-base-dark rounded-xl border border-secondary/10 p-6"
            >
              <p className="font-display text-lg text-secondary mb-1">
                {s.name}
              </p>
              <p className="text-secondary/40 text-xs mb-3">{s.provider}</p>
              <p className="text-secondary/70 text-sm leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Open-Source Models — commented out (primary APIs only) */}
      </section>

      {/* ── 6. Detection Results ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl text-secondary mb-10 text-center">
          Detection Results
          <HandDrawnUnderline width={180} className="mx-auto mt-1" />
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
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

      {/* ── 7. Error Analysis ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          Error Analysis
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          We prioritize minimizing{" "}
          <span className="text-primary font-medium">false positives</span>{" "}
          (Type I errors) &mdash; incorrectly labeling human content as AI. A
          false accusation erodes trust far more than a missed detection.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <h3 className="font-display text-xl text-secondary mb-2">
              Confidence Floor
            </h3>
            <p className="text-secondary/70 text-sm leading-relaxed">
              No verdict is issued below a{" "}
              <span className="font-semibold" style={{ color: "#e8c97a" }}>
                60% confidence threshold
              </span>
              . Content that falls below this floor is marked{" "}
              <span className="text-amber-500 font-medium">Inconclusive</span>{" "}
              rather than making a shaky call. Users can trust that when Baloney
              says &ldquo;AI-generated,&rdquo; the system is genuinely
              confident.
            </p>
          </div>
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <h3 className="font-display text-xl text-secondary mb-2">
              Bayesian Posterior Adjustment
            </h3>
            <p className="text-secondary/70 text-sm leading-relaxed">
              Raw model outputs are adjusted using{" "}
              <span className="font-semibold" style={{ color: "#e8c97a" }}>
                Bayesian posterior reasoning
              </span>
              . In plain terms: we factor in how common AI content actually is
              on each platform. A 70% model score on a platform where only 5% of
              content is AI means the real probability is much lower than 70%.
              This dramatically reduces false positives in low-prevalence
              environments.
            </p>
          </div>
        </div>

        <div className="bg-secondary/5 rounded-lg p-4 mt-6">
          <p className="text-secondary/60 text-sm leading-relaxed text-center">
            <strong className="text-secondary/80">
              Type I (False Positive):
            </strong>{" "}
            Human content flagged as AI &mdash; we minimize this aggressively.
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong className="text-secondary/80">
              Type II (False Negative):
            </strong>{" "}
            AI content missed &mdash; acceptable at the margin; users can always
            re-scan manually.
          </p>
        </div>
      </section>

      {/* ── 8. Limitations ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          Limitations
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-8 leading-relaxed">
          No detection system is perfect. Here&apos;s what we can&apos;t
          reliably detect &mdash; and we think honesty about this matters more
          than marketing claims.
        </p>
        <div className="max-w-2xl mx-auto space-y-4">
          {limitations.map((lim, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-primary font-semibold text-sm mt-0.5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-secondary/70 text-sm leading-relaxed">{lim}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. Safety & Ethics ── */}
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

      {/* ── 10. What's Next ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          What&apos;s Next
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          Baloney started as a hackathon project. Here&apos;s where we&apos;re
          taking it.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              title: "Developer API",
              desc: "A REST API so any app can run AI content detection. Pay-per-scan pricing. Ship detection into your own product.",
            },
            {
              title: "Enterprise Dashboard",
              desc: "Organization-wide AI content analytics. Track AI exposure across teams, domains, and content types.",
            },
            {
              title: "More Models",
              desc: "Continuously adding detectors as new generative models emerge. Fine-tuning on the latest GPT, Claude, Gemini, and Sora outputs.",
            },
            {
              title: "Browser-Native Integration",
              desc: "Working toward deeper browser APIs for seamless, zero-install detection. Manifest V3 sidepanel is just the start.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-base-dark rounded-xl border border-secondary/10 p-6"
            >
              <h3
                className="font-display text-base mb-2"
                style={{ color: "#e8c97a" }}
              >
                {item.title}
              </h3>
              <p className="text-secondary/70 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 11. Installation ── */}
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
        <div className="flex justify-center gap-6 mb-6">
          {supportedSites.slice(0, 5).map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              title={site.name}
              className="w-16 h-16 rounded-full bg-white hover:scale-110 transition-transform shadow-lg overflow-hidden"
            >
              <img
                src={site.logo}
                alt={site.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            </a>
          ))}
        </div>
        <div className="flex justify-center gap-6">
          {supportedSites.slice(5, 9).map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              title={site.name}
              className="w-16 h-16 rounded-full bg-white hover:scale-110 transition-transform shadow-lg overflow-hidden"
            >
              <img
                src={site.logo}
                alt={site.name}
                className="w-16 h-16 rounded-full object-cover"
              />
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
              href="/docs/AI_CITATION.md"
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
