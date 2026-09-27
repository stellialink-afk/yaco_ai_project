import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import PageViewTracker from "@/components/PageViewTracker";
import { SITE_NAME, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: `${SITE_NAME} — AIで自社の動画広告を内製する講座`,
  description:
    "外注3万円の広告動画を、自社で1時間で。中小企業・店舗オーナーのための、AIで売れる動画広告を内製する8回の動画講座。",
  openGraph: {
    title: "AIで自社の動画広告を内製する講座",
    description: "外注3万円の広告動画を、自社で1時間で。",
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <PageViewTracker />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-line mt-24">
          <div className="mx-auto max-w-5xl px-5 py-10 text-xs text-ink-mute flex flex-wrap gap-x-6 gap-y-2">
            <span>© {new Date().getFullYear()} StelliaLink株式会社</span>
            <a href="/legal/tokushoho" className="hover:text-ink">特定商取引法に基づく表記</a>
            <a href="/legal/terms" className="hover:text-ink">利用規約</a>
            <a href="/legal/privacy" className="hover:text-ink">プライバシーポリシー</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
