"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const STORAGE_KEY = "baloney_cta_dismissed";

export function AccountCTA() {
  const { user, isLoading } = useAuth();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  if (isLoading || user || dismissed) return null;

  return (
    <div className="bg-base-dark rounded-xl border border-secondary/10 px-5 py-4 mb-6 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-secondary/70">
          Create a free account to track your personal AI exposure score, scan
          history, and analytics.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/signup"
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary/90 btn-primary-3d whitespace-nowrap"
        >
          Sign up free
        </Link>
        <button
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "true");
            setDismissed(true);
          }}
          className="p-1 text-secondary/40 hover:text-secondary/70 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
