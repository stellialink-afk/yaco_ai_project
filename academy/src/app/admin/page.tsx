import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail, yen } from "@/lib/site";
import { metaConfigured } from "@/lib/ads/meta";
import { kpiTargets, glossary } from "@/content/kpi";
import {
  creativePerformance,
  derive,
  funnel,
  labelOf,
  ltv,
  rankCreatives,
  sumTotals,
  totalsByPlatform,
  weeklySeries,
  type AdRow,
  type EventRow,
  type LeadRow,
  type PurchaseRow,
} from "@/lib/analytics";
import KpiTile from "@/components/admin/KpiTile";
import WeeklyBars from "@/components/admin/WeeklyBars";
import FunnelBars from "@/components/admin/FunnelBars";
import { saveMonthlyReview } from "./actions";

export const metadata: Metadata = { title: "管理 — Stellia Academy", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ days?: string; synced?: string; sync_error?: string; platform?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) redirect("/signin?next=/admin");

  const days = (RANGES as readonly number[]).includes(Number(sp.days)) ? Number(sp.days) : 30;
  const until = new Date();
  const since = new Date(until.getTime() - (days - 1) * 86400_000);
  since.setUTCHours(0, 0, 0, 0);
  const sinceIso = since.toISOString();
  const sinceYmd = sinceIso.slice(0, 10);

  const admin = createAdminClient();
  const [evRes, leadRes, purRes, adRes, progRes, lessonRes, reviewRes, lastSyncRes] = await Promise.all([
    admin.from("events").select("name, visitor_id, lead_id, props, created_at").gte("created_at", sinceIso).limit(50000),
    admin.from("leads").select("id, utm_source, utm_campaign, utm_content, created_at").limit(20000),
    admin.from("purchases").select("amount, plan, channel, created_at, lead_id, email").eq("status", "paid").gte("created_at", sinceIso),
    admin.from("ad_metrics_daily").select("date, platform, campaign_name, adset_name, ad_name, spend, impressions, reach, clicks, link_clicks").gte("date", sinceYmd),
    admin.from("lesson_progress").select("lesson_id"),
    admin.from("lessons").select("id, title, sort_order").order("sort_order"),
    admin.from("monthly_reviews").select("*").order("month", { ascending: false }).limit(1),
    admin.from("ad_metrics_daily").select("synced_at, platform").order("synced_at", { ascending: false }).limit(1),
  ]);

  const events = (evRes.data ?? []) as EventRow[];
  const leads = (leadRes.data ?? []) as LeadRow[];
  const purchases = (purRes.data ?? []) as PurchaseRow[];
  const ads = (adRes.data ?? []) as AdRow[];

  const byPlatform = totalsByPlatform(ads, events, leads, purchases);
  const all = sumTotals(byPlatform.values());
  const d = derive(all);
  const weeks = weeklySeries(ads, events, purchases, since, until);
  const creatives = rankCreatives(creativePerformance(ads, leads, purchases));
  const platformKeys = [...byPlatform.keys()].sort((a, b) => (byPlatform.get(b)!.spend + byPlatform.get(b)!.visitors) - (byPlatform.get(a)!.spend + byPlatform.get(a)!.visitors));
  const funnelPlatform = sp.platform && byPlatform.has(sp.platform) ? sp.platform : byPlatform.has("meta") ? "meta" : platformKeys[0];
  const funnelSteps = funnel(funnelPlatform ? byPlatform.get(funnelPlatform)! : all);
  const lifetime = ltv(purchases);
  const lessons = (lessonRes.data ?? []).map((l) => ({ ...l, count: (progRes.data ?? []).filter((p) => p.lesson_id === l.id).length }));
  const review = reviewRes.data?.[0] as { month: string; what_worked: string | null; what_didnt: string | null; actions: { title: string; due?: string; expected?: string }[] } | undefined;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const lastSync = lastSyncRes.data?.[0]?.synced_at as string | undefined;
  const metaOn = metaConfigured();

  const fmtX = (v: number | null) => (v === null ? "—" : `${v.toFixed(1)}x`);
  const fmtPct = (v: number | null) => (v === null ? "—" : `${v.toFixed(2)}%`);
  const fmtYen = (v: number | null) => (v === null ? "—" : yen(Math.round(v)));

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">広告と売上のダッシュボード</h1>
          <p className="mt-1 text-xs text-ink-mute">Metaの管理画面を開かなくても、ここで全部わかるようにしています。数字は自社DBから直接集計。</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {RANGES.map((r) => (
            <Link key={r} href={`/admin?days=${r}`} className={`rounded-md border px-3 py-1.5 ${days === r ? "border-accent bg-accent text-white" : "border-line bg-card hover:border-gold"}`}>
              過去{r}日
            </Link>
          ))}
        </div>
      </div>

      {/* 接続状態 */}
      <section className="mt-6 rounded-lg border border-line bg-bg-soft p-4 text-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-medium">広告データの取り込み：</span>
          {metaOn ? (
            <span>Meta 接続済み{lastSync ? `（最終取り込み ${new Date(lastSync).toLocaleString("ja-JP")}）` : "（まだ取り込みなし）"}</span>
          ) : (
            <span className="text-amber-700">Meta 未接続。<Link href="/admin/setup" className="underline">接続手順を見る</Link></span>
          )}
          {sp.synced && <span className="ml-3 text-emerald-700">同期しました</span>}
          {sp.sync_error && <span className="ml-3 text-danger">エラー: {sp.sync_error}</span>}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/setup" className="rounded-md border border-line bg-card px-3 py-1.5 hover:border-gold">Google広告の取り込み方</Link>
          {metaOn && (
            <form action="/api/ads/meta/sync?days=30" method="post">
              <button className="rounded-md bg-accent text-white px-3 py-1.5 hover:opacity-90" type="submit">Metaから今すぐ取り込む（30日分）</button>
            </form>
          )}
        </div>
      </section>

      {/* 主要指標 */}
      <section className="mt-8">
        <h2 className="font-semibold">主要指標（過去{days}日）</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="売上" value={yen(all.revenue)} sub={`購入 ${all.purchases}件`} plain="この期間に講座が売れた金額。" />
          <KpiTile label="広告費" value={yen(Math.round(all.spend))} sub={all.spend ? `CPM ${fmtYen(d.cpm)} / CPC ${fmtYen(d.cpc)}` : "広告データなし"} plain="Meta・Googleから取り込んだ広告費の合計。" />
          <KpiTile
            label="ROAS（広告費の何倍売れたか）"
            value={fmtX(d.roas)}
            sub={`目標 ${kpiTargets.roas.toFixed(1)}x 以上`}
            status={d.roas === null ? "none" : d.roas >= kpiTargets.roas ? "good" : "warn"}
            plain="3倍なら「1万円の広告で3万円売れた」。1倍を切ると広告費のほうが大きい。"
          />
          <KpiTile
            label="CPA（1件の購入にかかった広告費）"
            value={fmtYen(d.cpa)}
            sub={`目標 ${yen(kpiTargets.cpa)} 以下`}
            status={d.cpa === null ? "none" : d.cpa <= kpiTargets.cpa ? "good" : "warn"}
            plain="講座の値段より十分小さければ黒字。"
          />
          <KpiTile label="サイト訪問者" value={`${all.visitors.toLocaleString("ja-JP")}人`} sub={`メール登録 ${all.leads}人 / 決済画面 ${all.checkouts}回`} plain="広告でも無料投稿でも、サイトに来た人の数。" />
          <KpiTile label="CVR（訪問者のうち買った割合）" value={fmtPct(d.cvr)} sub={`目標 ${kpiTargets.cvr}% 以上`} status={d.cvr === null ? "none" : d.cvr >= kpiTargets.cvr ? "good" : "warn"} plain="LPの説得力と価格の妥当性がここに出る。" />
          <KpiTile label="CTR（広告を見た人のうちクリックした割合）" value={fmtPct(d.ctr)} sub={`表示 ${all.impressions.toLocaleString("ja-JP")} / クリック ${all.clicks.toLocaleString("ja-JP")}`} status={d.ctr === null ? "none" : d.ctr >= kpiTargets.ctr ? "good" : "warn"} plain="動画や画像の「引き」の強さ。1%が目安。" />
          <KpiTile label="LTV（1人あたり累計売上）" value={fmtYen(lifetime.avg)} sub={`購入者 ${lifetime.buyers}人`} plain="許せるCPAの上限を決める基準。講座が2本になると伸びる。" />
        </div>
      </section>

      {/* 媒体別 */}
      <section className="mt-12">
        <h2 className="font-semibold">媒体別（どこから来た人が買っているか）</h2>
        <p className="mt-1 text-xs text-ink-mute">URLの utm_source で判定。広告費・表示・クリックは媒体から取り込んだ数字、それ以外は自社DBの数字。</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink-mute border-b border-line">
              <tr>
                <th className="py-2 pr-4">媒体</th>
                <th className="py-2 pr-4 text-right">広告費</th>
                <th className="py-2 pr-4 text-right">表示</th>
                <th className="py-2 pr-4 text-right">クリック</th>
                <th className="py-2 pr-4 text-right">CTR</th>
                <th className="py-2 pr-4 text-right">訪問者</th>
                <th className="py-2 pr-4 text-right">登録</th>
                <th className="py-2 pr-4 text-right">購入</th>
                <th className="py-2 pr-4 text-right">売上</th>
                <th className="py-2 pr-4 text-right">CPA</th>
                <th className="py-2 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {platformKeys.map((p) => {
                const t = byPlatform.get(p)!;
                const x = derive(t);
                return (
                  <tr key={p} className="border-b border-line/60">
                    <td className="py-2 pr-4 font-medium">
                      <Link href={`/admin?days=${days}&platform=${encodeURIComponent(p)}`} className="hover:text-gold">{labelOf(p)}</Link>
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">{t.spend ? yen(Math.round(t.spend)) : "—"}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{t.impressions ? t.impressions.toLocaleString("ja-JP") : "—"}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{t.clicks ? t.clicks.toLocaleString("ja-JP") : "—"}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{fmtPct(x.ctr)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{t.visitors.toLocaleString("ja-JP")}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{t.leads}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{t.purchases}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{yen(t.revenue)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{fmtYen(x.cpa)}</td>
                    <td className="py-2 text-right tabular-nums">{fmtX(x.roas)}</td>
                  </tr>
                );
              })}
              {platformKeys.length === 0 && (
                <tr><td colSpan={11} className="py-6 text-center text-ink-mute">まだデータがありません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 週次推移 */}
      <section className="mt-12">
        <h2 className="font-semibold">週ごとの推移</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <WeeklyBars title="広告費" unit="円" points={weeks.map((w) => ({ week: w.week, value: Math.round(w.spend) }))} />
          <WeeklyBars title="サイト訪問者" unit="人" points={weeks.map((w) => ({ week: w.week, value: w.visitors }))} />
          <WeeklyBars title="購入数" unit="件" points={weeks.map((w) => ({ week: w.week, value: w.purchases }))} />
        </div>
      </section>

      {/* ファネル */}
      <section className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">どこで人が減っているか（ファネル）</h2>
          <div className="flex gap-2 text-xs">
            {platformKeys.map((p) => (
              <Link key={p} href={`/admin?days=${days}&platform=${encodeURIComponent(p)}`} className={`rounded px-2 py-1 border ${funnelPlatform === p ? "border-accent bg-accent text-white" : "border-line bg-card"}`}>
                {labelOf(p)}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-1 text-xs text-ink-mute">右の％は「前の段階から次へ進んだ割合」。いちばん落ちている段階が、次に直す場所。</p>
        <div className="mt-5 rounded-lg border border-line bg-card p-5">
          <FunnelBars steps={funnelSteps} />
        </div>
      </section>

      {/* クリエイティブ別 */}
      <section className="mt-12">
        <h2 className="font-semibold">広告クリエイティブ別（どの動画が効いたか）</h2>
        <p className="mt-1 text-xs text-ink-mute">
          並び順は{creatives.by}。購入まで紐づけるには、広告のリンク先URLに <code className="text-[11px]">utm_content={"{{ad.name}}"}</code> を付けてください（Meta広告マネージャの「URLパラメーター」欄）。
        </p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <CreativeList title="よく効いた3本" rows={creatives.top} empty="表示100回以上の広告が出てくると表示されます" />
          <CreativeList title="見直したい3本" rows={creatives.bottom} empty="比較できる本数がそろうと表示されます" />
        </div>
      </section>

      {/* 月次の振り返り */}
      <section className="mt-12">
        <h2 className="font-semibold">今月の振り返り（{thisMonth}）</h2>
        <p className="mt-1 text-xs text-ink-mute">数字を見て気づいたことを残しておく欄。月次レポートに自動で載ります。</p>
        <form action={saveMonthlyReview} className="mt-4 grid gap-4 md:grid-cols-2 rounded-lg border border-line bg-card p-5 text-sm">
          <input type="hidden" name="month" value={thisMonth} />
          <label className="block">
            <span className="text-xs text-ink-mute">うまくいったこと</span>
            <textarea name="what_worked" rows={4} defaultValue={review?.month?.startsWith(thisMonth) ? review.what_worked ?? "" : ""} className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 outline-none focus:border-gold" placeholder="例：Instagramリールからの訪問者が先週の2倍。無料レッスンの視聴完了率が高い。" />
          </label>
          <label className="block">
            <span className="text-xs text-ink-mute">うまくいかなかったこと</span>
            <textarea name="what_didnt" rows={4} defaultValue={review?.month?.startsWith(thisMonth) ? review.what_didnt ?? "" : ""} className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 outline-none focus:border-gold" placeholder="例：決済画面まで来て買わない人が多い。価格か安心材料が足りない。" />
          </label>
          <div className="md:col-span-2">
            <span className="text-xs text-ink-mute">来月やること（3つまで）</span>
            <div className="mt-1 grid gap-2">
              {[1, 2, 3].map((i) => {
                const a = review?.month?.startsWith(thisMonth) ? review.actions?.[i - 1] : undefined;
                return (
                  <div key={i} className="grid grid-cols-[1fr_120px_1fr] gap-2">
                    <input name={`action_${i}_title`} defaultValue={a?.title ?? ""} placeholder={`施策 ${i}`} className="rounded-md border border-line bg-bg px-3 py-2 outline-none focus:border-gold" />
                    <input name={`action_${i}_due`} defaultValue={a?.due ?? ""} placeholder="期限" className="rounded-md border border-line bg-bg px-3 py-2 outline-none focus:border-gold" />
                    <input name={`action_${i}_expected`} defaultValue={a?.expected ?? ""} placeholder="期待する変化" className="rounded-md border border-line bg-bg px-3 py-2 outline-none focus:border-gold" />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="rounded-md bg-accent text-white px-5 py-2 hover:opacity-90">保存</button>
          </div>
        </form>
      </section>

      {/* 受講 */}
      <section className="mt-12 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-semibold">レッスン完了数（累計）</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {lessons.map((l) => (
              <li key={l.id} className="flex items-center gap-3">
                <span className="w-6 text-gold tabular-nums">{String(l.sort_order).padStart(2, "0")}</span>
                <span className="flex-1 truncate">{l.title}</span>
                <span className="tabular-nums">{l.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold">最近の購入</h2>
          <ul className="mt-4 divide-y divide-line text-sm">
            {purchases.slice(0, 10).map((p, i) => (
              <li key={i} className="py-2 flex items-center gap-4">
                <span className="text-xs text-ink-mute w-24 shrink-0">{new Date(p.created_at).toLocaleDateString("ja-JP")}</span>
                <span className="flex-1 truncate">{p.email}</span>
                <span className="text-xs">{p.plan === "business" ? "法人" : "個人"}</span>
                <span className="tabular-nums">{yen(p.amount)}</span>
              </li>
            ))}
            {purchases.length === 0 && <li className="py-4 text-ink-mute">この期間の購入はまだありません</li>}
          </ul>
        </div>
      </section>

      {/* 用語 */}
      <section className="mt-14">
        <h2 className="font-semibold">用語のやさしい説明</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 text-sm">
          {glossary.map((g) => (
            <div key={g.key} className="flex gap-3">
              <dt className="w-24 shrink-0 font-medium">{g.name}</dt>
              <dd>
                <span className="text-xs text-ink-mute">{g.formula}</span>
                <p className="text-ink-soft">{g.plain}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}

function CreativeList({ title, rows, empty }: { title: string; rows: ReturnType<typeof rankCreatives>["top"]; empty: string }) {
  return (
    <div className="rounded-lg border border-line bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-xs text-ink-mute">{empty}</p>
      ) : (
        <ol className="mt-3 divide-y divide-line text-sm">
          {rows.map((r, i) => (
            <li key={`${r.platform}-${r.ad_name}`} className="py-3">
              <div className="flex items-baseline gap-2">
                <span className="text-gold font-semibold">{i + 1}</span>
                <span className="font-medium flex-1 truncate">{r.ad_name}</span>
                <span className="text-[11px] text-ink-mute">{labelOf(r.platform)}</span>
              </div>
              <div className="mt-1 grid grid-cols-4 gap-2 text-xs text-ink-soft tabular-nums">
                <span>CTR {r.ctr === null ? "—" : `${r.ctr.toFixed(2)}%`}</span>
                <span>CPC {r.cpc === null ? "—" : yen(Math.round(r.cpc))}</span>
                <span>購入 {r.purchases}</span>
                <span>ROAS {r.roas === null ? "—" : `${r.roas.toFixed(1)}x`}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
