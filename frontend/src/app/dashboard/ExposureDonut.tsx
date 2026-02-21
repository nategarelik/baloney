"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "@/lib/constants";

interface ExposureDonutProps {
  aiRate: number; // 0-1
  totalScans: number;
}

export function ExposureDonut({ aiRate, totalScans }: ExposureDonutProps) {
  const data = [
    { name: "AI", value: aiRate },
    { name: "Human", value: 1 - aiRate },
  ];

  return (
    <div className="relative w-full h-52 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={CHART_COLORS.ai} />
            <Cell fill={CHART_COLORS.human} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">
          {Math.round(aiRate * 100)}%
        </span>
        <span className="text-xs text-slate-400">AI Exposure</span>
      </div>
    </div>
  );
}
