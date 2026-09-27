import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { siteUrl } from "@/lib/site";
import { readTrackingContext, trackEvent } from "@/lib/track";

type Plan = "personal" | "business";

/** Stripe Checkout セッションを作成して URL を返す */
export async function POST(request: Request) {
  let body: { plan?: Plan; courseSlug?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const plan = body.plan;
  if (plan !== "personal" && plan !== "business") return NextResponse.json({ error: "invalid plan" }, { status: 400 });
  if (!body.courseSlug) return NextResponse.json({ error: "course required" }, { status: 400 });

  try {
    return await createCheckout(plan, body.courseSlug);
  } catch (err) {
    console.error("[checkout] failed", err);
    return NextResponse.json({ error: "決済の準備に失敗しました。時間をおいて再度お試しください。" }, { status: 500 });
  }
}

async function createCheckout(plan: Plan, courseSlug: string) {
  const admin = createAdminClient();
  const { data: course } = await admin
    .from("courses")
    .select("id, slug, title, price_personal, price_business, presale_seats_personal, presale_seats_business, is_published")
    .eq("slug", courseSlug)
    .maybeSingle();
  if (!course || !course.is_published) return NextResponse.json({ error: "course not found" }, { status: 404 });

  // 先行枠の残数チェック
  const seats = plan === "personal" ? course.presale_seats_personal : course.presale_seats_business;
  if (seats > 0) {
    const { count } = await admin.from("purchases").select("id", { count: "exact", head: true }).eq("course_id", course.id).eq("plan", plan).eq("status", "paid");
    if ((count ?? 0) >= seats) return NextResponse.json({ error: "先行枠は満席です" }, { status: 409 });
  }

  const amount = plan === "personal" ? course.price_personal : course.price_business;
  if (!amount || amount <= 0) return NextResponse.json({ error: "price not set" }, { status: 400 });

  const ctx = await readTrackingContext();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const stripe = getStripe();
  const base = siteUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    currency: "jpy",
    customer_email: user?.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "jpy",
          unit_amount: amount,
          product_data: {
            name: `${course.title}（${plan === "personal" ? "個人プラン" : "法人プラン"}）`,
          },
        },
      },
    ],
    // 法人は請求書払いも案内するため、カード以外は Stripe ダッシュボード側で有効化
    allow_promotion_codes: true,
    invoice_creation: { enabled: true },
    success_url: `${base}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/#plans`,
    metadata: {
      course_id: course.id,
      plan,
      lead_id: ctx.leadId ?? "",
      visitor_id: ctx.visitorId ?? "",
      user_id: user?.id ?? "",
      utm_source: ctx.attribution?.utm_source ?? "",
      utm_campaign: ctx.attribution?.utm_campaign ?? "",
    },
  });

  await trackEvent({
    name: "checkout_start",
    visitorId: ctx.visitorId,
    leadId: ctx.leadId,
    userId: user?.id ?? null,
    attribution: ctx.attribution,
    props: { plan, course: course.slug, amount, stripe_session_id: session.id },
  });

  return NextResponse.json({ url: session.url });
}
