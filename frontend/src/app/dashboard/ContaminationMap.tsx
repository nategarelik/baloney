"use client";

import { useEffect, useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { getCommunityTreemap } from "@/lib/api";
import { CHART_TOOLTIP_STYLE } from "@/lib/constants";
import type { TreemapEntry } from "@/lib/types";

// ──────────────────────────────────────────────
// Platform display label mapping
// ──────────────────────────────────────────────

function platformLabel(id: string): string {
  const labels: Record<string, string> = {
    x: "X",
    reddit: "Reddit",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    manual_upload: "Upload",
    demo_feed: "Demo",
    linkedin: "LinkedIn",
    substack: "Substack",
    medium: "Medium",
    threads: "Threads",
    bluesky: "Bluesky",
    mastodon: "Mastodon",
    hackernews: "HN",
    other: "Other",
  };
  return labels[id] ?? id;
}

// ──────────────────────────────────────────────
// Color interpolation by AI rate
// ──────────────────────────────────────────────

function getColor(rate: number): string {
  if (rate >= 80) return "#d4456b";
  if (rate >= 50) return "#f97316";
  if (rate >= 20) return "#f59e0b";
  return "#16a34a";
}

// ──────────────────────────────────────────────
// Custom tile renderer
// ──────────────────────────────────────────────

const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, ai_rate, platform } = props;
  if (width < 20 || height < 20) return null;

  const fillColor = getColor(ai_rate ?? 0);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillColor}
        fillOpacity={0.8}
        stroke="#f0e6ca"
        strokeWidth={2}
        rx={4}
      />
      {width > 50 && height > 35 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 7}
            textAnchor="middle"
            fill="white"
            fontSize={11}
            fontWeight={600}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 9}
            textAnchor="middle"
            fill="rgba(255,255,255,0.8)"
            fontSize={10}
          >
            {ai_rate}% AI
          </text>
        </>
      )}
      {width > 50 && height > 50 && platform && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 23}
          textAnchor="middle"
          fill="rgba(255,255,255,0.6)"
          fontSize={9}
        >
          {platform}
        </text>
      )}
    </g>
  );
};

// ──────────────────────────────────────────────
// ContaminationMap component
// ──────────────────────────────────────────────

export function ContaminationMap() {
  const [data, setData] = useState<TreemapEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommunityTreemap()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  // Group flat entries by platform into nested treemap structure
  const grouped = data.reduce<Record<string, TreemapEntry[]>>((acc, entry) => {
    const key = entry.platform;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  const treemapData = {
    name: "root",
    children: Object.entries(grouped).map(([platform, entries]) => ({
      name: platformLabel(platform),
      children: entries.map((e) => ({
        name: e.content_category ?? "other",
        size: e.total,
        ai_rate: e.ai_rate,
        ai_count: e.ai_count,
        platform: platformLabel(platform),
      })),
    })),
  };

  if (loading) {
    return (
      <ChartCard
        title="AI Contamination Map"
        subtitle="DeviantArt and ArtStation show 55-60% AI — art communities are ground zero. Unsplash and Wikipedia stay clean at 3-5% AI."
      >
        <div className="h-64 animate-pulse bg-secondary/5 rounded-lg" />
      </ChartCard>
    );
  }

  if (data.length === 0) {
    return (
      <ChartCard
        title="AI Contamination Map"
        subtitle="DeviantArt and ArtStation show 55-60% AI — art communities are ground zero. Unsplash and Wikipedia stay clean at 3-5% AI."
      >
        <p className="text-secondary/50 text-sm text-center py-12">
          No data available yet.
        </p>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="AI Contamination Map"
      subtitle="DeviantArt and ArtStation show 55-60% AI — art communities are ground zero. Unsplash and Wikipedia stay clean at 3-5% AI."
    >
      <ResponsiveContainer width="100%" height={350}>
        <Treemap
          data={treemapData.children}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#f0e6ca"
          content={<CustomTreemapContent />}
        >
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        </Treemap>
      </ResponsiveContainer>
    </ChartCard>
  );
}
