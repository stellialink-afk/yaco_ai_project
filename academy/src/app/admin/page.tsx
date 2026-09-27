import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail, yen } from "@/lib/site";

export const metadata: Metadata = { title: "管理 — Stellia Academy", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type FunnelRow = { source: string; page_views: number; visitors: number; leads: number; checkouts: number; purchases: number };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) redirect("/signin?next=/admin");

  const admin = createAdminClient();
  const since30 = thirtyDaysAgo();

  const [{ data: funnel }, { data: purchases }, { data: leads }, { data: progress }, { data: lessons }, { count: leadCount }, { data: spend }] = await Promise.all([
    admin.from("v_funnel_by_source").select("*"),
    admin.from("purchases").select("plan, amount, channel, created_at, email").eq("status", "paid").order("created_at", { ascending: false }),
    admin.from("leads").select("email, utm_source, utm_campaign, created_at, user_id").order("created_at", { ascending: false }).limit(20),
    admin.from("lesson_progress").select("lesson_id"),
    admin.from("lessons").select("id, title, sort_order").order("sort_order"),
    admin.from("leads").select("id", { count: "exact", head: true }),
    admin.from("ad_spend").select("spend, platform").gte("date", since30.slice(0, 10)),
  ]);

  const revenue = (purchases ?? []).reduce((s, p) => s + p.amount, 0);
  const byPlan = { personal: (purchases ?? []).filter((p) => p.plan === "personal").length, business: (purchases ?? []).filter((p) => p.plan === "business").length };
  const totalSpend = (spend ?? []).reduce((s, r) => s + r.spend, 0);
  const completionByLesson = (lessons ?? []).map((l) => ({ ...l, count: (progress ?? []).filter((p) => p.lesson_id === l.id).length }));

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
      <p className="mt-1 text-xs text-ink-mute">数字はすべて自社DB（Supabase）から直接集計。</p>

      <section className="mt-8 grid gap-4 sm:grid-cols-4">
        <Stat label="売上（累計）" value={yen(revenue)} />
        <Stat label="購入数" value={`${byPlan.personal + byPlan.business}件`} sub={`個人 ${byPlan.personal} / 法人 ${byPlan.business}`} />
        <Stat label="リード（メール登録）" value={`${leadCount ?? 0}人`} />
        <Stat label="広告費（30日）" value={yen(totalSpend)} sub={totalSpend > 0 ? `ROAS ${(revenue / totalSpend).toFixed(1)}x` : "ad_spend 未入力"} />
      </section>

      <section className="mt-12">
        <h2 className="font-semibold">流入元ごとのファネル</h2>
        <p className="text-xs text-ink-mute mt-1">URL の utm_source ごとに、閲覧 → 登録 → 決済開始 → 購入 を追う。</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink-mute border-b border-line">
              <tr>
                <th className="py-2 pr-4">流入元</th>
                <th className="py-2 pr-4 text-right">閲覧</th>
                <th className="py-2 pr-4 text-right">訪問者</th>
                <th className="py-2 pr-4 text-right">登録</th>
                <th className="py-2 pr-4 text-right">決済開始</th>
                <th className="py-2 pr-4 text-right">購入</th>
                <th className="py-2 text-right">購入率</th>
              </tr>
            </thead>
            <tbody>
              {((funnel ?? []) as FunnelRow[]).map((r) => (
                <tr key={r.source} className="border-b border-line/60">
                  <td className="py-2 pr-4 font-medium">{r.source}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.page_views}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.visitors}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.leads}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.checkouts}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.purchases}</td>
                  <td className="py-2 text-right tabular-nums">{r.visitors ? `${((r.purchases / r.visitors) * 100).toFixed(1)}%` : "-"}</td>
                </tr>
              ))}
              {(funnel ?? []).length === 0 && (
                <tr><td colSpan={7} className="py-6 text-center text-ink-mute">まだイベントがありません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-semibold">レッスン完了数</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {completionByLesson.map((l) => (
              <li key={l.id} className="flex items-center gap-3">
                <span className="w-6 text-gold tabular-nums">{String(l.sort_order).padStart(2, "0")}</span>
                <span className="flex-1 truncate">{l.title}</span>
                <span className="tabular-nums">{l.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold">最近のリード</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {(leads ?? []).map((l) => (
              <li key={l.email} className="flex items-center gap-3">
                <span className="flex-1 truncate">{l.email}</span>
                <span className="text-xs text-ink-mute">{l.utm_source ?? "(direct)"}{l.utm_campaign ? ` / ${l.utm_campaign}` : ""}</span>
                {l.user_id && <span className="text-xs text-gold">登録済</span>}
              </li>
            ))}
            {(leads ?? []).length === 0 && <li className="text-ink-mute">まだリードがありません</li>}
          </ul>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-semibold">最近の購入</h2>
        <ul className="mt-4 divide-y divide-line text-sm">
          {(purchases ?? []).slice(0, 20).map((p, i) => (
            <li key={i} className="py-2 flex items-center gap-4">
              <span className="text-xs text-ink-mute w-28 shrink-0">{new Date(p.created_at).toLocaleDateString("ja-JP")}</span>
              <span className="flex-1 truncate">{p.email}</span>
              <span className="text-xs">{p.plan === "business" ? "法人" : "個人"} / {p.channel}</span>
              <span className="tabular-nums">{yen(p.amount)}</span>
            </li>
          ))}
          {(purchases ?? []).length === 0 && <li className="py-4 text-ink-mute">まだ購入がありません</li>}
        </ul>
      </section>
    </main>
  );
}

function thirtyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-line bg-card p-5">
      <p className="text-xs text-ink-mute">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-mute">{sub}</p>}
    </div>
  );
}
