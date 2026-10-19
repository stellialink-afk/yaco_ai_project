import { createAdminClient } from "@/lib/supabase/admin";

/** ad_metrics_daily に入れる1行。媒体を問わず共通の形。 */
export type IngestRow = {
  date: string; // YYYY-MM-DD
  platform: "meta" | "google" | "tiktok" | "line" | string;
  account_id?: string;
  campaign_id?: string;
  campaign_name?: string | null;
  adset_id?: string;
  adset_name?: string | null;
  ad_id?: string;
  ad_name?: string | null;
  spend: number;
  impressions?: number;
  reach?: number;
  clicks?: number;
  link_clicks?: number;
  source: "meta_api" | "csv" | "manual";
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateRows(input: unknown): { rows: IngestRow[]; errors: string[] } {
  const errors: string[] = [];
  const rows: IngestRow[] = [];
  if (!Array.isArray(input)) return { rows, errors: ["rows は配列で送ってください"] };
  input.forEach((r, i) => {
    if (!r || typeof r !== "object") return void errors.push(`${i}: オブジェクトではありません`);
    const o = r as Record<string, unknown>;
    const date = String(o.date ?? "");
    if (!DATE_RE.test(date)) return void errors.push(`${i}: date は YYYY-MM-DD 形式`);
    const platform = String(o.platform ?? "").toLowerCase();
    if (!platform) return void errors.push(`${i}: platform が空`);
    const n = (v: unknown) => (typeof v === "number" ? v : parseFloat(String(v ?? "0").replace(/[,¥￥]/g, "")) || 0);
    rows.push({
      date,
      platform,
      account_id: String(o.account_id ?? ""),
      campaign_id: String(o.campaign_id ?? ""),
      campaign_name: o.campaign_name ? String(o.campaign_name) : null,
      adset_id: String(o.adset_id ?? ""),
      adset_name: o.adset_name ? String(o.adset_name) : null,
      ad_id: String(o.ad_id ?? ""),
      ad_name: o.ad_name ? String(o.ad_name) : null,
      spend: n(o.spend),
      impressions: Math.round(n(o.impressions)),
      reach: Math.round(n(o.reach)),
      clicks: Math.round(n(o.clicks)),
      link_clicks: Math.round(n(o.link_clicks)),
      source: o.source === "meta_api" || o.source === "manual" ? o.source : "csv",
    });
  });
  return { rows, errors };
}

/** 同じ日・媒体・広告の行は上書き（再取り込みしても二重にならない） */
export async function upsertAdMetrics(rows: IngestRow[]) {
  if (rows.length === 0) return { upserted: 0 };
  const admin = createAdminClient();
  const payload = rows.map((r) => ({
    date: r.date,
    platform: r.platform,
    account_id: r.account_id ?? "",
    campaign_id: r.campaign_id ?? "",
    campaign_name: r.campaign_name ?? null,
    adset_id: r.adset_id ?? "",
    adset_name: r.adset_name ?? null,
    ad_id: r.ad_id ?? "",
    ad_name: r.ad_name ?? null,
    spend: r.spend,
    impressions: r.impressions ?? 0,
    reach: r.reach ?? 0,
    clicks: r.clicks ?? 0,
    link_clicks: r.link_clicks ?? 0,
    source: r.source,
    synced_at: new Date().toISOString(),
  }));
  // 500行ずつ
  let upserted = 0;
  for (let i = 0; i < payload.length; i += 500) {
    const chunk = payload.slice(i, i + 500);
    const { error } = await admin.from("ad_metrics_daily").upsert(chunk, { onConflict: "date,platform,campaign_id,adset_id,ad_id" });
    if (error) throw new Error(`ad_metrics_daily upsert 失敗: ${error.message}`);
    upserted += chunk.length;
  }
  return { upserted };
}

export function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}
