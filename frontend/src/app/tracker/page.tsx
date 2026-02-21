"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { HandDrawnUnderline } from "@/components/HandDrawnUnderline";
import { TrackerChart } from "./TrackerChart";

const PLATFORMS = [
  { id: "x", label: "X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "substack", label: "Substack" },
] as const;

const CONTENT_TYPES = [
  {
    id: "text",
    label: "Text Detection",
    footnote: "Placeholder: context about text detection data will go here.",
  },
  {
    id: "image",
    label: "Image Detection",
    footnote: "Placeholder: context about image detection data will go here.",
  },
  {
    id: "video",
    label: "Video Detection",
    footnote: "Placeholder: context about video detection data will go here.",
  },
] as const;

export default function TrackerPage() {
  const [activePlatform, setActivePlatform] = useState<string>(PLATFORMS[0].id);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  function toggleSection(contentType: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(contentType)) {
        next.delete(contentType);
      } else {
        next.add(contentType);
      }
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-base">
      <div className="max-w-4xl mx-auto px-6 py-12 page-top-offset">
        <h1 className="font-display text-4xl text-secondary mb-8">
          AI Tracker
        </h1>

        {/* Platform Tabs */}
        <div className="flex gap-8 mb-10">
          {PLATFORMS.map((p) => {
            const isActive = activePlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={cn(
                  "relative text-lg font-medium pb-2 transition-opacity",
                  isActive
                    ? "text-secondary opacity-100"
                    : "text-secondary/50 hover:text-secondary/70",
                )}
              >
                {p.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 flex justify-center">
                    <HandDrawnUnderline width={p.label.length * 10} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Detection Type Dropdowns */}
        <div className="space-y-4">
          {CONTENT_TYPES.map((ct) => {
            const isOpen = openSections.has(ct.id);
            return (
              <div
                key={ct.id}
                className="border border-secondary/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(ct.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-secondary/[0.03] transition-colors"
                >
                  <span className="font-semibold text-secondary">
                    {ct.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-secondary/40 transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6">
                    <TrackerChart
                      platform={activePlatform}
                      contentType={ct.id}
                      footnote={ct.footnote}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
