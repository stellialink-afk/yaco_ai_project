import type { Metadata } from "next";
export const metadata: Metadata = { title: "特定商取引法に基づく表記 — Stellia Academy" };

// TODO: 公開前に各項目を確定させる（Sotto の ToS/Privacy ドラフトと整合を取る）
const rows: [string, string][] = [
  ["販売事業者", "StelliaLink株式会社"],
  ["代表者", "（代表者名）"],
  ["所在地", "（所在地。請求があれば遅滞なく開示する旨の記載でも可）"],
  ["連絡先", "info@stellialink.com（電話番号は請求があれば遅滞なく開示します）"],
  ["販売価格", "各プランのページに税込価格を表示"],
  ["商品代金以外の必要料金", "インターネット接続料金・通信料金はお客様のご負担となります"],
  ["支払方法", "クレジットカード（Stripe）。法人プランは請求書払いにも対応"],
  ["支払時期", "お申し込み時に決済が確定します"],
  ["提供時期", "決済完了後、すぐに受講ページで視聴できます（先行販売中のレッスンは順次公開）"],
  ["返品・キャンセル", "デジタルコンテンツの性質上、決済後の返金・キャンセルはお受けしていません"],
  ["動作環境", "最新のブラウザ（Chrome / Safari / Edge）とインターネット接続"],
];

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-2xl font-bold">特定商取引法に基づく表記</h1>
      <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-6 py-4">
            <dt className="font-medium text-ink-soft">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
