/**
 * 管理画面の集計ロジック（純粋関数）。DBの行を受け取って数字にする。
 * 月次レポートの自動生成でも同じ関数を使う。
 */

export type EventRow = {
  name: string;
  visitor_id: string | null;
  lead_id: string | null;
  props: Record<string, unknown> | null;
  created_at: string;
};
export type LeadRow = { id: string; utm_source: string | null; utm_campaign: string | null; utm_content: string | null; created_at: string };
export type PurchaseRow = { amount: number; plan: string; channel: string; created_at: string; lead_id: string | null; email: string | null };
export type AdRow = {
  date: string;
  platform: string;
  campaign_name: string | null;
  adset_name: string | null;
  ad_name: string | null;
  spend: number | string;
  impressions: number;
  reach: number;
  clicks: number;
  link_clicks: number;
};

/** utm_source の表記ゆれを媒体名に寄せる */
export function normalizePlatform(source: string | null | undefined): string {
  const s = (source ?? "").toLowerCase().trim();
  if (!s) return "(direct)";
  if (["meta", "facebook", "fb", "instagram", "ig", "ig_ads", "fb_ads"].includes(s)) return "meta";
  if (["google", "google_ads", "adwords", "youtube_ads", "gads"].includes(s)) return "google";
  if (["tiktok", "tt"].includes(s)) return "tiktok";
  if (["line", "line_ads"].includes(s)) return "line";
  return s; // youtube / instagram_organic / brain など、そのまま
}

export const platformLabel: Record<string, string> = {
  meta: "Meta（Instagram・Facebook）",
  google: "Google（検索・YouTube）",
  tiktok: "TikTok",
  line: "LINE",
  youtube: "YouTube（無料投稿）",
  instagram_organic: "Instagram（無料投稿）",
  "(direct)": "直接・不明",
};

export function labelOf(platform: string) {
  return platformLabel[platform] ?? platform;
}

const num = (v: number | string | null | undefined) => (typeof v === "string" ? parseFloat(v) || 0 : v ?? 0);

export type Totals = {
  spend: number;
  impressions: number;
  clicks: number;
  visitors: number;
  leads: number;
  checkouts: number;
  purchases: number;
  revenue: number;
};

export const emptyTotals = (): Totals => ({ spend: 0, impressions: 0, clicks: 0, visitors: 0, leads: 0, checkouts: 0, purchases: 0, revenue: 0 });

/** 広告行の「サイトに来た数」に近いクリック数（リンククリックがあればそれ） */
export function siteClicks(r: AdRow) {
  return r.link_clicks > 0 ? r.link_clicks : r.clicks;
}

/** 媒体ごとの合計（広告側 + 自社DB側） */
export function totalsByPlatform(ads: AdRow[], events: EventRow[], leads: LeadRow[], purchases: PurchaseRow[]) {
  const map = new Map<string, Totals>();
  const get = (p: string) => {
    if (!map.has(p)) map.set(p, emptyTotals());
    return map.get(p)!;
  };

  for (const r of ads) {
    const t = get(normalizePlatform(r.platform));
    t.spend += num(r.spend);
    t.impressions += r.impressions;
    t.clicks += siteClicks(r);
  }

  const leadById = new Map(leads.map((l) => [l.id, l]));
  const sourceOfEvent = (e: EventRow) => {
    const lead = e.lead_id ? leadById.get(e.lead_id) : undefined;
    const fromProps = (e.props?.utm_source as string | undefined) ?? undefined;
    return normalizePlatform(lead?.utm_source ?? fromProps ?? null);
  };

  const visitorsSeen = new Map<string, Set<string>>();
  for (const e of events) {
    const p = sourceOfEvent(e);
    const t = get(p);
    if (e.name === "page_view") {
      if (!visitorsSeen.has(p)) visitorsSeen.set(p, new Set());
      if (e.visitor_id) visitorsSeen.get(p)!.add(e.visitor_id);
    } else if (e.name === "lead") t.leads += 1;
    else if (e.name === "checkout_start") t.checkouts += 1;
  }
  for (const [p, set] of visitorsSeen) get(p).visitors = set.size;

  for (const pu of purchases) {
    const lead = pu.lead_id ? leadById.get(pu.lead_id) : undefined;
    const t = get(normalizePlatform(lead?.utm_source ?? null));
    t.purchases += 1;
    t.revenue += pu.amount;
  }

  return map;
}

