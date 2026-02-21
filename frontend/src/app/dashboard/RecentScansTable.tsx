"use client";

import { Image, FileText, Video } from "lucide-react";
import { DetectionBadge } from "@/components/DetectionBadge";
import type { ScanRecord } from "@/lib/types";

interface RecentScansTableProps {
  scans: ScanRecord[];
}

const TYPE_ICONS = {
  image: Image,
  text: FileText,
  video: Video,
} as const;

export function RecentScansTable({ scans }: RecentScansTableProps) {
  const recent = scans.slice(0, 15);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
            <th className="pb-3 pr-4">Type</th>
            <th className="pb-3 pr-4">Platform</th>
            <th className="pb-3 pr-4">Verdict</th>
            <th className="pb-3 pr-4">Confidence</th>
            <th className="pb-3">Time</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((scan, i) => {
            const Icon = TYPE_ICONS[scan.content_type] ?? Image;
            return (
              <tr
                key={scan.id}
                className={i % 2 === 0 ? "bg-navy-light/50" : ""}
              >
                <td className="py-2.5 pr-4">
                  <Icon className="h-4 w-4 text-slate-400" />
                </td>
                <td className="py-2.5 pr-4 text-slate-300 capitalize">
                  {scan.platform.replace("_", " ")}
                </td>
                <td className="py-2.5 pr-4">
                  <DetectionBadge
                    verdict={scan.verdict}
                    confidence={scan.confidence}
                    animate={false}
                  />
                </td>
                <td className="py-2.5 pr-4 text-slate-300">
                  {Math.round(scan.confidence * 100)}%
                </td>
                <td className="py-2.5 text-slate-500 text-xs">
                  {new Date(scan.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
