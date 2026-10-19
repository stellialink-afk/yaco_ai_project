import { NextResponse } from "next/server";
import { upsertAdMetrics, validateRows } from "@/lib/ads/ingest";

export const dynamic = "force-dynamic";

/**
 * 媒体を問わない取り込み口。Google 広告スクリプトや CSV 変換ツールから
 *   POST /api/ads/ingest  Authorization: Bearer ADS_INGEST_SECRET
 *   { "rows": [ { date, platform, campaign_name, ad_name, spend, impressions, clicks, ... } ] }
 */
export async function POST(request: Request) {
  const secret = process.env.ADS_INGEST_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { rows?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const { rows, errors } = validateRows(body.rows);
  if (errors.length && rows.length === 0) return NextResponse.json({ error: "no valid rows", errors }, { status: 400 });
  try {
    const { upserted } = await upsertAdMetrics(rows);
    return NextResponse.json({ ok: true, upserted, skipped: errors.length, errors: errors.slice(0, 20) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "ingest failed" }, { status: 500 });
  }
}
