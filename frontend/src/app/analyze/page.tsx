import type { Metadata } from "next";
import { AnalyzeClient } from "./AnalyzeClient";

const VERDICT_LABELS: Record<string, string> = {
  ai_generated: "AI Generated",
  heavy_edit: "Heavy Edit",
  light_edit: "Light Edit",
  human: "Human Written",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  x: "X",
  manual_upload: "Direct Upload",
  tiktok: "TikTok",
  reddit: "Reddit",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  medium: "Medium",
  substack: "Substack",
  threads: "Threads",
  other: "Unknown Platform",
};

interface AnalyzePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getFirstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: AnalyzePageProps): Promise<Metadata> {
  const params = await searchParams;

  const verdict = getFirstParam(params.verdict);
  const confidence = getFirstParam(params.confidence);
  const type = getFirstParam(params.type);
  const platform = getFirstParam(params.platform);

  if (!verdict) {
    return {
      title: "AI Detector — Baloney",
      description:
        "Analyze text, images, and video for AI-generated content with Baloney.",
    };
  }

  const verdictLabel = VERDICT_LABELS[verdict] ?? verdict;
  const platformLabel = platform ? (PLATFORM_LABELS[platform] ?? platform) : null;
  const typeLabel = type ?? "content";
  const confidenceDisplay = confidence ? `${confidence}% confidence` : null;

  const titleParts = [verdictLabel, confidenceDisplay].filter(Boolean);
  const title = `${titleParts.join(" — ")} | Baloney AI Detector`;

  const descriptionParts = [
    `Baloney detected this ${typeLabel} as ${verdictLabel.toLowerCase()}`,
    confidenceDisplay,
    platformLabel ? `from ${platformLabel}` : null,
  ].filter(Boolean);
  const description = descriptionParts.join(" ") + ".";

  const ogImageParams = new URLSearchParams();
  if (verdict) ogImageParams.set("verdict", verdict);
  if (confidence) ogImageParams.set("confidence", confidence);
  if (type) ogImageParams.set("type", type);
  if (platform) ogImageParams.set("platform", platform);

  const ogImageUrl = `https://baloney.app/api/og?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://baloney.app/analyze",
      siteName: "Baloney",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Baloney scan result: ${verdictLabel}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function AnalyzePage() {
  return <AnalyzeClient />;
}
