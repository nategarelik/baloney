"use client";

interface MadDataWinnerProps {
  variant?: "badge" | "banner";
  className?: string;
}

export function MadDataWinner({
  variant = "badge",
  className = "",
}: MadDataWinnerProps) {
  if (variant === "banner") {
    return (
      <p
        className={`text-sm font-medium tracking-wide uppercase text-secondary/70 ${className}`}
        style={{ letterSpacing: "0.08em" }}
      >
        1st Place — MAD Data 2026
      </p>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-secondary/60 ${className}`}
      style={{
        background: "rgba(74, 55, 40, 0.06)",
        border: "1px solid rgba(74, 55, 40, 0.1)",
      }}
    >
      1st Place MAD Data 2026
    </span>
  );
}
