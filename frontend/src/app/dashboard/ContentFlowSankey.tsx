"use client";

import { useState, useEffect } from "react";
import {
  Sankey,
  Tooltip,
  Layer,
  Rectangle,
  ResponsiveContainer,
} from "recharts";
import { getCommunityFlow } from "@/lib/api";
import { ChartCard } from "@/components/ChartCard";
import { CHART_TOOLTIP_STYLE } from "@/lib/constants";
import type { FlowData } from "@/lib/types";

interface SankeyNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: { name: string };
}

const SankeyNode = ({ x, y, width, height, index, payload }: SankeyNodeProps) => {
  const nodeColors: Record<string, string> = {
    Text: "#8B5CF6",
    Image: "#3B82F6",
    Video: "#06B6D4",
    X: "#1DA1F2",
    Reddit: "#FF4500",
    Instagram: "#E1306C",
    TikTok: "#000000",
    Facebook: "#1877F2",
    Upload: "#8B5CF6",
    LinkedIn: "#0A66C2",
    AI: "#d4456b",
    Human: "#16a34a",
    "Light Edit": "#f59e0b",
    "Heavy Edit": "#f97316",
  };
  const color = nodeColors[payload.name] ?? "rgba(74,55,40,0.3)";
  return (
    <Layer key={`node-${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity={0.9}
      />
      <text
        x={x + width + 6}
        y={y + height / 2}
        textAnchor="start"
        dominantBaseline="central"
        fill="rgba(74,55,40,0.7)"
        fontSize={11}
      >
        {payload.name}
      </text>
    </Layer>
  );
};

export function ContentFlowSankey() {
  const [flowData, setData] = useState<FlowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommunityFlow()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ChartCard
        title="Content Flow"
        subtitle="70% of scans are images, and Instagram carries the heaviest AI load. Follow the thick pink flows to see where AI content concentrates."
      >
        <div className="h-64 animate-pulse bg-secondary/5 rounded-lg" />
      </ChartCard>
    );
  }

  if (!flowData || flowData.links.length === 0) {
    return (
      <ChartCard
        title="Content Flow"
        subtitle="70% of scans are images, and Instagram carries the heaviest AI load. Follow the thick pink flows to see where AI content concentrates."
      >
        <p className="text-secondary/50 text-sm text-center py-12">
          No flow data available yet.
        </p>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Content Flow"
      subtitle="70% of scans are images, and Instagram carries the heaviest AI load. Follow the thick pink flows to see where AI content concentrates."
    >
      <ResponsiveContainer width="100%" height={350}>
        <Sankey
          data={{ nodes: flowData.nodes, links: flowData.links }}
          nodePadding={30}
          nodeWidth={12}
          margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
          link={{ stroke: "rgba(74,55,40,0.15)" }}
          node={<SankeyNode x={0} y={0} width={0} height={0} index={0} payload={{ name: "" }} />}
        >
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const data = payload[0]?.payload;
              if (!data) return null;
              return (
                <div style={CHART_TOOLTIP_STYLE}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>
                    {data.name ?? `${data.source?.name} → ${data.target?.name}`}
                  </p>
                  {data.value != null && (
                    <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.8 }}>
                      {data.value} scans
                    </p>
                  )}
                </div>
              );
            }}
          />
        </Sankey>
      </ResponsiveContainer>
    </ChartCard>
  );
}
