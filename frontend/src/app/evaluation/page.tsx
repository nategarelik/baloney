"use client";
import { useState } from "react";
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
  Legend,
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
  pangramValidationData,
} from "@/lib/evaluation-data";
import {
  ensembleComparison,
  ensembleLengthData,
  ensembleModelDifficulty,
  ensemblePlatformProfiles,
  ensembleFeatureImportance,
  ensembleClaudeEvasion,
  ensembleConfusionMatrices,
  ensembleOptimalWeights,
  ensembleHonestCaveats,
} from "@/lib/ensemble-evaluation-data";

/* -------------------------------------------------------
   Ensemble purple color constant
   ------------------------------------------------------- */
const ENSEMBLE_PURPLE = "#8b5cf6";

/* -------------------------------------------------------
   Helper: bar color based on accuracy
   ------------------------------------------------------- */
function getDomainBarColor(accuracy: number): string {
  if (accuracy >= 97) return "#16a34a";
  if (accuracy >= 94) return "#22c55e";
  if (accuracy >= 91) return "#f59e0b";
  return "#d4456b";
}

/* -------------------------------------------------------
   Custom Tooltip Components -- Statistical Analysis Tab
   ------------------------------------------------------- */
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

/* -------------------------------------------------------
   Custom Tooltip Components -- Pangram Validation Tab
   ------------------------------------------------------- */
function PangramRocTooltip({ active, payload }: CustomTooltipProps) {
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

function ModelTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const n = entry.payload?.n;
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
      <p>Detection Rate: {Number(entry.value).toFixed(1)}%</p>
      {n !== undefined && <p className="text-xs opacity-70">n = {n}</p>}
    </div>
  );
}

function PlatformTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const n = entry.payload?.n;
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
      <p>Detection Rate: {Number(entry.value).toFixed(1)}%</p>
      {n !== undefined && <p className="text-xs opacity-70">n = {n}</p>}
    </div>
  );
}

function ConfidenceTooltip({ active, payload, label }: CustomTooltipProps) {
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
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

/* -------------------------------------------------------
   Custom Tooltip Components -- Ensemble Tab
   ------------------------------------------------------- */
function EnsembleModelTooltip({ active, payload, label }: CustomTooltipProps) {
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
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toFixed(1)}%
        </p>
      ))}
    </div>
  );
}

function EnsembleLengthTooltip({ active, payload, label }: CustomTooltipProps) {
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
      <p className="font-medium">{label} chars</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toFixed(1)}%
        </p>
      ))}
    </div>
  );
}

function FeatureTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  // Find the original feature data for AUC display
  const featureRow = ensembleFeatureImportance.find((f) => f.feature === label);
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
      <p>|Cohen&apos;s d|: {Number(entry.value).toFixed(3)}</p>
      {featureRow && <p>AUC: {featureRow.auc.toFixed(3)}</p>}
    </div>
  );
}

/* -------------------------------------------------------
   Tab type
   ------------------------------------------------------- */
type TabId = "statistical" | "ensemble" | "pangram";

/* -------------------------------------------------------
   Confusion Matrix mini-component (reusable)
   ------------------------------------------------------- */
