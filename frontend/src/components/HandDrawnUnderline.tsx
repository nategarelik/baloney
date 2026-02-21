"use client";

interface HandDrawnUnderlineProps {
  width?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  animate?: boolean;
}

/**
 * A wobbly SVG underline that looks hand-drawn.
 * Used sparingly as an accent — active tab indicators, emphasis.
 */
export function HandDrawnUnderline({
  width = 80,
  color = "#d4456b",
  strokeWidth = 2.5,
  className = "",
  animate = true,
}: HandDrawnUnderlineProps) {
  // Wobbly path that looks hand-drawn — slightly different each render width
  const pathD = `M2 8 C${width * 0.15} 3, ${width * 0.3} 12, ${width * 0.5} 7 S${width * 0.75} 2, ${width - 2} 9`;
  const pathLength = width * 1.2;

  return (
    <svg
      width={width}
      height={14}
      viewBox={`0 0 ${width} 14`}
      fill="none"
      className={className}
      style={{ "--path-length": pathLength } as React.CSSProperties}
    >
      <path
        d={pathD}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={animate ? pathLength : undefined}
        strokeDashoffset={animate ? 0 : undefined}
        className={animate ? "animate-draw-on" : undefined}
      />
    </svg>
  );
}
