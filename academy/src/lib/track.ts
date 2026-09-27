import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ATTRIB_COOKIE,
  LEAD_COOKIE,
  VISITOR_COOKIE,
  readAttributionCookie,
  type Attribution,
} from "@/lib/attribution";

export type EventName =
  | "page_view"
  | "lead"
  | "checkout_start"
  | "purchase"
  | "lesson_view"
  | "lesson_complete";

/** リクエストの Cookie から計測用の識別子をまとめて読む（サーバー専用） */
export async function readTrackingContext() {
  const jar = await cookies();
  return {
    visitorId: jar.get(VISITOR_COOKIE)?.value ?? null,
    leadId: jar.get(LEAD_COOKIE)?.value ?? null,
    attribution: readAttributionCookie(jar.get(ATTRIB_COOKIE)?.value),
  };
}

/** イベントを1件記録する。失敗しても画面は止めない。 */
export async function trackEvent(input: {
  name: EventName;
  path?: string | null;
  props?: Record<string, unknown>;
  visitorId?: string | null;
  leadId?: string | null;
  userId?: string | null;
  attribution?: Attribution | null;
}) {
  try {
    const admin = createAdminClient();
    const props = { ...(input.props ?? {}) } as Record<string, unknown>;
    // lead が未作成の段階でも流入元で集計できるよう、props にも source を残す
    if (input.attribution?.utm_source && !props.utm_source) {
      props.utm_source = input.attribution.utm_source;
    }
    await admin.from("events").insert({
      name: input.name,
      path: input.path ?? null,
      props,
      visitor_id: input.visitorId ?? null,
      lead_id: input.leadId ?? null,
      user_id: input.userId ?? null,
    });
  } catch (err) {
    console.error("[track] failed", err);
  }
}

/**
 * メールアドレスから lead を作成 or 更新し、lead_id を返す。
 * 流入元は「初回タッチ」を優先し、空欄のときだけ埋める。
 */
export async function upsertLead(input: {
  email: string;
  visitorId: string | null;
  attribution: Attribution | null;
  userId?: string | null;
}): Promise<string | null> {
  const admin = createAdminClient();
  const email = input.email.trim().toLowerCase();
  if (!email) return null;

  const { data: existing } = await admin
    .from("leads")
    .select("id, utm_source")
    .eq("email", email)
    .maybeSingle();

  const a = input.attribution ?? {};
  const attribFields = {
    utm_source: a.utm_source ?? null,
    utm_medium: a.utm_medium ?? null,
    utm_campaign: a.utm_campaign ?? null,
    utm_content: a.utm_content ?? null,
    utm_term: a.utm_term ?? null,
    gclid: a.gclid ?? null,
    fbclid: a.fbclid ?? null,
    ttclid: a.ttclid ?? null,
    landing_path: a.landing_path ?? null,
    referrer: a.referrer ?? null,
    first_seen_at: a.first_seen_at ?? null,
  };

  if (existing) {
    const patch: Record<string, unknown> = {};
    if (input.visitorId) patch.visitor_id = input.visitorId;
    if (input.userId) patch.user_id = input.userId;
    // 流入元が未記録なら今回の値で埋める
    if (!existing.utm_source && a.utm_source) Object.assign(patch, attribFields);
    if (Object.keys(patch).length) {
      await admin.from("leads").update(patch).eq("id", existing.id);
    }
    return existing.id as string;
  }

  const { data: created, error } = await admin
    .from("leads")
    .insert({
      email,
      visitor_id: input.visitorId,
      user_id: input.userId ?? null,
      ...attribFields,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[lead] insert failed", error);
    return null;
  }
  return created.id as string;
}
