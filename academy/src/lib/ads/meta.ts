/**
 * Meta Marketing API から日次・広告単位の成績を取る。
 * 必要な環境変数: META_ACCESS_TOKEN（システムユーザーの無期限トークン, 権限 ads_read）, META_AD_ACCOUNT_ID（act_ を除いた数字）
 */
import type { IngestRow } from "./ingest";

const VERSION = process.env.META_GRAPH_VERSION || "v23.0";

type InsightRow = {
  date_start: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  inline_link_clicks?: string;
};

export function metaConfigured() {
  return !!(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID);
}

export async function fetchMetaInsights(since: string, until: string): Promise<IngestRow[]> {
  const token = process.env.META_ACCESS_TOKEN;
  const account = (process.env.META_AD_ACCOUNT_ID ?? "").replace(/^act_/, "");
  if (!token || !account) throw new Error("META_ACCESS_TOKEN / META_AD_ACCOUNT_ID が未設定です");

  const fields = ["campaign_id", "campaign_name", "adset_id", "adset_name", "ad_id", "ad_name", "spend", "impressions", "reach", "clicks", "inline_link_clicks"].join(",");
  const params = new URLSearchParams({
    level: "ad",
    fields,
    time_increment: "1",
    time_range: JSON.stringify({ since, until }),
    limit: "500",
    access_token: token,
  });
  let url: string | null = `https://graph.facebook.com/${VERSION}/act_${account}/insights?${params}`;
  const rows: IngestRow[] = [];

  while (url) {
    const res: Response = await fetch(url, { cache: "no-store" });
    const json = (await res.json()) as { data?: InsightRow[]; paging?: { next?: string }; error?: { message: string; code: number } };
    if (!res.ok || json.error) {
      throw new Error(`Meta API エラー: ${json.error?.message ?? res.statusText}`);
    }
    for (const r of json.data ?? []) {
      rows.push({
        date: r.date_start,
        platform: "meta",
        account_id: account,
        campaign_id: r.campaign_id ?? "",
        campaign_name: r.campaign_name ?? null,
        adset_id: r.adset_id ?? "",
        adset_name: r.adset_name ?? null,
        ad_id: r.ad_id ?? "",
        ad_name: r.ad_name ?? null,
        spend: parseFloat(r.spend ?? "0") || 0,
        impressions: parseInt(r.impressions ?? "0", 10) || 0,
        reach: parseInt(r.reach ?? "0", 10) || 0,
        clicks: parseInt(r.clicks ?? "0", 10) || 0,
        link_clicks: parseInt(r.inline_link_clicks ?? "0", 10) || 0,
        source: "meta_api",
      });
    }
    url = json.paging?.next ?? null;
  }
  return rows;
}
