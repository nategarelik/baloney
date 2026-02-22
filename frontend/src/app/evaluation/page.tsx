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
import {
  rocData,
  diagonalData,
  aucRoc,
  confusionMatrix,
  domainData,
  ablationData,
  summaryStats,
  totalSamples,
  overallAccuracy,
} from "@/lib/evaluation-data";

/* ─────────────────────────────────────────────────────────
   Helper: bar color based on accuracy
   ───────────────────────────────────────────────────────── */
function getDomainBarColor(accuracy: number): string {
  if (accuracy >= 97) return "#16a34a";
  if (accuracy >= 94) return "#22c55e";
  if (accuracy >= 91) return "#f59e0b";
  return "#d4456b";
}

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

/* ─────────────────────────────────────────────────────────
   Main Page Component
   ───────────────────────────────────────────────────────── */
export default function EvaluationPage() {
  const total =
    confusionMatrix.tp +
    confusionMatrix.fp +
    confusionMatrix.fn +
    confusionMatrix.tn;

  // Determine Y-axis domain for per-domain chart
  const minDomainAccuracy = Math.min(...domainData.map((d) => d.accuracy));
  const domainYMin = Math.max(0, Math.floor(minDomainAccuracy / 10) * 10);

  // Determine X-axis domain for ablation chart
  const minAblationF1 = Math.min(...ablationData.map((d) => d.f1));
  const ablationXMin = Math.max(0, Math.floor(minAblationF1 / 10) * 10);

  return (
    <main className="min-h-screen bg-base">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16 page-top-offset">
        {/* Header */}
        <h1 className="text-3xl font-display text-secondary mb-2">
          Evaluation Results
        </h1>
        <p className="text-secondary/50 text-sm mb-8">
          {totalSamples}-sample benchmark across {domainData.length}+ categories
          -- real metrics computed from methodD statistical analysis
        </p>

        {/* ── ROC Curve (full width) ── */}
        <div className="mb-6">
          <ChartCard
            title="ROC Curve"
            subtitle={`Receiver Operating Characteristic -- AUC = ${aucRoc.toFixed(3)}`}
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
                  domain={[domainYMin, 100]}
                  tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip content={<DomainTooltip />} />
                <ReferenceLine
                  y={overallAccuracy}
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
            subtitle="Full signal vs. individual sub-signal F1 scores"
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
                  domain={[ablationXMin, 100]}
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

        {/* ── Footer note ── */}
        <p className="text-xs text-secondary/40 text-center mt-4">
          Evaluation performed on a curated {totalSamples}-sample benchmark
          spanning {domainData.length} content domains. All metrics computed from
          real methodD statistical analysis with threshold optimized via
          Youden&apos;s J statistic. AUC computed via trapezoidal integration.
        </p>
      </div>
    </main>
  );
}
