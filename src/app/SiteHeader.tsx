import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/**
 * Top navigation. Only renders when the user is signed in.
 * Goal: clearly visible without overpowering the dark gallery aesthetic.
 */
export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{
        background: "rgba(10, 9, 8, 0.72)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <nav
        className="flex items-center justify-end max-w-6xl mx-auto px-6 py-3 gap-5 sm:gap-8"
        aria-label="Site navigation"
      >
        <HeaderLink href="/post/new">作品を置く</HeaderLink>
        <Divider />
        <HeaderLink href="/me">My Gallery</HeaderLink>
      </nav>
    </header>
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
      className="font-[family-name:var(--font-jp)] text-[13px] sm:text-sm tracking-[0.12em] transition-opacity hover:opacity-70"
      style={{ color: "var(--gold)", fontWeight: 400 }}
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
