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
        "bg-navy-light rounded-xl border border-navy-lighter p-5",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
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
