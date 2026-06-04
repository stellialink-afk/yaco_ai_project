import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Magic link callback handler.
 * After user clicks the link in their email, Supabase redirects here
 * with a `code` query param. We exchange it for a session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — send back to signin with error flag.
  return NextResponse.redirect(`${origin}/signin?error=auth_failed`);
}
