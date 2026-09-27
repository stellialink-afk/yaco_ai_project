import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SITE_NAME, isAdminEmail } from "@/lib/site";

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-line bg-bg/90 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-5xl px-5 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-wide">
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/learn" className="hover:text-gold">
            講座を見る
          </Link>
          {user ? (
            <>
              {isAdminEmail(user.email) && (
                <Link href="/admin" className="hover:text-gold">
                  管理
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button className="text-ink-mute hover:text-ink" type="submit">
                  ログアウト
                </button>
              </form>
            </>
          ) : (
            <Link href="/signin" className="hover:text-gold">
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
