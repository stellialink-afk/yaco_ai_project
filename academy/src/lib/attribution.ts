/**
 * 流入元の記録。
 * 広告（Meta / Google / TikTok）でも、YouTube概要欄やInstagramのリンクでも、
 * URL に utm_* を付けておけば同じ仕組みで追える。
 */
export const VISITOR_COOKIE = "sa_vid";
export const ATTRIB_COOKIE = "sa_attrib";
export const LEAD_COOKIE = "sa_lead";

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  landing_path?: string;
  referrer?: string;
  first_seen_at?: string;
};

const KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "ttclid",
] as const;

/**
 * クエリから流入元を抜き出す。
 * UTM もクリックIDも無く、外部リファラも無い場合は null（Cookie を作らない）。
 */
export function parseAttribution(
  params: URLSearchParams,
  ctx: { landingPath: string; referrer: string | null }
): Attribution | null {
  const out: Attribution = {};
  for (const k of KEYS) {
    const v = params.get(k);
    if (v) out[k] = v.slice(0, 200);
  }

  const ref = ctx.referrer ?? "";
  const isExternalRef = ref && !isSameSite(ref);
  if (isExternalRef) out.referrer = ref.slice(0, 500);

  if (Object.keys(out).length === 0) return null;

  out.landing_path = ctx.landingPath;
  out.first_seen_at = new Date().toISOString();
  return out;
}

function isSameSite(referrer: string) {
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    if (!site) return false;
    return new URL(referrer).host === new URL(site).host;
  } catch {
    return false;
  }
}

export function readAttributionCookie(raw: string | undefined): Attribution | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Attribution;
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}
