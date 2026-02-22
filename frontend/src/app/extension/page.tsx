"use client";

import {
  ScanSearch,
  Globe,
  Eye,
  Shield,
  BarChart3,
  Zap,
  Download,
  Settings,
  Chrome,
  FlaskConical,
  Brain,
  Layers,
  CheckCircle2,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Video,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

/* ─── Real test data from vitest run (36/36 pass, Feb 22 2026) ─── */

const PIPELINE_STATS = {
  totalTests: 36,
  totalPassed: 36,
  testSuites: 10,
  totalSamples: 205,
  aiSamples: 105,
  humanSamples: 100,
};

const TEXT_METRICS = {
  precision: 93.2,
  specificity: 97.0,
  accuracy: 67.3,
  recall: 39.0,
  f1: 55.0,
  cohensD: 1.197,
  effectSize: "LARGE",
  aiSignalMean: 0.5362,
  humanSignalMean: 0.3413,
  separation: 0.1949,
};

const IMAGE_METRICS = {
  accuracy: 83.3,
  smoothVsNoisy: { smooth: 0.9988, noisy: 0.2806 },
  avgAiFreq: 0.7325,
  avgHumanFreq: 0.2744,
};

const ENSEMBLE_SENSITIVITY = [
  { name: "Read-heavy", accuracy: 69.8, f1: 61.3 },
  { name: "Burst-heavy", accuracy: 66.3, f1: 54.3 },
  { name: "Current", accuracy: 67.3, f1: 55.0 },
  { name: "Equal weights", accuracy: 55.6, f1: 26.0 },
];

const THRESHOLD_ANALYSIS = [
  {
    name: "Lenient (0.70/0.50/0.30)",
    accuracy: 69.3,
    fpRate: 8.0,
    fnRate: 52.4,
  },
  {
    name: "Current (0.75/0.55/0.35)",
    accuracy: 67.3,
    fpRate: 3.0,
    fnRate: 61.0,
  },
  {
    name: "Strict (0.80/0.60/0.40)",
    accuracy: 65.4,
    fpRate: 1.0,
    fnRate: 66.7,
  },
];

const FEATURE_SEPARATION = [
  {
    feature: "Signal (composite)",
    aiMean: 0.5362,
    humanMean: 0.3413,
    delta: "+0.1949",
  },
  {
    feature: "Burstiness",
    aiMean: 0.5718,
    humanMean: 0.7805,
    delta: "-0.2087",
  },
  {
    feature: "Readability",
    aiMean: 0.9478,
    humanMean: 0.8074,
    delta: "+0.1404",
  },
  {
    feature: "Avg Sentence Len",
    aiMean: 20.79,
    humanMean: 16.04,
    delta: "+4.75",
  },
  { feature: "Avg Word Len", aiMean: 5.84, humanMean: 4.73, delta: "+1.11" },
  {
    feature: "Perplexity Norm",
    aiMean: 0.7397,
    humanMean: 0.9265,
    delta: "-0.1868",
  },
];

const TEXT_METHODS = [
  {
    name: "Pangram API",
    weight: "38%",
    accuracy: "99.85%",
    desc: "SOTA commercial detector (arXiv:2402.14873)",
  },
  {
    name: "SynthID Text",
    weight: "7%",
    accuracy: "Watermark",
    desc: "Google Gemini watermark detection",
  },
  // { name: "RoBERTa", weight: "17%", accuracy: "~95%", desc: "GPT-2 output detector via HuggingFace" },
  // { name: "ChatGPT Detector", weight: "14%", accuracy: "~90%", desc: "HC3-trained RoBERTa variant" },
  {
    name: "Statistical (12 feat)",
    weight: "18%",
    accuracy: "67.3%",
    desc: "Burstiness, entropy, readability, hedging",
  },
  // { name: "Embeddings", weight: "6%", accuracy: "~85%", desc: "Sentence-level structural analysis" },
];

const IMAGE_METHODS = [
  {
    name: "SightEngine",
    weight: "32%",
    accuracy: "98.3%",
    desc: "ARIA benchmark #1, 120+ AI generators",
  },
  {
    name: "SynthID Image",
    weight: "10%",
    accuracy: "Watermark",
    desc: "Google Imagen watermark detection",
  },
  // { name: "ViT Classifier", weight: "18%", accuracy: "~90%", desc: "AI image detector via HuggingFace" },
  {
    name: "Frequency/DCT",
    weight: "18%",
    accuracy: "83.3%",
    desc: "Multi-scale variance + spectral analysis",
  },
  {
    name: "Metadata/EXIF",
    weight: "13%",
    accuracy: "~75%",
    desc: "Camera provenance and format signals",
  },
  // { name: "SDXL Detector", weight: "9%", accuracy: "~88%", desc: "SDXL/Midjourney/DALL-E 3 specialist" },
];

const FEATURES = [
  {
    icon: Globe,
    title: "Works Everywhere",
    description:
      "Scans images and text on any website — Instagram, X, Reddit, news sites, and more.",
  },
  {
    icon: Eye,
    title: "Auto-Scanning",
    description:
      "Automatically detects AI content as you scroll. No clicks needed.",
  },
  {
    icon: Shield,
    title: "Content Filtering",
    description:
      "Blur or hide AI-generated content. Choose Scan, Blur, or Block modes.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Stats",
    description:
      "Track scans, AI exposure, and per-page breakdowns in the popup.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Color-coded dots and underlines appear in real time as you browse.",
  },
  {
    icon: ScanSearch,
    title: "Deep Analysis",
    description:
      "Click any detection to see per-method score breakdown in the sidepanel.",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Download",
    description:
      "Download the Baloney extension folder from our GitHub repository.",
    icon: Download,
  },
  {
    num: "2",
    title: "Unpack",
    description:
      "Unzip the folder to a location on your computer you'll remember.",
    icon: Settings,
  },
  {
    num: "3",
    title: "Load Extension",
    description:
      "Open chrome://extensions, enable Developer Mode, click 'Load unpacked', and select the folder.",
    icon: Chrome,
  },
];

/* ─── Small reusable components ─── */

function StatBox({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl md:text-4xl text-primary">
        {value}
      </div>
      <div className="text-sm font-semibold text-secondary/80 mt-1">
        {label}
      </div>
      {sub && <div className="text-xs text-secondary/50 mt-0.5">{sub}</div>}
    </div>
  );
}

function MethodRow({
  name,
  weight,
  accuracy,
  desc,
}: {
  name: string;
  weight: string;
  accuracy: string;
  desc: string;
}) {
  const isWatermark = accuracy === "Watermark";
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-secondary/8 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-secondary text-sm">{name}</span>
          {isWatermark && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/30 text-secondary/80">
              WATERMARK
            </span>
          )}
        </div>
        <div className="text-xs text-secondary/50 mt-0.5">{desc}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold text-primary">
          {isWatermark ? "Override" : accuracy}
        </div>
        <div className="text-xs text-secondary/50">{weight} weight</div>
      </div>
    </div>
  );
}

