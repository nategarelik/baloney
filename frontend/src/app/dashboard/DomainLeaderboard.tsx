"use client";

import type { DomainEntry } from "@/lib/types";

interface DomainLeaderboardProps {
  domains: DomainEntry[];
}

export function DomainLeaderboard({ domains }: DomainLeaderboardProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
            <th className="pb-3 pr-4">#</th>
            <th className="pb-3 pr-4">Domain</th>
            <th className="pb-3 pr-4">Scans</th>
            <th className="pb-3 pr-4">AI Count</th>
            <th className="pb-3">AI Rate</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((domain, i) => (
            <tr
              key={domain.source_domain}
              className={
                domain.ai_rate > 0.5
                  ? "bg-red-500/5"
                  : i % 2 === 0
                  ? "bg-navy-light/50"
                  : ""
              }
            >
              <td className="py-2.5 pr-4 text-slate-500">{i + 1}</td>
              <td className="py-2.5 pr-4 text-slate-300 font-mono text-xs">
                {domain.source_domain}
              </td>
              <td className="py-2.5 pr-4 text-slate-300">{domain.total}</td>
              <td className="py-2.5 pr-4 text-slate-300">{domain.ai_count}</td>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-navy-lighter rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(domain.ai_rate * 100)}%`,
                        backgroundColor: domain.ai_rate > 0.5 ? "#ef4444" : domain.ai_rate > 0.3 ? "#f59e0b" : "#22c55e",
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    {Math.round(domain.ai_rate * 100)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
