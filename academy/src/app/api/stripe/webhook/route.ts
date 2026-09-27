import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { trackEvent, upsertLead } from "@/lib/track";

/**
 * Stripe Webhook: checkout.session.completed
 *  1. purchases に記録（同じセッションは二重登録しない）
 *  2. メールからユーザーを探す／なければ作成
 *  3. enrollments を作成（受講権限）
 *  4. lead を本人に紐づけ、"purchase" イベントを記録
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = request.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "webhook not configured" }, { status: 400 });

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[stripe] bad signature", err);
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true });

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") return NextResponse.json({ received: true });

  const md = session.metadata ?? {};
  const courseId = md.course_id;
  const plan = md.plan === "business" ? "business" : "personal";
  const email = (session.customer_details?.email ?? session.customer_email ?? "").toLowerCase();
  if (!courseId || !email) {
    console.error("[stripe] missing metadata", { courseId, email });
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();

  // 1. purchases（冪等）
  const { data: existing } = await admin.from("purchases").select("id").eq("stripe_session_id", session.id).maybeSingle();
  if (existing) return NextResponse.json({ received: true, duplicate: true });

  // 2. ユーザーを探す／作る
  let userId: string | null = md.user_id || null;
  if (!userId) {
    const { data: prof } = await admin.from("profiles").select("user_id").ilike("email", email).maybeSingle();
    userId = prof?.user_id ?? null;
  }
  if (!userId) {
    const { data: created, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (error) console.error("[stripe] createUser failed", error);
    userId = created?.user?.id ?? null;
  }

  // 3. lead 紐づけ
  const leadId = await upsertLead({
    email,
    visitorId: md.visitor_id || null,
    attribution: md.utm_source ? { utm_source: md.utm_source, utm_campaign: md.utm_campaign || undefined } : null,
    userId,
  });

  // 4. purchase 記録
  const { error: pErr } = await admin.from("purchases").insert({
    lead_id: leadId,
    user_id: userId,
    course_id: courseId,
    plan,
    channel: "direct",
    amount: session.amount_total ?? 0,
    currency: session.currency ?? "jpy",
    email,
    stripe_session_id: session.id,
    stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
    status: "paid",
  });
  if (pErr) console.error("[stripe] purchase insert failed", pErr);

  // 5. 受講権限
  if (userId) {
    const { error: eErr } = await admin
      .from("enrollments")
      .upsert({ user_id: userId, course_id: courseId, plan, source: "stripe", status: "active" }, { onConflict: "user_id,course_id" });
    if (eErr) console.error("[stripe] enrollment failed", eErr);
  }

  await trackEvent({
    name: "purchase",
    visitorId: md.visitor_id || null,
    leadId,
    userId,
    attribution: md.utm_source ? { utm_source: md.utm_source } : null,
    props: { plan, course_id: courseId, amount: session.amount_total ?? 0, stripe_session_id: session.id },
  });

  return NextResponse.json({ received: true });
}
