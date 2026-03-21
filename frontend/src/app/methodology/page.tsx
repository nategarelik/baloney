import type { Metadata } from "next";
import Link from "next/link";
import { HandDrawnUnderline } from "@/components/HandDrawnUnderline";

export const metadata: Metadata = {
  title: "Methodology — Baloney",
  description:
    "How Baloney's detection pipeline works: cascade architecture, accuracy metrics, content provenance, privacy practices, and known limitations.",
};

// ──────────────────────────────────────────────────────────────────────────────
// Data sourced directly from frontend/src/lib/detection-config.ts
// ──────────────────────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  {
    step: "01",
    title: "Watermark Detection",
    description:
      "The first and fastest check. We query Google SynthID for cryptographic watermarks embedded in Gemini-generated text and Imagen-generated images. If a watermark is present, we return immediately with high confidence (0.97 for text, 0.95 for image) without invoking downstream APIs. C2PA content credentials from cameras and trusted publishers are also verified here.",
    tag: "fast path",
    methods: ["Google SynthID (text)", "Google SynthID (image)", "C2PA credentials"],
  },
  {
    step: "02",
    title: "Commercial API Ensemble",
    description:
      "If no watermark is found, we route to our primary commercial detectors. For text, Pangram (99.85% accuracy, arXiv:2402.14873) catches subtly edited AI content that evades open-source models. For images and video frames, SightEngine (98.3% accuracy, ARIA benchmark #1) covers 120+ generators including Sora, Veo, DALL-E, Midjourney, and Stable Diffusion. These APIs run in parallel where possible and have a 10-second timeout each.",
    tag: "primary signal",
    methods: ["Pangram API (text, 99.85%)", "SightEngine API (image/video, 98.3%)"],
  },
  {
    step: "03",
    title: "Statistical Analysis",
    description:
      "A local 12-feature ensemble runs on every request regardless of API results. Features include burstiness (rhythm variance), sentence and word length distributions, readability scores (Flesch-Kincaid), type-token ratio, perplexity proxy, transition word density, hedging language ratio, comma density, expressive punctuation rate, paragraph repetition, and bigram entropy. For images, we run frequency-domain analysis (DCT uniformity, high-frequency energy, spectral slope) and EXIF/metadata scoring.",
    tag: "always-on",
    methods: [
      "12 linguistic features (text)",
      "Frequency / DCT analysis (image)",
      "EXIF / metadata scoring (image)",
    ],
  },
] as const;

const TEXT_FEATURE_WEIGHTS = [
  { feature: "Burstiness", weight: 0.18, note: "Strongest discriminator. AI text has lower sentence-length variance." },
  { feature: "Transition words", weight: 0.12, note: "AI uses 2-3x more transition phrases (however, therefore, additionally)." },
  { feature: "Sentence length", weight: 0.14, note: "AI avg 21.6 words vs human avg 12.5 words in evaluation corpus." },
  { feature: "Word length", weight: 0.10, note: "AI avg 6.28 chars vs human avg 4.72 chars." },
  { feature: "Bigram entropy", weight: 0.06, note: "Lower entropy = more predictable word sequences = AI signal." },
  { feature: "Hedging language", weight: 0.08, note: "LLMs hedge more often (may, might, could, it is worth noting)." },
  { feature: "Readability (FK)", weight: 0.08, note: "Flesch-Kincaid grade level. AI skews higher." },
  { feature: "Type-token ratio", weight: 0.05, note: "Lower vocabulary diversity correlates with AI output." },
  { feature: "Perplexity proxy", weight: 0.05, note: "AI text is more predictable under statistical language models." },
  { feature: "Comma density", weight: 0.05, note: "AI uses more comma-separated clause structures." },
  { feature: "Expressive punctuation", weight: 0.05, note: "Low rate of em-dashes, exclamations, and ellipses correlates with AI." },
  { feature: "Paragraph repetition", weight: 0.04, note: "Structural repetition across paragraphs is an AI pattern." },
] as const;

