import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/**
 * Subtle top-right navigation, only shown when signed in.
 * Designed to stay out of the way of the landing hero.
 */
export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <nav
      className="fixed top-0 right-0 z-50 px-5 py-4 flex items-center gap-5"
      aria-label="Site navigation"
    >
      <HeaderLink href="/post/new">Place</HeaderLink>
      <Divider />
      <HeaderLink href="/me">My works</HeaderLink>
    </nav>
  );
}

function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-[family-name:var(--font-display)] italic text-[10px] sm:text-[11px] tracking-[0.2em] uppercase transition-opacity hover:opacity-100 opacity-60"
      style={{ color: "var(--ink-soft)" }}
    >
      {children}
    </Link>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="block h-3 w-[1px]"
      style={{ background: "var(--line)" }}
    />
  );
}
