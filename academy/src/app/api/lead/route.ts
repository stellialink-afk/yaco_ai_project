import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { LEAD_COOKIE } from "@/lib/attribution";
import { readTrackingContext, trackEvent, upsertLead } from "@/lib/track";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** メール登録 → lead 作成/更新 → lead Cookie 発行 → "lead" イベント記録 */
export async function POST(request: Request) {
  let body: { email?: string; source?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "invalid email" }, { status: 400 });

  const ctx = await readTrackingContext();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const leadId = await upsertLead({ email, visitorId: ctx.visitorId, attribution: ctx.attribution, userId: user?.id ?? null });
  if (!leadId) return NextResponse.json({ error: "lead failed" }, { status: 500 });

  const jar = await cookies();
  const isNewLeadCookie = jar.get(LEAD_COOKIE)?.value !== leadId;
  jar.set(LEAD_COOKIE, leadId, { maxAge: 60 * 60 * 24 * 365, sameSite: "lax", path: "/" });

  if (isNewLeadCookie) {
    await trackEvent({ name: "lead", visitorId: ctx.visitorId, leadId, userId: user?.id ?? null, attribution: ctx.attribution, props: { source: body.source ?? "unknown" } });
  }
  return NextResponse.json({ ok: true });
}