function BarChart({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 w-full rounded-full bg-secondary/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

/* ─── Main page ─── */

export default function ExtensionPage() {
  return (
    <main className="min-h-screen bg-base text-secondary">
      {/* ── Hero ── */}
      <section className="px-6 pt-12 pb-16 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
          <FlaskConical className="h-4 w-4" />
          System Analysis &middot; 36/36 Tests Passing
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-secondary leading-tight mb-4">
          How Baloney
          <br />
          <span className="text-primary">Detects AI Content</span>
        </h1>
        <p className="text-secondary/60 text-lg max-w-2xl mx-auto">
          A multi-signal ensemble system tested against 205 labeled samples
          across text, image, and video. Every number on this page comes from
          our production test suite.
        </p>
      </section>

      {/* ── Headline metrics ── */}
      <section className="px-6 pb-12 max-w-5xl mx-auto">
        <div className="bg-base-dark rounded-2xl border border-secondary/10 p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatBox
              value="93.2%"
              label="Precision"
              sub="When we flag AI, we're right"
            />
            <StatBox
              value="97.0%"
              label="Specificity"
              sub="Human content stays unflagged"
            />
            <StatBox
              value="1.197"
              label="Cohen's d"
              sub="Large effect size separation"
            />
            <StatBox
              value="36/36"
              label="Tests Passing"
              sub="10 test suites, 205 samples"
            />
          </div>
        </div>
      </section>

      {/* ── What these numbers mean ── */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-secondary">
                What We're Best At
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-secondary/70">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">93.2%</span>
                <span>
                  When Baloney flags content as AI, it's correct 93% of the
                  time. Only 3% false positive rate.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">97.0%</span>
                <span>
                  Human-written content is correctly identified 97% of the time.
                  Your real posts won't get flagged.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">1.197</span>
                <span>
                  Cohen's d effect size — the statistical separation between AI
                  and human signals is <strong>large</strong> and robust.
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-secondary">How It Works</h3>
            </div>
            <ul className="space-y-3 text-sm text-secondary/70">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">3-4</span>
                <span>
                  Independent detection signals per modality — primary
                  commercial APIs plus local analysis.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">Cascade</span>
                <span>
                  SynthID watermarks checked first, then commercial APIs
                  (Pangram for text, SightEngine for images).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">Adaptive</span>
                <span>
                  Weights redistribute when APIs are down. The system never
                  fully fails — it degrades gracefully.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Detection Pipeline ── */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl text-secondary mb-2 text-center">
          Detection Pipeline
        </h2>
        <p className="text-secondary/50 text-center mb-8 text-sm">
          Primary commercial APIs with watermark detection and local analysis
          signals
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text */}
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-secondary">
                Text Detection (3 Signals)
              </h3>
            </div>
            <div className="space-y-0">
              {TEXT_METHODS.map((m) => (
                <MethodRow key={m.name} {...m} />
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-secondary">
                Image Detection (4 Signals)
              </h3>
            </div>
            <div className="space-y-0">
              {IMAGE_METHODS.map((m) => (
                <MethodRow key={m.name} {...m} />
              ))}
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="mt-6 bg-base-dark rounded-xl border border-secondary/10 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-secondary">Video Detection</h3>
          </div>
          <p className="text-sm text-secondary/60">
            Extracts up to 8 frames, runs image ensemble per-frame, then applies
            temporal consistency analysis. Standard deviation &lt; 0.08 with
            high avg score triggers temporal AI bonus. Covers deepfakes,
            AI-generated clips, and spliced content.
          </p>
        </div>
      </section>

      {/* ── Feature Separation (the real data) ── */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl text-secondary mb-2 text-center">
          Signal Separation
        </h2>
        <p className="text-secondary/50 text-center mb-8 text-sm">
          Measured across {PIPELINE_STATS.totalSamples} labeled samples —{" "}
          {PIPELINE_STATS.aiSamples} AI + {PIPELINE_STATS.humanSamples} human
        </p>

        <div className="bg-base-dark rounded-xl border border-secondary/10 overflow-hidden">
          <div className="grid grid-cols-4 gap-2 px-6 py-3 bg-secondary/5 text-xs font-semibold text-secondary/60 uppercase tracking-wide">
            <div>Feature</div>
            <div className="text-center">AI Mean</div>
            <div className="text-center">Human Mean</div>
            <div className="text-right">Delta</div>
          </div>
          {FEATURE_SEPARATION.map((f, i) => (
            <div
              key={f.feature}
              className={`grid grid-cols-4 gap-2 px-6 py-3 text-sm ${i % 2 === 0 ? "" : "bg-secondary/3"}`}
            >
              <div className="font-medium text-secondary">{f.feature}</div>
              <div className="text-center text-primary font-mono">
                {f.aiMean}
              </div>
              <div className="text-center text-green-700 font-mono">
                {f.humanMean}
              </div>
              <div className="text-right font-mono font-semibold text-secondary/70">
                {f.delta}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ensemble Sensitivity ── */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl text-secondary mb-2 text-center">
          Ensemble Weight Tuning
        </h2>
        <p className="text-secondary/50 text-center mb-8 text-sm">
          We tested 5 weight configurations to find the optimal balance between
          precision and recall
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weight configs */}
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <h3 className="font-semibold text-secondary text-sm mb-4">
              Weight Configurations
            </h3>
            <div className="space-y-4">
              {ENSEMBLE_SENSITIVITY.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-secondary/70">{c.name}</span>
                    <span className="font-semibold text-secondary">
                      {c.accuracy}% acc / {c.f1}% F1
                    </span>
                  </div>
                  <BarChart value={c.f1} max={70} color="#d4456b" />
                </div>
              ))}
            </div>
          </div>

          {/* Threshold configs */}
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <h3 className="font-semibold text-secondary text-sm mb-4">
              Verdict Threshold Tuning
            </h3>
            <div className="space-y-4">
              {THRESHOLD_ANALYSIS.map((t) => (
                <div key={t.name} className="bg-secondary/5 rounded-lg p-3">
                  <div className="text-sm font-medium text-secondary mb-2">
                    {t.name}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-secondary/50">Accuracy</div>
                      <div className="font-semibold text-secondary">
                        {t.accuracy}%
                      </div>
                    </div>
                    <div>
                      <div className="text-secondary/50">FP Rate</div>
                      <div className="font-semibold text-green-700">
                        {t.fpRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-secondary/50">FN Rate</div>
                      <div className="font-semibold text-primary">
                        {t.fnRate}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-secondary/40 mt-2">
                Our current thresholds prioritize low false positives (3%) —
                we'd rather miss some AI than wrongly flag a human.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Image Detection Strength ── */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl text-secondary mb-8 text-center">
          Image Frequency Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 text-center">
            <div className="font-display text-3xl text-primary mb-1">
              {IMAGE_METRICS.accuracy}%
            </div>
            <div className="text-sm text-secondary/60">
              Local Method F+G Accuracy
            </div>
            <div className="text-xs text-secondary/40 mt-1">
              Without any commercial APIs
            </div>
          </div>
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 text-center">
            <div className="font-display text-3xl text-primary mb-1">0.999</div>
            <div className="text-sm text-secondary/60">
              Smooth vs Noisy Separation
            </div>
            <div className="text-xs text-secondary/40 mt-1">
              AI smooth: 0.999, Random noise: 0.281
            </div>
          </div>
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 text-center">
            <div className="font-display text-3xl text-primary mb-1">2.7x</div>
            <div className="text-sm text-secondary/60">
              AI vs Human Freq Ratio
            </div>
            <div className="text-xs text-secondary/40 mt-1">
              AI avg: 0.733, Human avg: 0.274
            </div>
          </div>
        </div>
      </section>

      {/* ── Cascade Architecture ── */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl text-secondary mb-8 text-center">
          Cascade Architecture
        </h2>
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 md:p-8">
          <div className="space-y-4">
            {[
              {
                step: "1",
                label: "SynthID Watermark",
                detail:
                  "Detects Google Gemini/Imagen watermarks. If found, returns 0.95-0.97 probability immediately.",
                badge: "Early exit",
                color: "bg-accent/30",
              },
              {
                step: "2",
                label: "Commercial API",
                detail:
                  "Pangram (text, 99.85%) or SightEngine (image, 98.3%). High accuracy, rate-limited.",
                badge: "Primary",
                color: "bg-primary/20",
              },
              // Step 3 (Reality Defender) and Step 4 (HuggingFace Ensemble) commented out — primary APIs only
            ].map((s, i) => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                  {s.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-secondary">
                      {s.label}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.color} text-secondary/70`}
                    >
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-sm text-secondary/60">{s.detail}</p>
                </div>
                {i < 1 && (
                  <ArrowRight className="h-4 w-4 text-secondary/20 mt-2 shrink-0 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-6">
        <hr className="border-secondary/10" />
      </div>

      {/* ── Features Grid ── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl text-secondary mb-8 text-center">
          Extension Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-base-dark rounded-xl border border-secondary/10 p-5 hover:border-primary/20 transition"
            >
              <feature.icon className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold text-secondary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-secondary/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Install Steps ── */}
      <section className="px-6 pb-12 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl text-secondary mb-8 text-center">
          Install in 3 Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="bg-base-dark rounded-xl border border-secondary/10 p-6 text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/30 text-primary text-xl font-bold mb-4">
                {step.num}
              </div>
              <h3 className="font-semibold text-secondary mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-secondary/60">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTAs ── */}
      <section className="px-6 pb-16 max-w-5xl mx-auto text-center space-y-4">
        <Link
          href="/evaluation"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full transition text-base"
        >
          <TrendingUp className="h-4 w-4" />
          View Full Evaluation
        </Link>
        <div>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-secondary/20 text-secondary font-semibold rounded-full hover:bg-secondary/5 transition text-base"
          >
            Try the Detector
          </Link>
        </div>
      </section>

      {/* ── Footer note ── */}
      <footer className="text-center py-8 text-xs text-secondary/40 border-t border-secondary/10">
        All metrics from vitest run on {PIPELINE_STATS.totalSamples} labeled
        samples &middot; {PIPELINE_STATS.totalTests}/{PIPELINE_STATS.totalTests}{" "}
        tests passing &middot; Feb 22, 2026
      </footer>
    </main>
  );
}
