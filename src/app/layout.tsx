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
  metadataBase: new URL("https://sottolounge.app"),
  title: "Sotto. — Quietly, soon.",
  description:
    "音楽が空間に届く。AIで作った1曲を「作品」として置く場所として。やがてその音楽が世界のさまざまな空間へ流れるホームとして。クリエイターと場をつなぐ、新しい音楽の届けかた。",
  openGraph: {
    title: "Sotto. — 音楽が空間に届く。",
    description: "クリエイターと場をつなぐ、新しい音楽の届けかた。",
    type: "website",
    locale: "ja_JP",
    url: "https://sottolounge.app",
    siteName: "Sotto",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sotto. — 音楽が空間に届く。",
    description: "クリエイターと場をつなぐ、新しい音楽の届けかた。",
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
