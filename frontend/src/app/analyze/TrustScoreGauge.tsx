"use client";

interface TrustScoreGaugeProps {
  score: number; // 0–1
}

const CIRCUMFERENCE = 2 * Math.PI * 60; // ~376.99

function getColor(score: number): string {
  if (score > 0.7) return "#22c55e";
  if (score > 0.4) return "#f59e0b";
  return "#ef4444";
}

export function TrustScoreGauge({ score }: TrustScoreGaugeProps) {
  const filled = score * CIRCUMFERENCE;
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 140 140" className="w-36 h-36" aria-label={`Trust score: ${Math.round(score * 100)}%`}>
        {/* Track */}
        <circle
          cx="70"
          cy="70"
          r="60"
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="10"
        />
        {/* Progress — rotated so it starts at top */}
        <circle
          cx="70"
          cy="70"
          r="60"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
          strokeDashoffset={CIRCUMFERENCE * 0.25}
          style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.3s ease" }}
        />
        <text
          x="70"
          y="66"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white font-bold"
          style={{ fontSize: "28px", fontWeight: 700 }}
        >
          {Math.round(score * 100)}
        </text>
        <text
          x="70"
          y="86"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: "11px", fill: "#94a3b8" }}
        >
          / 100
        </text>
      </svg>
      <p className="text-slate-400 text-sm">Trust Score</p>
    </div>
  );
}
