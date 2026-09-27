import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readTrackingContext, trackEvent, type EventName } from "@/lib/track";

const ALLOWED: EventName[] = ["page_view", "lesson_view"];

/** ブラウザからの軽い行動ログ（page_view など）。重要イベントはサーバー側で記録する。 */
export async function POST(request: Request) {
  let body: { name?: string; path?: string; props?: Record<string, unknown> } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const name = body.name as EventName;
  if (!ALLOWED.includes(name)) return NextResponse.json({ ok: false }, { status: 400 });

  const ctx = await readTrackingContext();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await trackEvent({
    name,
    path: typeof body.path === "string" ? body.path.slice(0, 300) : null,
    props: body.props ?? {},
    visitorId: ctx.visitorId,
    leadId: ctx.leadId,
    userId: user?.id ?? null,
    attribution: ctx.attribution,
  });
  return NextResponse.json({ ok: true });
}
