import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sotto.fm"),
  title: "Sotto. — Quietly, soon.",
  description:
    "AI音楽クリエイターのための、招待制の小さなギャラリー。間もなく、静かに開きます。",
  openGraph: {
    title: "Sotto.",
    description: "Quietly, soon. — A quiet gallery for AI music creators.",
    type: "website",
    locale: "ja_JP",
    url: "https://sotto.fm",
    siteName: "Sotto",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sotto.",
    description: "Quietly, soon. — A quiet gallery for AI music creators.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${cormorant.variable} ${notoSerifJp.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
