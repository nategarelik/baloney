import { cn } from "@/lib/cn";
import { Skeleton } from "./Skeleton";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  loading = false,
  children,
  className,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "bg-base-dark rounded-xl border border-secondary/10 p-5",
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-secondary">{title}</h3>
        {subtitle && (
          <p className="text-xs text-secondary/50 mt-0.5">{subtitle}</p>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
