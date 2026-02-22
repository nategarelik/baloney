import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-base-dark rounded-xl border border-secondary/10 p-5",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-accent" />
        <span className="text-xs text-secondary/50 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-3xl font-bold text-secondary">{value}</div>
      {subtext && <p className="text-xs text-secondary/50 mt-1">{subtext}</p>}
      {trend && (
        <div
          className={cn(
            "text-xs mt-2 font-medium",
            trend.value >= 0 ? "text-green-400" : "text-red-400",
          )}
        >
          {trend.value >= 0 ? "+" : ""}
          {trend.value}% {trend.label}
        </div>
      )}
    </div>
  );
}
