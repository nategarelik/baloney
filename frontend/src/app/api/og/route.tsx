import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const VERDICT_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  ai_generated: {
    label: "AI Generated",
    color: "#ffffff",
    bg: "rgba(220, 38, 38, 0.9)",
  },
  heavy_edit: {
    label: "Heavy Edit",
    color: "#ffffff",
    bg: "rgba(234, 88, 12, 0.9)",
  },
  light_edit: {
    label: "Light Edit",
    color: "#ffffff",
    bg: "rgba(202, 138, 4, 0.9)",
  },
  human: {
    label: "Human Written",
    color: "#ffffff",
    bg: "rgba(22, 163, 74, 0.9)",
  },
};

const TYPE_LABELS: Record<string, string> = {
  text: "Text",
  image: "Image",
  video: "Video",
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

function clampConfidence(raw: string | null): number {
  const n = parseInt(raw ?? "", 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const verdict = searchParams.get("verdict") ?? "ai_generated";
  const confidence = clampConfidence(searchParams.get("confidence"));
  const type = searchParams.get("type") ?? "text";
  const platform = searchParams.get("platform") ?? "manual_upload";

  const verdictConfig = VERDICT_CONFIG[verdict] ?? VERDICT_CONFIG["ai_generated"];
  const typeLabel = TYPE_LABELS[type] ?? "Content";
  const platformLabel = PLATFORM_LABELS[platform] ?? platform;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#f0e6ca",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "#d4456b",
          }}
        />

        {/* Main content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "60px 72px 48px",
            justifyContent: "space-between",
          }}
        >
          {/* Top: branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#d4456b",
              }}
            />
            <span
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#d4456b",
                letterSpacing: "-0.3px",
              }}
            >
              Baloney
            </span>
            <span
              style={{
                fontSize: "16px",
                color: "rgba(74,55,40,0.5)",
                marginLeft: "4px",
              }}
            >
              AI Content Detector
            </span>
          </div>

          {/* Center: verdict display */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Verdict badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                paddingTop: "10px",
                paddingBottom: "10px",
                paddingLeft: "24px",
                paddingRight: "24px",
                borderRadius: "100px",
                background: verdictConfig.bg,
                color: verdictConfig.color,
                fontSize: "28px",
                fontWeight: "700",
                width: "fit-content",
                letterSpacing: "-0.2px",
              }}
            >
              {verdictConfig.label}
            </div>

            {/* Confidence */}
            <div
              style={{
                fontSize: "80px",
                fontWeight: "800",
                color: "#4a3728",
                letterSpacing: "-2px",
                lineHeight: "1",
              }}
            >
              {confidence}
              <span
                style={{
                  fontSize: "40px",
                  fontWeight: "600",
                  color: "rgba(74,55,40,0.5)",
                  letterSpacing: "-1px",
                }}
              >
                % confidence
              </span>
            </div>
          </div>

          {/* Bottom: metadata row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
            }}
          >
            {/* Content type chip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                background: "rgba(74,55,40,0.08)",
                border: "1px solid rgba(74,55,40,0.15)",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(74,55,40,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: "600",
                }}
              >
                Type
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "#4a3728",
                  fontWeight: "700",
                }}
              >
                {typeLabel}
              </span>
            </div>

            {/* Platform chip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                background: "rgba(74,55,40,0.08)",
                border: "1px solid rgba(74,55,40,0.15)",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(74,55,40,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: "600",
                }}
              >
                Source
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "#4a3728",
                  fontWeight: "700",
                }}
              >
                {platformLabel}
              </span>
            </div>

            {/* Separator */}
            <div
              style={{
                flex: 1,
              }}
            />

            {/* Domain */}
            <span
              style={{
                fontSize: "16px",
                color: "rgba(74,55,40,0.4)",
              }}
            >
              baloney.app
            </span>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            height: "6px",
            background: "#e8c97a",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
