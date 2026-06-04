import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sotto. — Music for spaces.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Minimal OGP — uses Satori's default font (Inter) so this is guaranteed
// to render regardless of external font availability.
// Japanese text is intentionally omitted here because the default font
// has no JP glyphs. Branded typography (Cormorant + Noto Serif JP) can
// be layered on later once font hosting is sorted.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0908",
          backgroundImage:
            "radial-gradient(circle at 50% 38%, rgba(184,148,92,0.14) 0%, transparent 65%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          position: "relative",
        }}
      >
        {/* top accent line */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 40,
            height: 1,
            background: "#2a261d",
          }}
        />

        {/* brand mark */}
        <div
          style={{
            display: "flex",
            fontSize: 200,
            color: "#efeae0",
            fontWeight: 300,
            letterSpacing: "0.04em",
            lineHeight: 1,
          }}
        >
          Sotto
          <span
            style={{
              color: "#b8945c",
              fontStyle: "italic",
              marginLeft: 4,
            }}
          >
            .
          </span>
        </div>

        {/* tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 38,
            fontStyle: "italic",
            color: "#a39c8c",
            letterSpacing: "0.28em",
            marginTop: 36,
          }}
        >
          — Quietly, soon. —
        </div>

        {/* divider */}
        <div
          style={{
            width: 60,
            height: 1,
            background: "#2a261d",
            marginTop: 56,
          }}
        />

        {/* concept (English fallback) */}
        <div
          style={{
            display: "flex",
            fontSize: 52,
            color: "#efeae0",
            letterSpacing: "0.12em",
            marginTop: 56,
            fontWeight: 400,
          }}
        >
          Music for spaces.
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontStyle: "italic",
            color: "#8a6a2e",
            letterSpacing: "0.28em",
            marginTop: 72,
          }}
        >
          The Sotto Lounge Project
        </div>

        {/* bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 40,
            height: 1,
            background: "#2a261d",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
