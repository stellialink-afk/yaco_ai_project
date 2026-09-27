"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** ページ遷移ごとに page_view を記録（管理画面と受講ページは除外） */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return;
    const body = JSON.stringify({ name: "page_view", path: pathname });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
      }
    } catch {
      // 計測失敗は無視
    }
  }, [pathname]);

  return null;
}