export function sumTotals(list: Iterable<Totals>): Totals {
  const out = emptyTotals();
  for (const t of list) {
    out.spend += t.spend;
    out.impressions += t.impressions;
    out.clicks += t.clicks;
    out.visitors += t.visitors;
    out.leads += t.leads;
    out.checkouts += t.checkouts;
    out.purchases += t.purchases;
    out.revenue += t.revenue;
  }
  return out;
}

export function derive(t: Totals) {
  const safe = (a: number, b: number) => (b > 0 ? a / b : null);
  return {
    roas: safe(t.revenue, t.spend),
    cpa: safe(t.spend, t.purchases),
    cvr: t.visitors > 0 ? (t.purchases / t.visitors) * 100 : null,
    ctr: t.impressions > 0 ? (t.clicks / t.impressions) * 100 : null,
    cpm: t.impressions > 0 ? (t.spend / t.impressions) * 1000 : null,
    cpc: safe(t.spend, t.clicks),
  };
}

/** 週の開始日（月曜）を YYYY-MM-DD で返す */
export function weekStart(dateIso: string) {
  const d = new Date(dateIso);
  const day = (d.getUTCDay() + 6) % 7; // 月曜=0
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

export type WeekPoint = { week: string; spend: number; purchases: number; revenue: number; visitors: number };

export function weeklySeries(ads: AdRow[], events: EventRow[], purchases: PurchaseRow[], since: Date, until: Date): WeekPoint[] {
  const weeks = new Map<string, WeekPoint>();
  // 期間内の全週を先に用意（データが無い週も0で出す）
  for (let d = new Date(weekStart(since.toISOString())); d <= until; d.setUTCDate(d.getUTCDate() + 7)) {
    const w = d.toISOString().slice(0, 10);
    weeks.set(w, { week: w, spend: 0, purchases: 0, revenue: 0, visitors: 0 });
  }
  const get = (iso: string) => {
    const w = weekStart(iso);
    if (!weeks.has(w)) weeks.set(w, { week: w, spend: 0, purchases: 0, revenue: 0, visitors: 0 });
    return weeks.get(w)!;
  };
  for (const r of ads) get(r.date).spend += num(r.spend);
  for (const p of purchases) {
    const w = get(p.created_at);
    w.purchases += 1;
    w.revenue += p.amount;
  }
  const seen = new Map<string, Set<string>>();
  for (const e of events) {
    if (e.name !== "page_view" || !e.visitor_id) continue;
    const w = weekStart(e.created_at);
    if (!seen.has(w)) seen.set(w, new Set());
    seen.get(w)!.add(e.visitor_id);
  }
  for (const [w, s] of seen) get(w + "T00:00:00Z").visitors = s.size;
  return [...weeks.values()].sort((a, b) => a.week.localeCompare(b.week));
}

export type CreativeRow = {
  platform: string;
  ad_name: string;
  campaign_name: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number | null;
  cpc: number | null;
  purchases: number;
  revenue: number;
  roas: number | null;
  cpa: number | null;
};

/**
 * 広告（クリエイティブ）ごとの成績。
 * 購入は leads.utm_content が広告名と一致するものを数える（広告URLに utm_content={{ad.name}} を付ける運用）。
 */
export function creativePerformance(ads: AdRow[], leads: LeadRow[], purchases: PurchaseRow[]): CreativeRow[] {
  const byAd = new Map<string, CreativeRow>();
  for (const r of ads) {
    const name = (r.ad_name ?? "").trim();
    if (!name) continue;
    const key = `${normalizePlatform(r.platform)}::${name}`;
    if (!byAd.has(key)) {
      byAd.set(key, { platform: normalizePlatform(r.platform), ad_name: name, campaign_name: r.campaign_name, spend: 0, impressions: 0, clicks: 0, ctr: null, cpc: null, purchases: 0, revenue: 0, roas: null, cpa: null });
    }
    const c = byAd.get(key)!;
    c.spend += num(r.spend);
    c.impressions += r.impressions;
    c.clicks += siteClicks(r);
  }

  const leadById = new Map(leads.map((l) => [l.id, l]));
  for (const p of purchases) {
    const lead = p.lead_id ? leadById.get(p.lead_id) : undefined;
    const content = (lead?.utm_content ?? "").trim();
    if (!content) continue;
    const key = `${normalizePlatform(lead?.utm_source ?? null)}::${content}`;
    const c = byAd.get(key);
    if (!c) continue;
    c.purchases += 1;
    c.revenue += p.amount;
  }

  for (const c of byAd.values()) {
    c.ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : null;
    c.cpc = c.clicks > 0 ? c.spend / c.clicks : null;
    c.roas = c.spend > 0 ? c.revenue / c.spend : null;
    c.cpa = c.purchases > 0 ? c.spend / c.purchases : null;
  }
  return [...byAd.values()];
}

/** 上位・下位（ROASがあればROAS、無ければCTRで並べる） */
export function rankCreatives(rows: CreativeRow[], n = 3) {
  const scored = rows.filter((r) => r.impressions >= 100 || r.spend >= 1000);
  const hasRoas = scored.some((r) => r.roas !== null && r.roas > 0);
  const score = (r: CreativeRow) => (hasRoas ? r.roas ?? -1 : r.ctr ?? -1);
  const sorted = [...scored].sort((a, b) => score(b) - score(a));
  return { top: sorted.slice(0, n), bottom: sorted.length > n ? sorted.slice(-n).reverse() : [], by: hasRoas ? "ROAS" : "CTR" } as const;
}

export type FunnelStep = { key: string; label: string; value: number; rateFromPrev: number | null; note: string };

/** 媒体ごとのファネル。広告側（表示→クリック）と自社側（訪問→登録→決済開始→購入）をつなぐ */
export function funnel(t: Totals): FunnelStep[] {
  const steps = [
    { key: "impressions", label: "広告が表示された", value: t.impressions, note: "インプレッション" },
    { key: "clicks", label: "クリックした", value: t.clicks, note: "リンククリック" },
    { key: "visitors", label: "サイトに来た", value: t.visitors, note: "自社DBで数えた訪問者（クリックより少なければ、読み込み前の離脱）" },
    { key: "leads", label: "メールを登録した", value: t.leads, note: "無料レッスンの入口" },
    { key: "checkouts", label: "決済画面へ進んだ", value: t.checkouts, note: "申し込みボタンを押した数" },
    { key: "purchases", label: "購入した", value: t.purchases, note: "CV" },
  ];
  return steps.map((s, i) => ({
    ...s,
    rateFromPrev: i === 0 ? null : steps[i - 1].value > 0 ? (s.value / steps[i - 1].value) * 100 : null,
  }));
}

/** 購入者ごとの累計（LTV の素朴版） */
export function ltv(purchases: PurchaseRow[]) {
  const byEmail = new Map<string, number>();
  for (const p of purchases) {
    const k = (p.email ?? "").toLowerCase();
    if (!k) continue;
    byEmail.set(k, (byEmail.get(k) ?? 0) + p.amount);
  }
  const buyers = byEmail.size;
  const total = [...byEmail.values()].reduce((s, v) => s + v, 0);
  const repeat = [...byEmail.values()].filter((v) => v > 0).length; // 1人1講座なので当面は buyers と同じ
  return { buyers, avg: buyers ? total / buyers : null, repeatBuyers: repeat };
}
