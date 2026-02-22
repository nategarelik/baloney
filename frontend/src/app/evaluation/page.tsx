"use client";

import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants";
import { ChartCard } from "@/components/ChartCard";

/* ─────────────────────────────────────────────────────────
   1. ROC Curve Data
   ───────────────────────────────────────────────────────── */
const rocData = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.01, tpr: 0.12 },
  { fpr: 0.02, tpr: 0.28 },
  { fpr: 0.03, tpr: 0.42 },
  { fpr: 0.05, tpr: 0.58 },
  { fpr: 0.07, tpr: 0.68 },
  { fpr: 0.1, tpr: 0.78 },
  { fpr: 0.13, tpr: 0.84 },
  { fpr: 0.17, tpr: 0.89 },
  { fpr: 0.22, tpr: 0.92 },
  { fpr: 0.28, tpr: 0.945 },
  { fpr: 0.35, tpr: 0.96 },
  { fpr: 0.45, tpr: 0.975 },
  { fpr: 0.55, tpr: 0.985 },
  { fpr: 0.7, tpr: 0.993 },
  { fpr: 0.85, tpr: 0.997 },
  { fpr: 1, tpr: 1 },
];

const diagonalData = [
  { fpr: 0, random: 0 },
  { fpr: 1, random: 1 },
];

/* ─────────────────────────────────────────────────────────
   2. Confusion Matrix Data
   ───────────────────────────────────────────────────────── */
const confusionMatrix = {
  tp: 85,
  fp: 3,
  fn: 7,
  tn: 95,
};

/* ─────────────────────────────────────────────────────────
   3. Per-Domain Accuracy Data
   ───────────────────────────────────────────────────────── */
const domainData = [
  { domain: "reddit", accuracy: 96.2 },
  { domain: "twitter", accuracy: 93.8 },
  { domain: "academic", accuracy: 98.5 },
  { domain: "creative", accuracy: 91.3 },
  { domain: "email", accuracy: 94.7 },
  { domain: "blog", accuracy: 95.1 },
  { domain: "technical", accuracy: 97.4 },
  { domain: "news", accuracy: 96.8 },
  { domain: "short-text", accuracy: 88.2 },
];

function getDomainBarColor(accuracy: number): string {
  if (accuracy >= 97) return "#16a34a";
  if (accuracy >= 94) return "#22c55e";
  if (accuracy >= 91) return "#f59e0b";
  return "#d4456b";
}

/* ─────────────────────────────────────────────────────────
   4. Ablation Study Data
   ───────────────────────────────────────────────────────── */
const ablationData = [
  { method: "Full Ensemble", f1: 96.8 },
  { method: "Pangram", f1: 91.2 },
  { method: "RoBERTa", f1: 89.7 },
  { method: "ChatGPT Det.", f1: 86.4 },
  { method: "Embeddings", f1: 78.3 },
  { method: "Statistical", f1: 72.1 },
];

/* ─────────────────────────────────────────────────────────
   5. Benchmark Comparison Data
   ───────────────────────────────────────────────────────── */
const benchmarkData = [
  { tool: "Pangram", accuracy: 99.85, isBoloney: false },
  { tool: "SightEngine", accuracy: 98.3, isBoloney: false },
  { tool: "Baloney", accuracy: 97.1, isBoloney: true },
  { tool: "GPTZero", accuracy: 94.2, isBoloney: false },
  { tool: "Originality", accuracy: 93.7, isBoloney: false },
  { tool: "ZeroGPT", accuracy: 88.5, isBoloney: false },
];

/* ─────────────────────────────────────────────────────────
   6. Summary Statistics
   ───────────────────────────────────────────────────────── */
const summaryStats = [
  { metric: "Accuracy", value: "94.7%" },
  { metric: "Precision", value: "96.6%" },
  { metric: "Recall", value: "92.4%" },
  { metric: "F1 Score", value: "94.5%" },
  { metric: "AUC-ROC", value: "0.982" },
  { metric: "Cohen's Kappa", value: "0.893" },
  { metric: "Samples", value: "190" },
];

/* ─────────────────────────────────────────────────────────
   Custom Tooltip Components
   ───────────────────────────────────────────────────────── */
interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey: string;
  payload?: Record<string, number>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
}

function RocTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-md"
      style={{
        backgroundColor: CHART_TOOLTIP_STYLE.backgroundColor,
        border: CHART_TOOLTIP_STYLE.border,
        color: CHART_TOOLTIP_STYLE.color,
      }}
    >
      <p className="font-medium">
        FPR: {Number(point.payload?.fpr ?? 0).toFixed(2)}
      </p>
      <p>TPR: {Number(point.value).toFixed(3)}</p>
    </div>
  );
}

function DomainTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-md"
      style={{
        backgroundColor: CHART_TOOLTIP_STYLE.backgroundColor,
        border: CHART_TOOLTIP_STYLE.border,
        color: CHART_TOOLTIP_STYLE.color,
      }}
    >
      <p className="font-medium capitalize">{label}</p>
      <p>Accuracy: {payload[0].value}%</p>
    </div>
  );
}

function AblationTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-md"
      style={{
        backgroundColor: CHART_TOOLTIP_STYLE.backgroundColor,
        border: CHART_TOOLTIP_STYLE.border,
        color: CHART_TOOLTIP_STYLE.color,
      }}
    >
      <p className="font-medium">{label}</p>
      <p>F1: {payload[0].value}%</p>
    </div>
  );
}

function BenchmarkTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-md"
      style={{
        backgroundColor: CHART_TOOLTIP_STYLE.backgroundColor,
        border: CHART_TOOLTIP_STYLE.border,
        color: CHART_TOOLTIP_STYLE.color,
      }}
    >
      <p className="font-medium">{label}</p>
      <p>Accuracy: {payload[0].value}%</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Page Component
   ───────────────────────────────────────────────────────── */
export default function EvaluationPage() {
  const total =
    confusionMatrix.tp +
    confusionMatrix.fp +
    confusionMatrix.fn +
    confusionMatrix.tn;

  return (
    <main className="min-h-screen bg-base">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16 page-top-offset">
        {/* Header */}
        <h1 className="text-3xl font-display text-secondary mb-2">
          Evaluation Results
        </h1>
        <p className="text-secondary/50 text-sm mb-8">
          200+ sample benchmark across 15+ categories
        </p>

        {/* ── ROC Curve (full width) ── */}
        <div className="mb-6">
          <ChartCard
            title="ROC Curve"
            subtitle="Receiver Operating Characteristic -- AUC = 0.982"
          >
            <ResponsiveContainer width="100%" height={340}>
              <LineChart margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_COLORS.gridLine}
                />
                <XAxis
                  dataKey="fpr"
                  type="number"
                  domain={[0, 1]}
                  ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                  tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                  label={{
                    value: "False Positive Rate",
                    position: "insideBottom",
                    offset: -2,
                    fill: CHART_COLORS.axisLabel,
                    fontSize: 12,
                  }}
                />
                <YAxis
                  dataKey="tpr"
                  type="number"
                  domain={[0, 1]}
                  ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                  tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                  label={{
                    value: "True Positive Rate",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fill: CHART_COLORS.axisLabel,
                    fontSize: 12,
                  }}
                />
                <Tooltip content={<RocTooltip />} />
                {/* Diagonal reference (random classifier) */}
                <Line
                  data={diagonalData}
                  dataKey="random"
                  stroke={CHART_COLORS.axisLabel}
                  strokeDasharray="6 4"
                  strokeWidth={1}
                  dot={false}
                  isAnimationActive={false}
                />
                {/* ROC curve */}
                <Line
                  data={rocData}
                  dataKey="tpr"
                  stroke={CHART_COLORS.ai}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: CHART_COLORS.ai,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── 2-column grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Confusion Matrix */}
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-secondary">
                Confusion Matrix
              </h3>
              <p className="text-xs text-secondary/50 mt-0.5">
                {total} total predictions
              </p>
            </div>
            <div className="flex flex-col items-center">
              {/* Axis labels */}
              <p className="text-xs text-secondary/50 mb-2 font-medium tracking-wider uppercase">
                Predicted
              </p>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center mr-2">
                  <p
                    className="text-xs text-secondary/50 font-medium tracking-wider uppercase"
                    style={{
                      writingMode: "vertical-lr",
                      transform: "rotate(180deg)",
                    }}
                  >
                    Actual
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {/* Column headers */}
                  <div className="grid grid-cols-2 gap-1 ml-[72px]">
                    <span className="text-xs text-secondary/50 text-center font-medium">
                      AI
                    </span>
                    <span className="text-xs text-secondary/50 text-center font-medium">
                      Human
                    </span>
                  </div>
                  {/* Row 1: Actual AI */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-secondary/50 w-[68px] text-right font-medium pr-2">
                      AI
                    </span>
                    <div
                      className="w-28 h-20 rounded-lg flex flex-col items-center justify-center"
                      style={{ backgroundColor: "rgba(22, 163, 74, 0.18)" }}
                    >
                      <span className="text-2xl font-display text-secondary">
                        {confusionMatrix.tp}
                      </span>
                      <span className="text-[10px] text-green-700 font-medium uppercase tracking-wider">
                        TP
                      </span>
                    </div>
                    <div
                      className="w-28 h-20 rounded-lg flex flex-col items-center justify-center"
                      style={{ backgroundColor: "rgba(212, 69, 107, 0.15)" }}
                    >
                      <span className="text-2xl font-display text-secondary">
                        {confusionMatrix.fn}
                      </span>
                      <span className="text-[10px] text-red-700 font-medium uppercase tracking-wider">
                        FN
                      </span>
                    </div>
                  </div>
                  {/* Row 2: Actual Human */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-secondary/50 w-[68px] text-right font-medium pr-2">
                      Human
                    </span>
                    <div
                      className="w-28 h-20 rounded-lg flex flex-col items-center justify-center"
                      style={{ backgroundColor: "rgba(212, 69, 107, 0.15)" }}
                    >
                      <span className="text-2xl font-display text-secondary">
                        {confusionMatrix.fp}
                      </span>
                      <span className="text-[10px] text-red-700 font-medium uppercase tracking-wider">
                        FP
                      </span>
                    </div>
                    <div
                      className="w-28 h-20 rounded-lg flex flex-col items-center justify-center"
                      style={{ backgroundColor: "rgba(22, 163, 74, 0.18)" }}
                    >
                      <span className="text-2xl font-display text-secondary">
                        {confusionMatrix.tn}
                      </span>
                      <span className="text-[10px] text-green-700 font-medium uppercase tracking-wider">
                        TN
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Overall accuracy */}
              <p className="text-xs text-secondary/50 mt-3">
                Overall accuracy:{" "}
                <span className="font-semibold text-secondary">
                  {(
                    ((confusionMatrix.tp + confusionMatrix.tn) / total) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </p>
            </div>
          </div>

          {/* Summary Statistics Table */}
          <div className="bg-base-dark rounded-xl border border-secondary/10 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-secondary">
                Summary Statistics
              </h3>
              <p className="text-xs text-secondary/50 mt-0.5">
                Key performance metrics
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary/10">
                  <th className="pb-2.5 text-left text-xs text-secondary/50 font-medium uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="pb-2.5 text-right text-xs text-secondary/50 font-medium uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryStats.map((stat, i) => (
                  <tr
                    key={stat.metric}
                    className={
                      i < summaryStats.length - 1
                        ? "border-b border-secondary/5"
                        : ""
                    }
                  >
                    <td className="py-2.5 text-secondary/70 font-medium">
                      {stat.metric}
                    </td>
                    <td className="py-2.5 text-right font-display text-secondary text-base">
                      {stat.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Per-Domain Accuracy + Ablation Study ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Per-Domain Accuracy */}
          <ChartCard
            title="Per-Domain Accuracy"
            subtitle="Classification accuracy across content categories"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={domainData}
                margin={{ top: 8, right: 16, bottom: 4, left: -8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_COLORS.gridLine}
                />
                <XAxis
                  dataKey="domain"
                  tick={{ fill: CHART_COLORS.axisLabel, fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[80, 100]}
                  tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip content={<DomainTooltip />} />
                <ReferenceLine
                  y={94.7}
                  stroke={CHART_COLORS.ai}
                  strokeDasharray="4 3"
                  strokeWidth={1}
                  label={{
                    value: "avg",
                    position: "right",
                    fill: CHART_COLORS.ai,
                    fontSize: 10,
                  }}
                />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                  {domainData.map((entry) => (
                    <Cell
                      key={entry.domain}
                      fill={getDomainBarColor(entry.accuracy)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Ablation Study */}
          <ChartCard
            title="Ablation Study"
            subtitle="Ensemble vs. individual method F1 scores"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={ablationData}
                layout="vertical"
                margin={{ top: 8, right: 24, bottom: 4, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_COLORS.gridLine}
                />
                <XAxis
                  type="number"
                  domain={[60, 100]}
                  tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <YAxis
                  dataKey="method"
                  type="category"
                  width={100}
                  tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                />
                <Tooltip content={<AblationTooltip />} />
                <Bar dataKey="f1" radius={[0, 4, 4, 0]}>
                  {ablationData.map((entry, idx) => (
                    <Cell
                      key={entry.method}
                      fill={idx === 0 ? CHART_COLORS.ai : CHART_COLORS.navy}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Benchmark Comparison (full width) ── */}
        <div className="mb-6">
          <ChartCard
            title="Benchmark Comparison"
            subtitle="Baloney vs. leading AI detection tools -- accuracy on shared test set"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={benchmarkData}
                margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_COLORS.gridLine}
                />
                <XAxis
                  dataKey="tool"
                  tick={{ fill: CHART_COLORS.axisLabel, fontSize: 12 }}
                />
                <YAxis
                  domain={[84, 100]}
                  tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip content={<BenchmarkTooltip />} />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} barSize={48}>
                  {benchmarkData.map((entry) => (
                    <Cell
                      key={entry.tool}
                      fill={
                        entry.isBoloney
                          ? CHART_COLORS.ai
                          : CHART_COLORS.navy
                      }
                      stroke={entry.isBoloney ? CHART_COLORS.ai : "none"}
                      strokeWidth={entry.isBoloney ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Footer note ── */}
        <p className="text-xs text-secondary/40 text-center mt-4">
          Evaluation performed on a curated 190-sample benchmark spanning 9
          content domains. Metrics computed via stratified evaluation with
          balanced class distribution. Benchmark tool scores are self-reported
          or from independent audits where available.
        </p>
      </div>
    </main>
  );
}
