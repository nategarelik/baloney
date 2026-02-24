"use client";

import { BarChart3, Bot, Percent, ScanSearch, ArrowRight } from "lucide-react";
import Link from "next/link";

export function EmptyDashboard() {
  const placeholderStats = [
    { icon: BarChart3, label: "Total Scans" },
    { icon: Bot, label: "AI Detected" },
    { icon: Percent, label: "AI Rate" },
    { icon: ScanSearch, label: "Avg Confidence" },
  ];

  return (
    <div className="space-y-6">
      {/* Placeholder stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {placeholderStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-base-dark rounded-xl border border-secondary/10 p-5 flex items-center gap-4 opacity-40"
          >
            <div className="p-2.5 rounded-lg bg-secondary/5">
              <stat.icon className="h-5 w-5 text-secondary/50" />
            </div>
            <div>
              <p className="text-xs text-secondary/50 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-display text-secondary">—</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder chart area */}
      <div className="bg-base-dark rounded-xl border border-secondary/10 p-5 opacity-40">
        <div className="h-48 rounded-lg bg-secondary/5" />
      </div>

      {/* CWS message card */}
      <div className="bg-base-dark rounded-xl border border-secondary/10 p-8 text-center">
        <p className="text-secondary/70 text-sm leading-relaxed max-w-lg mx-auto">
          Our Chrome extension is currently under review for Chrome Web Store
          submission. Check back soon to see your personal AI detection
          analytics here.
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
        >
          Try the web analyzer in the meantime
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Placeholder table area */}
      <div className="bg-base-dark rounded-xl border border-secondary/10 p-5 opacity-40">
        <div className="h-32 rounded-lg bg-secondary/5" />
      </div>
    </div>
  );
}
