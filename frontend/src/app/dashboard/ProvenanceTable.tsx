"use client";

import { useState, useEffect } from "react";
import type { ContentProvenance } from "@/lib/types";

const VERDICT_BADGE: Record<string, string> = {
  ai_generated: "bg-red-600/80 text-red-100",
  heavy_edit: "bg-orange-600/80 text-orange-100",
  light_edit: "bg-amber-600/80 text-amber-100",
  human: "bg-green-600/80 text-green-100",
};

export function ProvenanceTable() {
  const [entries, setEntries] = useState<ContentProvenance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/provenance?limit=10")
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-navy-light rounded-xl p-6 border border-navy-lighter animate-pulse">
        <div className="h-6 bg-navy-lighter rounded w-48 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-navy-lighter rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-navy-light rounded-xl p-6 border border-navy-lighter">
        <h3 className="text-lg font-semibold text-white mb-2">Content Provenance</h3>
        <p className="text-slate-400 text-sm">No crowd-sourced verification data yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-navy-light rounded-xl p-6 border border-navy-lighter">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Content Provenance</h3>
        <span className="text-xs text-slate-500">Crowd-Sourced Truth</span>
      </div>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.content_hash}
            className="bg-[#0f1a2e] rounded-lg p-3 border border-navy-lighter flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-500">
                  {entry.content_hash.slice(0, 12)}...
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${VERDICT_BADGE[entry.compound_verdict] ?? "bg-slate-600/80 text-slate-200"}`}>
                  {entry.compound_verdict === "ai_generated" ? "AI" : entry.compound_verdict === "heavy_edit" ? "Heavy Edit" : entry.compound_verdict === "light_edit" ? "Light Edit" : "Human"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{entry.sighting_count} sightings</span>
                <span>{Math.round(entry.compound_score)}% AI confidence</span>
                <span className="flex gap-1">
                  {(entry.platforms ?? []).map((p) => (
                    <span key={p} className="bg-navy-lighter px-1.5 py-0.5 rounded text-[10px] capitalize">
                      {p === "x" ? "𝕏" : p.replace("_", " ")}
                    </span>
                  ))}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-slate-500">
                {entry.ai_votes}ai / {entry.human_votes}h
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
