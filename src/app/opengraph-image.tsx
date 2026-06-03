import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sotto. — 音楽が空間に届く。";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Load a Google Font dynamically at edge runtime
async function loadGoogleFont(
  font: string,
  text: string,
  weight = 400,
  italic = false
): Promise<ArrayBuffer> {
  const familyParam = font.replace(/ /g, "+");
  const axisPart = italic
    ? `ital,wght@1,${weight}`
    : `wght@${weight}`;
  const url = `https://fonts.googleapis.com/css2?family=${familyParam}:${axisPart}&text=${encodeURIComponent(
    text
  )}&display=swap`;

  const css = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  }).then((res) => res.text());

  const match = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype|woff2)'\)/
  );
  if (!match) {
    throw new Error(`Could not parse font URL for ${font}`);
  }

  const fontResponse = await fetch(match[1]);
  if (!fontResponse.ok) {
    throw new Error(`Failed to fetch font file for ${font}`);
  }
  return fontResponse.arrayBuffer();
}

export default async function Image() {
  // Subset the fonts to only the characters we use (faster, smaller)
  const cormorantText = "Sotto.TheLoungeProject ";
  const cormorantItalicText = "—Quietlysoon.";
  const notoText = "音楽が空間に届く。";

  const [cormorantRegular, cormorantItalic, notoSerifJp] = await Promise.all([
    loadGoogleFont("Cormorant Garamond", cormorantText, 300, false),
    loadGoogleFont("Cormorant Garamond", cormorantItalicText, 300, true),
    loadGoogleFont("Noto Serif JP", notoText, 400, false),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0908",
          backgroundImage:
            "radial-gradient(circle at 50% 38%, rgba(184,148,92,0.12) 0%, transparent 65%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          fontFamily: "Cormorant",
          position: "relative",
        }}
      >
        {/* Subtle gold accent line top */}
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

        {/* Brand mark "Sotto." */}
        <div
          style={{
            display: "flex",
            fontSize: 200,
            fontWeight: 300,
            color: "#efeae0",
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
              fontFamily: "Cormorant",
            }}
          >
            .
          </span>
        </div>

        {/* Tagline italic */}
        <div
          style={{
            display: "flex",
            fontSize: 36,
            fontStyle: "italic",
            color: "#a39c8c",
            letterSpacing: "0.28em",
            marginTop: 36,
            fontFamily: "Cormorant",
          }}
        >
          — Quietly, soon. —
        </div>

        {/* Divider */}
        <div
          style={{
            width: 60,
            height: 1,
            background: "#2a261d",
            marginTop: 56,
          }}
        />

        {/* Japanese concept */}
        <div
          style={{
            display: "flex",
            fontFamily: "NotoSerifJP",
            fontSize: 52,
            color: "#efeae0",
            letterSpacing: "0.12em",
            marginTop: 56,
            fontWeight: 400,
          }}
        >
          音楽が空間に届く。
        </div>

        {/* Footer — The Sotto Lounge Project */}
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontStyle: "italic",
            color: "#8a6a2e",
            letterSpacing: "0.28em",
            marginTop: 72,
            fontFamily: "Cormorant",
          }}
        >
          The Sotto Lounge Project
        </div>

        {/* Subtle gold accent line bottom */}
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
    {
      ...size,
      fonts: [
        {
          name: "Cormorant",
          data: cormorantRegular,
          weight: 300,
          style: "normal",
        },
        {
          name: "Cormorant",
          data: cormorantItalic,
          weight: 300,
          style: "italic",
        },
        {
          name: "NotoSerifJP",
          data: notoSerifJp,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
