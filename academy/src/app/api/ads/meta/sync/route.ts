import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/site";
import { fetchMetaInsights, metaConfigured } from "@/lib/ads/meta";
import { upsertAdMetrics, ymd } from "@/lib/ads/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Meta の成績を取り込む。
 *  - GET  : Vercel Cron から（Authorization: Bearer CRON_SECRET）
 *  - POST : 管理画面の「今すぐ同期」ボタンから（管理者ログイン必須）
 * ?days=N で過去N日分（既定7日。Meta側で数字が後から確定するので毎日7日分を上書きする）
 */
async function run(request: Request) {
  if (!metaConfigured()) return NextResponse.json({ error: "Meta未接続。META_ACCESS_TOKEN と META_AD_ACCOUNT_ID を設定してください" }, { status: 400 });
  const url = new URL(request.url);
  const days = Math.min(Math.max(parseInt(url.searchParams.get("days") ?? "7", 10) || 7, 1), 90);
  const until = new Date();
  const since = new Date(until.getTime() - (days - 1) * 86400_000);
  const rows = await fetchMetaInsights(ymd(since), ymd(until));
  const { upserted } = await upsertAdMetrics(rows);
  return NextResponse.json({ ok: true, days, fetched: rows.length, upserted });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return await run(request);
  } catch (e) {
    console.error("[meta sync]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "sync failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const res = await run(request);
    // フォームからの送信なら管理画面へ戻す
    if (request.headers.get("accept")?.includes("text/html")) {
      const body = (await res.clone().json()) as { ok?: boolean; error?: string };
      const q = body.ok ? "synced=1" : `sync_error=${encodeURIComponent(body.error ?? "failed")}`;
      return NextResponse.redirect(new URL(`/admin?${q}`, request.url), { status: 303 });
    }
    return res;
  } catch (e) {
    console.error("[meta sync]", e);
    const msg = e instanceof Error ? e.message : "sync failed";
    if (request.headers.get("accept")?.includes("text/html")) {
      return NextResponse.redirect(new URL(`/admin?sync_error=${encodeURIComponent(msg)}`, request.url), { status: 303 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
