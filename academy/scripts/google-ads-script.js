/* eslint-disable @typescript-eslint/no-unused-vars -- Google 広告側が main() を呼ぶ */
/**
 * Google 広告スクリプト（Google 広告の管理画面 → ツール → 一括操作 → スクリプト に貼る）
 *
 * 毎日1回実行されるように「頻度: 毎日」でスケジュールすると、
 * 過去7日分の広告ごとの成績を自社サイトの /api/ads/ingest に送る。
 * Google Ads API の開発者トークン申請が不要なので、個人の広告アカウントでもすぐ使える。
 *
 * 設定するのは下の2行だけ。
 */
var SITE_URL = "https://YOUR-DOMAIN.example"; // 本番URL（末尾スラッシュなし）
var INGEST_SECRET = "PASTE_ADS_INGEST_SECRET"; // .env の ADS_INGEST_SECRET と同じ値

function main() {
  var rows = [];
  var report = AdsApp.report(
    "SELECT segments.date, campaign.id, campaign.name, ad_group.id, ad_group.name, ad_group_ad.ad.id, ad_group_ad.ad.name, " +
      "metrics.cost_micros, metrics.impressions, metrics.clicks " +
      "FROM ad_group_ad WHERE segments.date DURING LAST_7_DAYS"
  );
  var it = report.rows();
  while (it.hasNext()) {
    var r = it.next();
    rows.push({
      date: r["segments.date"],
      platform: "google",
      account_id: AdsApp.currentAccount().getCustomerId(),
      campaign_id: r["campaign.id"],
      campaign_name: r["campaign.name"],
      adset_id: r["ad_group.id"],
      adset_name: r["ad_group.name"],
      ad_id: r["ad_group_ad.ad.id"],
      ad_name: r["ad_group_ad.ad.name"] || ("ad " + r["ad_group_ad.ad.id"]),
      spend: Number(r["metrics.cost_micros"]) / 1000000,
      impressions: Number(r["metrics.impressions"]),
      clicks: Number(r["metrics.clicks"]),
      link_clicks: Number(r["metrics.clicks"]),
      source: "csv",
    });
  }

  for (var i = 0; i < rows.length; i += 500) {
    var chunk = rows.slice(i, i + 500);
    var res = UrlFetchApp.fetch(SITE_URL + "/api/ads/ingest", {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + INGEST_SECRET },
      payload: JSON.stringify({ rows: chunk }),
      muteHttpExceptions: true,
    });
    Logger.log("sent " + chunk.length + " rows: " + res.getResponseCode() + " " + res.getContentText());
  }
}
