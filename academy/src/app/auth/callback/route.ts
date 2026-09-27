import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readTrackingContext, upsertLead } from "@/lib/track";

/** マジックリンクのコールバック。code をセッションに交換し、lead と本人を紐づける。 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/learn";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const email = data.user?.email;
      if (email) {
        const ctx = await readTrackingContext();
        await upsertLead({ email, visitorId: ctx.visitorId, attribution: ctx.attribution, userId: data.user.id }).catch(() => null);
      }
      return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/learn"}`);
    }
  }
  return NextResponse.redirect(`${origin}/signin?error=auth_failed`);
}