const ACCURACY_METRICS = [
  { label: "Text precision", value: "93.2%", detail: "When we call something AI, we are right 93.2% of the time." },
  { label: "Text specificity", value: "97.0%", detail: "3% false positive rate on human content (205-sample eval)." },
  { label: "Text accuracy", value: "67.3%", detail: "Overall correct classifications on mixed corpus. See limitations below." },
  { label: "Text recall", value: "39.0%", detail: "We catch 39% of AI samples. High precision / lower recall is intentional." },
  { label: "Text F1", value: "55.0%", detail: "Harmonic mean of precision and recall." },
  { label: "Text Cohen's d", value: "1.197", detail: "Large effect size. AI and human signals are statistically separable." },
  { label: "Image accuracy", value: "83.3%", detail: "SightEngine ensemble on internal test set (heuristic prior)." },
  { label: "ROC AUC", value: "0.982", detail: "Area under the ROC curve across the full evaluation pipeline." },
] as const;

const THRESHOLD_ANALYSIS: ReadonlyArray<{
  readonly config: string;
  readonly accuracy: string;
  readonly fpRate: string;
  readonly fnRate: string;
  readonly current?: true;
}> = [
  {
    config: "Lenient (0.70 / 0.50 / 0.30)",
    accuracy: "69.3%",
    fpRate: "8.0%",
    fnRate: "52.4%",
  },
  {
    config: "Current (0.75 / 0.55 / 0.35)",
    accuracy: "67.3%",
    fpRate: "3.0%",
    fnRate: "61.0%",
    current: true,
  },
  {
    config: "Strict (0.80 / 0.60 / 0.40)",
    accuracy: "65.4%",
    fpRate: "1.0%",
    fnRate: "66.7%",
  },
];

const CONFIDENCE_RANGES = [
  {
    verdict: "AI Generated",
    range: "AI probability > 75%",
    color: "#d4456b",
    description: "High confidence the content is primarily AI-authored with minimal editing.",
  },
  {
    verdict: "Heavy Edit",
    range: "55% – 75%",
    color: "#f97316",
    description: "Significant AI involvement. Human edits present but AI structure dominates.",
  },
  {
    verdict: "Light Edit",
    range: "35% – 55%",
    color: "#f59e0b",
    description: "Moderate AI signal. Could be AI-assisted writing or paraphrased content.",
  },
  {
    verdict: "Human Written",
    range: "AI probability < 35%",
    color: "#16a34a",
    description: "Consistent with human-authored text. Does not rule out AI assistance at the word level.",
  },
] as const;

const KNOWN_LIMITATIONS = [
  {
    title: "Adversarial paraphrasing",
    description:
      "AI content run through a paraphrase model or manually reworded sentence by sentence can defeat statistical signals. Our recall rate of 39% reflects this: we prioritize not accusing humans over catching every AI sample.",
  },
  {
    title: "Short text samples",
    description:
      "Texts under 200 characters lack sufficient signal. We reduce confidence and display a caveat. Under 20 characters, we refuse to classify. Tweets and short captions are particularly unreliable.",
  },
  {
    title: "Mixed-authorship content",
    description:
      "Human text that incorporates AI-generated passages, or AI text that has been substantially edited, blends signals unpredictably. The ensemble may land in the Light Edit or Uncertain range.",
  },
  {
    title: "Novel generators",
    description:
      "A brand-new AI generator not represented in our training data or our commercial API providers' training sets may evade detection. We update as providers update their models.",
  },
  {
    title: "Platform DOM changes",
    description:
      "The Chrome extension relies on site-specific DOM selectors to extract content. Platform UI updates can break extraction until we ship a patch. Detection accuracy is not affected — only content ingestion.",
  },
  {
    title: "Video detection immaturity",
    description:
      "Video is analyzed frame-by-frame through the image pipeline. Temporal coherence, lip sync artifacts, and motion consistency are not currently analyzed. Expect lower accuracy on short, low-resolution clips.",
  },
  {
    title: "Screenshots of AI text",
    description:
      "Text content rendered as an image bypasses our text pipeline entirely. The image pipeline will analyze the screenshot as a photograph, which is not designed for this use case.",
  },
] as const;

