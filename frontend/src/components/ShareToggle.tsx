"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/cn";
import { toggleSharing, getSharingStatus } from "@/lib/api";

interface ShareToggleProps {
  initialEnabled?: boolean;
  className?: string;
}

export function ShareToggle({
  initialEnabled,
  className,
}: ShareToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled ?? false);
  const [loading, setLoading] = useState(initialEnabled === undefined);

  useEffect(() => {
    if (initialEnabled !== undefined) return;
    getSharingStatus()
      .then((data) => setEnabled(data.sharing_enabled))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialEnabled]);

  async function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    try {
      await toggleSharing(next);
    } catch {
      setEnabled(!next); // revert on failure
    }
  }

  return (
    <div
      className={cn(
        "bg-base-dark rounded-xl border border-secondary/10 p-5 max-w-lg mx-auto",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <Shield className="h-5 w-5 text-accent mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-secondary">
              Community Sharing
            </span>
            <button
              onClick={handleToggle}
              disabled={loading}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                enabled ? "bg-accent" : "bg-secondary/15",
              )}
              aria-label="Toggle community sharing"
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                  enabled ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>
          <p className="text-xs text-secondary/50 leading-relaxed">
            Share my anonymized scan data with the Baloney community. We never
            share your identity, the content you viewed, or your browsing
            history &mdash; only detection verdicts and platform-level metadata.
          </p>
        </div>
      </div>
    </div>
  );
}
