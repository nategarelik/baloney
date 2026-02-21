"use client";

interface TrustScoreGaugeProps {
  score: number; // 0–1
}

const CIRCUMFERENCE = 2 * Math.PI * 60; // ~376.99

function getColor(score: number): string {
  if (score > 0.7) return "#16a34a";
  if (score > 0.4) return "#f59e0b";
  return "#d4456b";
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
          stroke="rgba(74,55,40,0.08)"
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
          className="fill-secondary font-bold"
          style={{ fontSize: "28px", fontWeight: 700 }}
        >
          {Math.round(score * 100)}
        </text>
        <text
          x="70"
          y="86"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: "11px", fill: "rgba(74,55,40,0.5)" }}
        >
          / 100
        </text>
      </svg>
      <p className="text-secondary/50 text-sm">Trust Score</p>
    </div>
  );
}