// ──────────────────────────────────────────────────────────────────────────────

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-base">
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-12 page-top-offset text-center">
        <h1 className="font-display text-4xl md:text-5xl text-secondary mb-5 leading-tight">
          How Detection Works
          <HandDrawnUnderline width={240} className="mx-auto mt-2" />
        </h1>
        <p className="text-secondary/70 text-lg max-w-2xl mx-auto leading-relaxed">
          A complete account of Baloney&apos;s detection pipeline, accuracy
          metrics, content provenance system, and known limitations. We believe
          transparency about methodology builds more trust than marketing
          claims.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <a
            href="#pipeline"
            className="px-5 py-2 border border-secondary/20 text-secondary/70 text-sm font-medium rounded-full hover:bg-secondary/5 transition-colors"
          >
            Pipeline
          </a>
          <a
            href="#accuracy"
            className="px-5 py-2 border border-secondary/20 text-secondary/70 text-sm font-medium rounded-full hover:bg-secondary/5 transition-colors"
          >
            Accuracy
          </a>
          <a
            href="#slop-index"
            className="px-5 py-2 border border-secondary/20 text-secondary/70 text-sm font-medium rounded-full hover:bg-secondary/5 transition-colors"
          >
            Slop Index
          </a>
          <a
            href="#provenance"
            className="px-5 py-2 border border-secondary/20 text-secondary/70 text-sm font-medium rounded-full hover:bg-secondary/5 transition-colors"
          >
            Provenance
          </a>
          <a
            href="#privacy"
            className="px-5 py-2 border border-secondary/20 text-secondary/70 text-sm font-medium rounded-full hover:bg-secondary/5 transition-colors"
          >
            Privacy
          </a>
          <a
            href="#limitations"
            className="px-5 py-2 border border-secondary/20 text-secondary/70 text-sm font-medium rounded-full hover:bg-secondary/5 transition-colors"
          >
            Limitations
          </a>
        </div>
      </section>

      {/* ── 1. Detection Pipeline Architecture ── */}
      <section id="pipeline" className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          Detection Pipeline Architecture
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          Every scan runs through a three-stage cascade. Stages are ordered by
          speed and specificity: a positive result at any stage short-circuits
          later stages, reducing latency and API cost without sacrificing
          accuracy.
        </p>

        <div className="space-y-4 mb-10">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage.step}
              className="bg-base-dark rounded-xl border border-secondary/10 p-6"
            >
              <div className="flex items-start gap-4">
                <span className="text-primary font-display text-2xl shrink-0 leading-none mt-0.5">
                  {stage.step}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display text-lg text-secondary">
                      {stage.title}
                    </h3>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {stage.tag}
                    </span>
                  </div>
                  <p className="text-secondary/60 text-sm leading-relaxed mb-3">
                    {stage.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stage.methods.map((m) => (
                      <span
                        key={m}
                        className="text-xs px-2 py-0.5 rounded-full bg-secondary/8 text-secondary/60 border border-secondary/10"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why cascade ordering matters */}
        <div className="bg-secondary/5 rounded-lg p-5">
          <h3 className="font-display text-base text-secondary mb-2">
            Why cascade ordering matters
          </h3>
          <p className="text-secondary/60 text-sm leading-relaxed">
            Watermarks are deterministic: either the cryptographic signature is
            present or it is not. Calling an expensive commercial API when a
            watermark is already found wastes time and budget. Placing the
            statistical fallback last means it only runs when commercial APIs
            are unavailable, serving as a safety net rather than the primary
            signal. This ordering also means our false positive rate is driven
            by our most accurate methods, not our least accurate ones.
          </p>
        </div>

        {/* Statistical feature weights */}
        <div className="mt-8">
          <h3 className="font-display text-xl text-secondary mb-2">
            Statistical Feature Weights (Text)
          </h3>
          <p className="text-secondary/60 text-sm mb-5 leading-relaxed">
            The 12-feature ensemble uses learned weights derived from 205
            evaluation samples. Weights reflect discriminative power, not
            arbitrary assignment.
          </p>
          <div className="space-y-2">
            {TEXT_FEATURE_WEIGHTS.map((f) => (
              <div
                key={f.feature}
                className="bg-base-dark rounded-lg border border-secondary/10 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-secondary text-sm font-medium">
                    {f.feature}
                  </span>
                  <span className="text-primary font-display text-sm shrink-0">
                    {(f.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-secondary/8 rounded-full h-1 mb-1.5">
                  <div
                    className="bg-primary/60 h-1 rounded-full"
                    style={{ width: `${f.weight * 100 * (100 / 18)}%` }}
                  />
                </div>
                <p className="text-secondary/50 text-xs">{f.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Accuracy Metrics ── */}
      <section id="accuracy" className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          Accuracy Metrics
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          These figures are honest. The 67.3% overall accuracy on our internal
          text evaluation corpus does not match the 99.85% figure you see for
          Pangram. There is no contradiction: our evaluation corpus includes
          adversarially generated, lightly edited, and paraphrased samples
          designed to stress-test the system. We run the full pipeline, not
          just the commercial API.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {ACCURACY_METRICS.map((m) => (
            <div
              key={m.label}
              className="bg-base-dark rounded-xl border border-secondary/10 p-5 text-center"
            >
              <p className="font-display text-2xl text-primary mb-1">
                {m.value}
              </p>
              <p className="text-secondary/50 text-xs mb-2">{m.label}</p>
              <p className="text-secondary/40 text-xs leading-relaxed">
                {m.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Threshold tradeoff */}
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 mb-6">
          <h3 className="font-display text-lg text-secondary mb-1">
            Threshold Design: Precision over Recall
          </h3>
          <p className="text-secondary/60 text-sm mb-5 leading-relaxed">
            We intentionally accept lower recall (catching fewer AI samples) to
            minimize false positives (accusing human authors of using AI). The
            table below shows the tradeoff at three threshold configurations.
            Our current thresholds target a 3% false positive rate.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary/10">
                  <th className="text-left py-2 pr-4 text-secondary/50 font-medium text-xs">
                    Configuration
                  </th>
                  <th className="text-right py-2 px-3 text-secondary/50 font-medium text-xs">
                    Accuracy
                  </th>
                  <th className="text-right py-2 px-3 text-secondary/50 font-medium text-xs">
                    False positive rate
                  </th>
                  <th className="text-right py-2 pl-3 text-secondary/50 font-medium text-xs">
                    False negative rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {THRESHOLD_ANALYSIS.map((row) => (
                  <tr
                    key={row.config}
                    className={
                      row.current
                        ? "border-l-2 border-primary bg-primary/5"
                        : "border-b border-secondary/5"
                    }
                  >
                    <td className="py-2.5 pr-4 text-secondary text-xs">
                      {row.config}
                      {row.current && (
                        <span className="ml-2 text-xs text-primary">
                          current
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-secondary/70 text-xs">
                      {row.accuracy}
                    </td>
                    <td className="py-2.5 px-3 text-right text-secondary/70 text-xs">
                      {row.fpRate}
                    </td>
                    <td className="py-2.5 pl-3 text-right text-secondary/70 text-xs">
                      {row.fnRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Evaluation corpus */}
        <div className="bg-secondary/5 rounded-lg p-5">
          <h3 className="font-display text-base text-secondary mb-2">
            Evaluation corpus
          </h3>
          <p className="text-secondary/60 text-sm leading-relaxed">
            205 samples (105 AI-generated, 100 human-written) across 10 test
            suites covering read-heavy prose, technical writing, casual
            conversation, social media posts, and adversarially paraphrased
            content. All 36 evaluation tests pass against the current pipeline.
            Full evaluation results including ROC curves, ablation study, and
            per-domain breakdown are available at{" "}
            <Link
              href="/evaluation"
              className="text-primary underline hover:opacity-80"
            >
              /evaluation
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── 3. Interpreting Confidence Scores ── */}
      <section id="confidence" className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          Interpreting Confidence Scores
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          The confidence percentage shown on each scan is a Bayesian posterior
          computed from the ensemble outputs, weighted by each method&apos;s
          historical accuracy and the prior probability that content on a given
          platform is AI-generated. It is not a raw API score.
        </p>

        <div className="space-y-4 mb-8">
          {CONFIDENCE_RANGES.map((r) => (
            <div
              key={r.verdict}
              className="bg-base-dark rounded-xl border border-secondary/10 p-5 flex items-start gap-4"
            >
              <div
                className="shrink-0 w-3 h-3 rounded-full mt-1"
                style={{ background: r.color }}
              />
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-1">
                  <span
                    className="font-display text-base"
                    style={{ color: r.color }}
                  >
                    {r.verdict}
                  </span>
                  <span className="text-secondary/40 text-xs">{r.range}</span>
                </div>
                <p className="text-secondary/60 text-sm leading-relaxed">
                  {r.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-secondary/5 rounded-lg p-5">
          <p className="text-secondary/60 text-sm leading-relaxed">
            <strong className="text-secondary/80">Important:</strong> A verdict
            of &quot;Human Written&quot; does not certify that content is
            human-authored. It means the content is consistent with
            human-authored text under our current detection methods. No
            detection system can provide that guarantee. A confidence score of
            60% should be read as &quot;this scan is not conclusive enough to
            display a verdict&quot; &mdash; we show &quot;inconclusive&quot;
            below our 60% confidence floor rather than guessing.
          </p>
        </div>
      </section>

      {/* ── 4. Slop Index Methodology ── */}
      <section id="slop-index" className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          Slop Index Methodology
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          The Slop Index grades each platform from A+ to F based on the
          prevalence of AI-generated content in scans submitted by Baloney
          users. It is an independent measurement, not self-reported platform
          data.
        </p>

        <div className="bg-base-dark rounded-xl border border-secondary/10 p-6 mb-6">
          <h3 className="font-display text-lg text-secondary mb-4">
            How the index is computed
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "Scan aggregation",
                detail:
                  "All scans on a given platform over the trailing 30-day window are aggregated. Only community-shared scans are included (opt-in). Anonymous scans are included to prevent selection bias from authenticated users.",
              },
              {
                label: "AI content rate",
                detail:
                  'The fraction of scans with verdict "AI Generated" or "Heavy Edit" divided by total scans with a non-inconclusive verdict. Scans below our confidence floor are excluded to avoid diluting the signal with uncertain classifications.',
              },
              {
                label: "Exposure score weighting",
                detail:
                  "Raw AI content rate is not sufficient. A platform with 10 total scans should not be compared directly to one with 10,000. The Supabase compute_exposure_score() RPC function applies a minimum sample threshold and a logarithmic volume weight before computing the final index value.",
              },
              {
                label: "Grade assignment",
                detail:
                  "Index values are mapped to letter grades (A+ through F) using fixed breakpoints. The breakpoints were set based on our initial platform dataset and are subject to revision as the corpus grows.",
              },
            ].map((item, i) => (
              <div key={item.label} className="flex gap-4">
                <span className="text-primary font-display text-lg shrink-0 leading-none mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-secondary text-sm font-medium mb-1">
                    {item.label}
                  </p>
                  <p className="text-secondary/60 text-sm leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-secondary/5 rounded-lg p-5">
          <p className="text-secondary/60 text-sm leading-relaxed">
            <strong className="text-secondary/80">Limitation:</strong> The
            index reflects the content seen by Baloney users, not a random
            sample of each platform. Users who install a content detection
            extension are not a representative sample of the general user
            population. Platforms with large Baloney user bases will have more
            reliable index values. The live index is at{" "}
            <Link
              href="/dashboard/community"
              className="text-primary underline hover:opacity-80"
            >
              /dashboard/community
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── 5. Content Provenance ── */}
      <section id="provenance" className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          Content Provenance
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          Content fingerprinting lets us track the same piece of content across
          platforms and over time without storing the content itself.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <h3
              className="font-display text-base mb-3"
              style={{ color: "#e8c97a" }}
            >
              What is stored
            </h3>
            <ul className="space-y-2 text-sm text-secondary/60 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-primary shrink-0 mt-0.5">+</span>
                SHA-256 hash of the content (text or image)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary shrink-0 mt-0.5">+</span>
                Verdict (human / light_edit / heavy_edit / ai_generated)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary shrink-0 mt-0.5">+</span>
                Confidence score (0.0 &ndash; 1.0)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary shrink-0 mt-0.5">+</span>
                Platform identifier (instagram, x, reddit, etc.)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary shrink-0 mt-0.5">+</span>
                SHA-256 hash of the source URL (not the URL itself)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary shrink-0 mt-0.5">+</span>
                Scan timestamp and content type
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary shrink-0 mt-0.5">+</span>
                Anonymous user ID (session token, no PII)
              </li>
            </ul>
          </div>
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
            <h3
              className="font-display text-base mb-3"
              style={{ color: "#d4456b" }}
            >
              What is never stored
            </h3>
            <ul className="space-y-2 text-sm text-secondary/60 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-secondary/40 shrink-0 mt-0.5">&mdash;</span>
                The original text content
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary/40 shrink-0 mt-0.5">&mdash;</span>
                The original image or video data
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary/40 shrink-0 mt-0.5">&mdash;</span>
                The source URL (only the hash)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary/40 shrink-0 mt-0.5">&mdash;</span>
                Author names, account identifiers, or attribution
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary/40 shrink-0 mt-0.5">&mdash;</span>
                IP address or device fingerprint
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary/40 shrink-0 mt-0.5">&mdash;</span>
                Any personally identifiable information
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
          <h3 className="font-display text-lg text-secondary mb-2">
            How fingerprinting works
          </h3>
          <p className="text-secondary/60 text-sm leading-relaxed mb-4">
            When a scan is recorded, the content is hashed with SHA-256 before
            leaving the API handler. The hash is stored; the content is
            discarded. When the same content appears again &mdash; on a
            different platform, or scanned by a different user &mdash; the hash
            matches, and the existing verdict is retrieved instantly without
            re-running the detection pipeline.
          </p>
          <div className="bg-secondary/5 rounded-lg p-4 font-mono text-xs text-secondary/60 leading-relaxed overflow-x-auto">
            <pre>{`// Supabase RPC: record_scan_with_provenance()
content_hash  = SHA256(normalized_content)
url_hash      = SHA256(source_url)          // only if URL provided

INSERT INTO scans (
  content_hash, url_hash, verdict,
  confidence, platform, scan_type,
  user_id, scanned_at
)
-- content itself is never inserted`}</pre>
          </div>
        </div>
      </section>

      {/* ── 6. Privacy Practices ── */}
      <section id="privacy" className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          Privacy Practices
        </h2>
        <p className="text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          Privacy is a design constraint, not an afterthought. The following
          practices are enforced at the API layer, not just in policy.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              title: "Content is never stored",
              detail:
                "Text, images, and video frames are processed in memory and discarded before any database write occurs. The detection pipeline is stateless with respect to content.",
            },
            {
              title: "No personally identifiable information",
              detail:
                "User IDs are anonymous UUIDs generated at session start. We have no name, email, or account data unless you sign up, in which case only the email is stored for account management.",
            },
            {
              title: "URLs are hashed, not stored",
              detail:
                "Source URLs submitted with a scan are SHA-256 hashed before storage. We can determine if two scans came from the same URL, but the URL itself cannot be reconstructed from the hash.",
            },
            {
              title: "Community sharing is opt-in",
              detail:
                "Scans are private by default. You explicitly choose to contribute to the community dataset. This applies to both the Chrome extension and the web analyzer.",
            },
            {
              title: "Third-party API data handling",
              detail:
                "Content sent to Pangram and SightEngine is governed by their respective privacy policies. We transmit only the minimum required payload. We do not send user identifiers to third-party APIs.",
            },
            {
              title: "Data retention",
              detail:
                "Scan records (verdict, hash, metadata) are retained indefinitely for aggregate analytics. There is currently no automated deletion schedule. Authenticated users can request deletion of their scan history.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-base-dark rounded-xl border border-secondary/10 p-5"
            >
              <h3 className="font-display text-base text-secondary mb-2">
                {item.title}
              </h3>
              <p className="text-secondary/60 text-sm leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Known Limitations ── */}
      <section id="limitations" className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-secondary mb-3 text-center">
          Known Limitations
        </h2>
        <p className="text-secondary/70 text-center max-w-xl mx-auto mb-10 leading-relaxed">
          No detection system is complete. We document known failure modes so
          users can interpret results with appropriate skepticism.
        </p>

        <div className="space-y-4 mb-10">
          {KNOWN_LIMITATIONS.map((lim, i) => (
            <div
              key={lim.title}
              className="bg-base-dark rounded-xl border border-secondary/10 p-5 flex gap-4"
            >
              <span className="text-primary font-display text-lg shrink-0 leading-none mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-base text-secondary mb-1">
                  {lim.title}
                </h3>
                <p className="text-secondary/60 text-sm leading-relaxed">
                  {lim.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-secondary/5 rounded-lg p-5">
          <p className="text-secondary/60 text-sm leading-relaxed text-center">
            We prioritize minimizing{" "}
            <strong className="text-secondary/80">false positives</strong>{" "}
            &mdash; incorrectly labeling human content as AI. A false
            accusation is more harmful than a missed detection. Our 3%
            false positive rate target is a deliberate design choice, not a
            benchmark shortfall.
          </p>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="max-w-4xl mx-auto px-6 pt-4 pb-24">
        <div className="bg-base-dark rounded-xl border border-secondary/10 p-8 text-center">
          <h2 className="font-display text-2xl text-secondary mb-3">
            See It In Action
          </h2>
          <p className="text-secondary/60 text-sm mb-6 max-w-lg mx-auto leading-relaxed">
            The evaluation dashboard includes ROC curves, per-domain accuracy
            breakdowns, ablation study results, and ensemble comparison data.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/evaluation"
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Evaluation Dashboard
            </Link>
            <Link
              href="/analyze"
              className="px-6 py-2.5 border border-secondary/20 text-secondary font-semibold rounded-lg hover:bg-secondary/5 transition-colors text-sm"
            >
              Try the Detector
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
    </main>
  );
}
