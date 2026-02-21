"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedPercentageProps {
  value: number; // 0–1
  duration?: number; // ms
  className?: string;
  suffix?: string;
}

export function AnimatedPercentage({
  value,
  duration = 1500,
  className = "",
  suffix = "%",
}: AnimatedPercentageProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const target = Math.round(value * 100);
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
}