function ConfusionMatrixCard({
  title,
  subtitle,
  tp,
  fp,
  fn,
  tn,
}: {
  title: string;
  subtitle: string;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}) {
  const total = tp + fp + fn + tn;
  return (
    <div className="bg-base-dark rounded-xl border border-secondary/10 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-secondary">{title}</h3>
        <p className="text-xs text-secondary/50 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex flex-col items-center">
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
                  {tp}
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
                  {fn}
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
                  {fp}
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
                  {tn}
                </span>
                <span className="text-[10px] text-green-700 font-medium uppercase tracking-wider">
                  TN
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-secondary/50 mt-3">
          Overall accuracy:{" "}
          <span className="font-semibold text-secondary">
            {total > 0
              ? (((tp + tn) / total) * 100).toFixed(1)
              : "0.0"}
            %
          </span>
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Main Page Component
   ------------------------------------------------------- */
export default function EvaluationPage() {
  const [activeTab, setActiveTab] = useState<TabId>("statistical");

  // Statistical Analysis tab data
  const total =
    confusionMatrix.tp +
    confusionMatrix.fp +
    confusionMatrix.fn +
    confusionMatrix.tn;

  const minDomainAccuracy = Math.min(...domainData.map((d) => d.accuracy));
  const domainYMin = Math.max(0, Math.floor(minDomainAccuracy / 10) * 10);

  const minAblationF1 = Math.min(...ablationData.map((d) => d.f1));
  const ablationXMin = Math.max(0, Math.floor(minAblationF1 / 10) * 10);

  // Pangram Validation tab data
  const pgData = pangramValidationData;
  const pgTotal =
    pgData.confusionMatrix.tp +
    pgData.confusionMatrix.fp +
    pgData.confusionMatrix.fn +
    pgData.confusionMatrix.tn;

  const minModelDetection = Math.min(
    ...pgData.perModelAccuracy.map((d) => d.detection_rate),
  );
  const modelXMin = Math.max(0, Math.floor(minModelDetection) - 2);

  const minPlatformDetection = Math.min(
    ...pgData.perPlatformAccuracy.map((d) => d.detection_rate),
  );
  const platformXMin = Math.max(0, Math.floor(minPlatformDetection) - 2);

  // Tab definitions
  const tabs: { id: TabId; label: string }[] = [
    { id: "statistical", label: "Statistical Analysis" },
    { id: "ensemble", label: "Cross-Model Ensemble" },
    { id: "pangram", label: "Pangram Validation" },
  ];

  return (
    <main className="min-h-screen bg-base">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16 page-top-offset">
        {/* Header */}
        <h1 className="text-3xl font-display text-secondary mb-2">
          Evaluation Results
        </h1>
        <p className="text-secondary/50 text-sm mb-6">
          {totalSamples}-sample benchmark across {domainData.length}+ categories
          -- real metrics computed from methodD statistical analysis
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-secondary/5 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-base-dark text-secondary shadow-sm"
                  : "text-secondary/50 hover:text-secondary/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ======================================================
            TAB: Statistical Analysis (existing content)
            ====================================================== */}
        {activeTab === "statistical" && (
          <>
            {/* -- ROC Curve (full width) -- */}
            <div className="mb-6">
              <ChartCard
                title="ROC Curve"
                subtitle={`Receiver Operating Characteristic -- AUC = ${aucRoc.toFixed(3)}`}
              >
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart
                    margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
                  >
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

            {/* -- 2-column grid -- */}
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
                          style={{
                            backgroundColor: "rgba(212, 69, 107, 0.15)",
                          }}
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
                          style={{
                            backgroundColor: "rgba(212, 69, 107, 0.15)",
                          }}
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

            {/* -- Per-Domain Accuracy + Ablation Study -- */}
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

            {/* -- Footer note -- */}
            <p className="text-xs text-secondary/40 text-center mt-4">
              Evaluation performed on a curated {totalSamples}-sample benchmark
              spanning {domainData.length} content domains. All metrics computed
              from real methodD statistical analysis with threshold optimized
              via Youden&apos;s J statistic. AUC computed via trapezoidal
              integration.
            </p>
          </>
        )}

        {/* ======================================================
            TAB: Cross-Model Ensemble
            ====================================================== */}
        {activeTab === "ensemble" && (
          <>
            {/* -- (a) Side-by-side Metrics Summary -- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-base-dark rounded-xl border border-secondary/10 p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-secondary">
                    Pangram-Only Metrics
                  </h3>
                  <p className="text-xs text-secondary/50 mt-0.5">
                    Single-method baseline at threshold 0.5
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary/10">
                      <th className="pb-2.5 text-left text-xs text-secondary/50 font-medium uppercase tracking-wider">
                        Metric
                      </th>
                      <th className="pb-2.5 text-right text-xs text-secondary/50 font-medium uppercase tracking-wider">
                        Pangram
                      </th>
                      <th className="pb-2.5 text-right text-xs text-secondary/50 font-medium uppercase tracking-wider">
                        Ensemble
                      </th>
                      <th className="pb-2.5 text-right text-xs text-secondary/50 font-medium uppercase tracking-wider">
                        Delta
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ensembleComparison.map((row, i) => (
                      <tr
                        key={row.metric}
                        className={
                          i < ensembleComparison.length - 1
                            ? "border-b border-secondary/5"
                            : ""
                        }
                      >
                        <td className="py-2.5 text-secondary/70 font-medium">
                          {row.metric}
                        </td>
                        <td className="py-2.5 text-right font-display text-secondary text-base">
                          {row.pangram_only}%
                        </td>
                        <td className="py-2.5 text-right font-display text-base" style={{ color: ENSEMBLE_PURPLE }}>
                          {row.ensemble}%
                        </td>
                        <td className={`py-2.5 text-right text-sm font-medium ${row.delta >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {row.delta >= 0 ? "+" : ""}{row.delta}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ensemble Key Takeaway */}
              <div className="bg-base-dark rounded-xl border border-secondary/10 p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-secondary">
                    Key Takeaway
                  </h3>
                  <p className="text-xs text-secondary/50 mt-0.5">
                    Pangram vs Ensemble trade-offs
                  </p>
                </div>
                <div className="space-y-3 text-sm text-secondary/70">
                  <p>
                    The ensemble dramatically reduces false positives (FPR 90%
                    to 2.5%) at the cost of recall (94.1% to 7.2%).
                  </p>
                  <p>
                    Pangram alone flags almost everything as AI (high recall,
                    terrible specificity). The ensemble is extremely conservative
                    -- it barely flags anything, but when it does, it is usually
                    right (precision 76.9%).
                  </p>
                  <p className="text-xs text-secondary/40 mt-4">
                    Neither configuration is production-ready at threshold 0.5.
                    Pangram needs threshold tuning; ensemble needs weight
                    optimization on a larger dataset.
                  </p>
                </div>
              </div>
            </div>

            {/* -- (b) Side-by-side Confusion Matrices -- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {ensembleConfusionMatrices.map((cm) => (
                <ConfusionMatrixCard
                  key={cm.label}
                  title={`Confusion Matrix: ${cm.label.includes("Pangram") ? "Pangram-only" : "Ensemble"}`}
                  subtitle={`${cm.tp + cm.fp + cm.fn + cm.tn} samples -- ${cm.label}`}
                  tp={cm.tp}
                  fp={cm.fp}
                  fn={cm.fn}
                  tn={cm.tn}
                />
              ))}
            </div>

            {/* -- (c) Grouped Bar Chart: Per-Model Detection Rates -- */}
            <div className="mb-6">
              <ChartCard
                title="Per-Model Detection Rates"
                subtitle="Pangram-only vs Ensemble detection rate by AI source model"
              >
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart
                    data={ensembleModelDifficulty}
                    layout="vertical"
                    margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_COLORS.gridLine}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <YAxis
                      dataKey="model"
                      type="category"
                      width={70}
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                    />
                    <Tooltip content={<EnsembleModelTooltip />} />
                    <Legend
                      wrapperStyle={{
                        fontSize: 11,
                        color: CHART_COLORS.axisLabel,
                      }}
                    />
                    <Bar
                      dataKey="pangram_det"
                      name="Pangram"
                      fill={CHART_COLORS.ai}
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="ensemble_det"
                      name="Ensemble"
                      fill={ENSEMBLE_PURPLE}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* -- (d) Line Chart: Text Length vs Accuracy -- */}
            <div className="mb-6">
              <ChartCard
                title="Text Length vs Accuracy"
                subtitle="Detection accuracy across text length buckets (character count)"
              >
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={ensembleLengthData}
                    margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_COLORS.gridLine}
                    />
                    <XAxis
                      dataKey="bucket"
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                      label={{
                        value: "Text Length (chars)",
                        position: "insideBottom",
                        offset: -2,
                        fill: CHART_COLORS.axisLabel,
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                      tickFormatter={(v: number) => `${v}%`}
                      label={{
                        value: "Accuracy",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        fill: CHART_COLORS.axisLabel,
                        fontSize: 12,
                      }}
                    />
                    <Tooltip content={<EnsembleLengthTooltip />} />
                    <Legend
                      wrapperStyle={{
                        fontSize: 11,
                        color: CHART_COLORS.axisLabel,
                      }}
                    />
                    <Line
                      dataKey="pangram_accuracy"
                      name="Pangram Accuracy"
                      stroke={CHART_COLORS.ai}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: CHART_COLORS.ai, stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      dataKey="ensemble_accuracy"
                      name="Ensemble Accuracy"
                      stroke={ENSEMBLE_PURPLE}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: ENSEMBLE_PURPLE, stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* -- (e) Horizontal Bar Chart: Feature Importance -- */}
            <div className="mb-6">
              <ChartCard
                title="Feature Importance (Cohen's d)"
                subtitle="Absolute Cohen's d effect size per statistical feature -- positive (pink) = higher in AI, negative (purple) = higher in human"
              >
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart
                    data={ensembleFeatureImportance}
                    layout="vertical"
                    margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_COLORS.gridLine}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 1]}
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="feature"
                      type="category"
                      width={140}
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 10 }}
                    />
                    <Tooltip content={<FeatureTooltip />} />
                    <Bar dataKey="abs_d" radius={[0, 4, 4, 0]}>
                      {ensembleFeatureImportance.map((entry) => (
                        <Cell
                          key={entry.feature}
                          fill={entry.cohens_d >= 0 ? CHART_COLORS.ai : ENSEMBLE_PURPLE}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* -- Platform Profiles -- */}
            <div className="mb-6">
              <ChartCard
                title="Platform Profiles"
                subtitle="Pangram vs Ensemble accuracy by content platform"
              >
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={ensemblePlatformProfiles}
                    layout="vertical"
                    margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_COLORS.gridLine}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <YAxis
                      dataKey="platform"
                      type="category"
                      width={70}
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                    />
                    <Tooltip content={<EnsembleModelTooltip />} />
                    <Legend
                      wrapperStyle={{
                        fontSize: 11,
                        color: CHART_COLORS.axisLabel,
                      }}
                    />
                    <Bar
                      dataKey="pangram_acc"
                      name="Pangram Acc"
                      fill={CHART_COLORS.ai}
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="ensemble_acc"
                      name="Ensemble Acc"
                      fill={ENSEMBLE_PURPLE}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* -- (f) Claude Evasion Callout Card -- */}
            <div className="bg-base-dark rounded-xl border border-secondary/10 p-5 mb-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-secondary">
                  Claude Evasion Analysis
                </h3>
                <p className="text-xs text-secondary/50 mt-0.5">
                  Claude-generated short-form social media content represents the hardest detection challenge
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-secondary/5 rounded-lg p-3 text-center">
                  <p className="text-2xl font-display text-secondary">
                    {ensembleClaudeEvasion.total_claude_ai_samples}
                  </p>
                  <p className="text-xs text-secondary/50 mt-1">
                    Claude samples tested
                  </p>
                </div>
                <div className="bg-secondary/5 rounded-lg p-3 text-center">
                  <p className="text-2xl font-display" style={{ color: CHART_COLORS.ai }}>
                    {ensembleClaudeEvasion.pangram_evasion_rate}%
                  </p>
                  <p className="text-xs text-secondary/50 mt-1">
                    Evade Pangram
                  </p>
                </div>
                <div className="bg-secondary/5 rounded-lg p-3 text-center">
                  <p className="text-2xl font-display" style={{ color: ENSEMBLE_PURPLE }}>
                    {ensembleClaudeEvasion.ensemble_recovery_rate}%
                  </p>
                  <p className="text-xs text-secondary/50 mt-1">
                    Recovered by ensemble
                  </p>
                </div>
              </div>
              {/* Evasion samples */}
              <div className="space-y-2">
                <p className="text-xs text-secondary/50 font-medium uppercase tracking-wider">
                  Key Evasion Samples
                </p>
                {ensembleClaudeEvasion.key_evasion_samples.map((sample) => (
                  <div
                    key={sample.id}
                    className="bg-secondary/5 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-xs text-secondary/50 font-mono">
                        {sample.id}
                      </code>
                      <span className="text-xs text-secondary/50">
                        {sample.length} chars
                      </span>
                    </div>
                    <p className="text-sm text-secondary/70 italic mb-2">
                      &quot;{sample.preview}&quot;
                    </p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-secondary/50">
                        Pangram:{" "}
                        <span className="font-medium text-secondary">
                          {sample.pangram.toFixed(3)}
                        </span>
                      </span>
                      <span className="text-secondary/50">
                        Ensemble:{" "}
                        <span className="font-medium" style={{ color: ENSEMBLE_PURPLE }}>
                          {sample.ensemble.toFixed(3)}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* -- (g) Optimal Weights Card -- */}
            <div className="bg-base-dark rounded-xl border border-secondary/10 p-5 mb-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-secondary">
                  Optimal Ensemble Weights (Grid Search)
                </h3>
                <p className="text-xs text-secondary/50 mt-0.5">
                  Best F1 found: {ensembleOptimalWeights.optimal_f1}%
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(ensembleOptimalWeights.weights).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="bg-secondary/5 rounded-lg px-4 py-3 text-center"
                    >
                      <p className="text-lg font-display text-secondary">
                        {(value * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-secondary/50 mt-0.5 capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* -- (h) Honest Caveats -- */}
            <div className="bg-base-dark rounded-xl border border-secondary/10 p-5 mb-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-secondary">
                  Honest Caveats
                </h3>
                <p className="text-xs text-secondary/50 mt-0.5">
                  Known limitations and disclaimers for this evaluation
                </p>
              </div>
              <ul className="space-y-2">
                {ensembleHonestCaveats.map((caveat, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-secondary/70"
                  >
                    <span className="text-secondary/30 mt-0.5 shrink-0">
                      &#8226;
                    </span>
                    <span>{caveat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* -- Footer note -- */}
            <p className="text-xs text-secondary/40 text-center mt-4">
              Cross-model ensemble evaluation on 54-236 samples across 6 AI
              models and 4 platforms. Ensemble weights from grid search
              (pangram=0.55, roberta=0.1, chatgpt_det=0.25, embeddings=0.05,
              statistical=0.05). All metrics at threshold 0.5.
            </p>
          </>
        )}

        {/* ======================================================
            TAB: Pangram Validation
            ====================================================== */}
        {activeTab === "pangram" && (
          <>
            {/* -- Placeholder / Synthetic Warning -- */}
            {pgData.isPlaceholder && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-amber-600 text-lg">&#9888;</span>
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">
                      Placeholder Data
                    </p>
                    <p className="text-amber-700 text-xs mt-1">
                      These results are hardcoded placeholders, not from real
                      Pangram API detection. Run the validation pipeline to
                      populate with real data:
                    </p>
                    <code className="block bg-amber-100 rounded px-2 py-1 mt-2 text-xs text-amber-900 font-mono">
                      npx tsx scripts/validation-pipeline.ts
                    </code>
                  </div>
                </div>
              </div>
            )}
            {pgData.isSynthetic && !pgData.isPlaceholder && (
              <div className="bg-orange-50 border border-orange-300 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-orange-600 text-lg">&#9888;</span>
                  <div>
                    <p className="font-semibold text-orange-800 text-sm">
                      Synthetic Data
                    </p>
                    <p className="text-orange-700 text-xs mt-1">
                      These results use randomly generated scores, not real
                      Pangram API detection. Re-run with PANGRAM_API_KEY set for
                      real results.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* -- Header -- */}
            <div className="bg-base-dark rounded-xl border border-secondary/10 p-5 mb-6">
              <h2 className="text-lg font-display text-secondary mb-1">
                Pangram Validation Results
              </h2>
              <p className="text-secondary/50 text-sm mb-3">
                Pangram v3 primary-only detection, no ensemble dilution
              </p>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-secondary/50 uppercase tracking-wider font-medium">
                    Total Samples
                  </p>
                  <p className="text-2xl font-display text-secondary">
                    {pgData.totalSamples}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary/50 uppercase tracking-wider font-medium">
                    AI Samples
                  </p>
                  <p className="text-2xl font-display text-secondary">
                    {pgData.aiSamples}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary/50 uppercase tracking-wider font-medium">
                    Human Samples
                  </p>
                  <p className="text-2xl font-display text-secondary">
                    {pgData.humanSamples}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary/50 uppercase tracking-wider font-medium">
                    AI / Human Split
                  </p>
                  <p className="text-2xl font-display text-secondary">
                    {((pgData.aiSamples / pgData.totalSamples) * 100).toFixed(
                      0,
                    )}
                    % /{" "}
                    {(
                      (pgData.humanSamples / pgData.totalSamples) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>
              </div>
            </div>

            {/* -- ROC Curve (full width) -- */}
            <div className="mb-6">
              <ChartCard
                title="ROC Curve -- Pangram"
                subtitle={`Receiver Operating Characteristic -- AUC = ${pgData.aucRoc.toFixed(4)}`}
              >
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart
                    margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
                  >
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
                    <Tooltip content={<PangramRocTooltip />} />
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
                      data={pgData.rocData}
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

            {/* -- 2-column grid: Confusion Matrix + Summary Stats -- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Confusion Matrix */}
              <div className="bg-base-dark rounded-xl border border-secondary/10 p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-secondary">
                    Confusion Matrix
                  </h3>
                  <p className="text-xs text-secondary/50 mt-0.5">
                    {pgTotal} total predictions (threshold ={" "}
                    {pgData.optimalThreshold.toFixed(2)})
                  </p>
                </div>
                <div className="flex flex-col items-center">
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
                            {pgData.confusionMatrix.tp}
                          </span>
                          <span className="text-[10px] text-green-700 font-medium uppercase tracking-wider">
                            TP
                          </span>
                        </div>
                        <div
                          className="w-28 h-20 rounded-lg flex flex-col items-center justify-center"
                          style={{
                            backgroundColor: "rgba(212, 69, 107, 0.15)",
                          }}
                        >
                          <span className="text-2xl font-display text-secondary">
                            {pgData.confusionMatrix.fn}
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
                          style={{
                            backgroundColor: "rgba(212, 69, 107, 0.15)",
                          }}
                        >
                          <span className="text-2xl font-display text-secondary">
                            {pgData.confusionMatrix.fp}
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
                            {pgData.confusionMatrix.tn}
                          </span>
                          <span className="text-[10px] text-green-700 font-medium uppercase tracking-wider">
                            TN
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-secondary/50 mt-3">
                    Overall accuracy:{" "}
                    <span className="font-semibold text-secondary">
                      {(
                        ((pgData.confusionMatrix.tp +
                          pgData.confusionMatrix.tn) /
                          pgTotal) *
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
                    Pangram standalone performance metrics
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
                    {pgData.summaryStats.map((stat, i) => (
                      <tr
                        key={stat.metric}
                        className={
                          i < pgData.summaryStats.length - 1
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

            {/* -- Per-Model + Per-Platform Detection Rate -- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Per-Model Detection Rate */}
              <ChartCard
                title="Per-Model Detection Rate"
                subtitle="AI detection rate by source model"
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={pgData.perModelAccuracy}
                    layout="vertical"
                    margin={{ top: 8, right: 24, bottom: 4, left: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_COLORS.gridLine}
                    />
                    <XAxis
                      type="number"
                      domain={[modelXMin, 100]}
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <YAxis
                      dataKey="model"
                      type="category"
                      width={80}
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                    />
                    <Tooltip content={<ModelTooltip />} />
                    <Bar
                      dataKey="detection_rate"
                      fill={CHART_COLORS.ai}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Per-Platform Detection Rate */}
              <ChartCard
                title="Per-Platform Detection Rate"
                subtitle="AI detection rate by content platform"
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={pgData.perPlatformAccuracy}
                    layout="vertical"
                    margin={{ top: 8, right: 24, bottom: 4, left: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_COLORS.gridLine}
                    />
                    <XAxis
                      type="number"
                      domain={[platformXMin, 100]}
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <YAxis
                      dataKey="platform"
                      type="category"
                      width={80}
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                    />
                    <Tooltip content={<PlatformTooltip />} />
                    <Bar
                      dataKey="detection_rate"
                      fill={CHART_COLORS.ai}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* -- Confidence Distribution (full width) -- */}
            <div className="mb-6">
              <ChartCard
                title="Confidence Score Distribution"
                subtitle="Distribution of Pangram confidence scores -- AI vs Human samples per bucket"
              >
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart
                    data={pgData.confidenceDistribution}
                    margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_COLORS.gridLine}
                    />
                    <XAxis
                      dataKey="bucket"
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 10 }}
                      label={{
                        value: "Confidence Score Bucket",
                        position: "insideBottom",
                        offset: -2,
                        fill: CHART_COLORS.axisLabel,
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      tick={{ fill: CHART_COLORS.axisLabel, fontSize: 11 }}
                      label={{
                        value: "Sample Count",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        fill: CHART_COLORS.axisLabel,
                        fontSize: 12,
                      }}
                    />
                    <Tooltip content={<ConfidenceTooltip />} />
                    <Legend
                      wrapperStyle={{
                        fontSize: 11,
                        color: CHART_COLORS.axisLabel,
                      }}
                    />
                    <Bar
                      dataKey="ai_count"
                      name="AI Samples"
                      fill={CHART_COLORS.ai}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="human_count"
                      name="Human Samples"
                      fill={CHART_COLORS.human}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* -- Footer note -- */}
            <p className="text-xs text-secondary/40 text-center mt-4">
              Validation performed using Pangram v3 API in primary-only mode (no
              ensemble dilution). {pgData.totalSamples} samples (
              {pgData.aiSamples} AI-generated, {pgData.humanSamples}{" "}
              human-written) across {pgData.perModelAccuracy.length} AI models
              and {pgData.perPlatformAccuracy.length} platforms. Optimal
              threshold selected via Youden&apos;s J statistic at{" "}
              {pgData.optimalThreshold.toFixed(2)}. AUC computed via trapezoidal
              integration.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
