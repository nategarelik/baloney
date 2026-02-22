"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { CHART_COLORS } from "@/lib/constants";
import type { FeatureVector } from "@/lib/types";

interface FeatureRadarProps {
  featureVector: FeatureVector;
}

export function FeatureRadar({ featureVector }: FeatureRadarProps) {
  const data = [
    { feature: "Burstiness", value: featureVector.burstiness, typical_ai: 0.15 },
    { feature: "Vocabulary", value: featureVector.type_token_ratio, typical_ai: 0.35 },
    { feature: "Perplexity", value: Math.min(featureVector.perplexity / 300, 1), typical_ai: 0.2 },
    { feature: "Repetition", value: featureVector.repetition_score, typical_ai: 0.55 },
  ];

  return (
    <ChartCard
      title="Feature Profile"
      subtitle="Linguistic feature fingerprint vs typical AI patterns"
    >
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data}>
          <PolarGrid stroke={CHART_COLORS.gridLine} />
          <PolarAngleAxis
            dataKey="feature"
            tick={{ fill: "rgba(74,55,40,0.5)", fontSize: 11 }}
          />
          <Radar
            name="This Text"
            dataKey="value"
            stroke={CHART_COLORS.ai}
            fill={CHART_COLORS.ai}
            fillOpacity={0.3}
          />
          <Radar
            name="Typical AI"
            dataKey="typical_ai"
            stroke={CHART_COLORS.unclear}
            fill={CHART_COLORS.unclear}
            fillOpacity={0.1}
            strokeDasharray="4 4"
          />
          <Legend verticalAlign="bottom" height={30} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
