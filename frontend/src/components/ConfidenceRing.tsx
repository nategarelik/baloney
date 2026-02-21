"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface ConfidenceRingProps {
  value: number; // 0-1
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

function getColor(value: number): string {
  if (value >= 0.7) return "#22c55e"; // green
  if (value >= 0.4) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function ConfidenceRing({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  className,
}: ConfidenceRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    circle.style.strokeDashoffset = String(circumference);
    requestAnimationFrame(() => {
      circle.style.transition = "stroke-dashoffset 1s ease-out";
      circle.style.strokeDashoffset = String(offset);
    });
  }, [circumference, offset]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e3a5f"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">
          {Math.round(value * 100)}%
        </span>
        {label && (
          <span className="text-xs text-slate-400 mt-0.5">{label}</span>
        )}
      </div>
    </div>
  );
}
