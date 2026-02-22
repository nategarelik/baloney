"use client";

import { useMemo } from "react";

interface EditMagnitudeGaugeProps {
  magnitude: number;
  className?: string;
}

function getMagnitudeLabel(magnitude: number): string {
  if (magnitude < 0.15) return "Minimal";
  if (magnitude < 0.35) return "Light";
  if (magnitude < 0.55) return "Moderate";
  if (magnitude < 0.75) return "Heavy";
  return "Extensive";
}

function getMagnitudeColor(magnitude: number): string {
  if (magnitude < 0.2) return "#16a34a";
  if (magnitude < 0.4) return "#84cc16";
  if (magnitude < 0.6) return "#f59e0b";
  if (magnitude < 0.8) return "#f97316";
  return "#d4456b";
}

export function EditMagnitudeGauge({
  magnitude,
  className,
}: EditMagnitudeGaugeProps) {
  const clamped = Math.max(0, Math.min(1, magnitude));

  const label = useMemo(() => getMagnitudeLabel(clamped), [clamped]);
  const color = useMemo(() => getMagnitudeColor(clamped), [clamped]);

  const cx = 60;
  const cy = 58;
  const r = 44;
  const strokeWidth = 8;

  // Half circumference for a 180-degree arc
  const halfCircumference = Math.PI * r;
  const fillLength = clamped * halfCircumference;
  const gapLength = halfCircumference - fillLength;

  // Arc path: semi-circle from left to right
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  const gradientId = "editMagnitudeGradient";

  return (
    <div
      className={className}
      aria-label={`Edit magnitude: ${label} (${Math.round(clamped * 100)}%)`}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={1}
    >
      <svg
        viewBox="0 0 120 70"
        width={120}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d4456b" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={arcPath}
          stroke="currentColor"
          className="text-secondary/8"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />

        {/* Fill */}
        <path
          d={arcPath}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${fillLength} ${gapLength}`}
          style={{
            transition: "stroke-dasharray 0.4s ease-out",
          }}
        />

        {/* Indicator dot at the end of the fill */}
        {clamped > 0 && (
          <circle
            cx={
              cx +
              r * Math.cos(Math.PI - clamped * Math.PI)
            }
            cy={
              cy -
              r * Math.sin(Math.PI - clamped * Math.PI)
            }
            r={4}
            fill={color}
            style={{
              transition: "cx 0.4s ease-out, cy 0.4s ease-out, fill 0.4s ease-out",
            }}
          />
        )}

        {/* Center label */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={14}
          fontWeight={600}
          fill={color}
          style={{
            transition: "fill 0.4s ease-out",
          }}
        >
          {label}
        </text>
      </svg>

      <p className="text-secondary/50 text-xs text-center -mt-1">
        Edit Magnitude
      </p>
    </div>
  );
}
