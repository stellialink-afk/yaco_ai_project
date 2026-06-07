import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostForm from "./PostForm";

export const metadata: Metadata = {
  title: "New work — Sotto.",
  description: "新しい作品を置く",
};

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-20 overflow-hidden">
      {/* subtle gradient background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(184,148,92,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center text-center w-full max-w-2xl">
        {/* brand mark */}
        <Link href="/" aria-label="Sotto. home">
          <h2
            className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl tracking-[0.06em] transition-opacity hover:opacity-70"
            style={{ color: "var(--ink)", fontWeight: 300 }}
          >
            Sotto
            <span
              style={{ color: "var(--gold)", fontStyle: "italic" }}
              className="ml-0.5"
            >
              .
            </span>
          </h2>
        </Link>

        {/* page label */}
        <p
          className="mt-10 font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.28em] uppercase"
          style={{ color: "var(--ink-mute)" }}
        >
          — Place a new work —
        </p>

        <p
          className="mt-6 text-[13px] sm:text-sm leading-[2.0] tracking-[0.08em] max-w-md"
          style={{ color: "var(--ink-soft)" }}
        >
          1曲を、静かにここに置く。
          <br />
          余白を残し、誠実に。
        </p>

        {/* divider */}
        <div
          className="mt-12 mb-12 h-[1px] w-24"
          style={{ background: "var(--line)" }}
        />

        {/* form */}
        <PostForm userId={user.id} />

        {/* back link */}
        <Link
          href="/me"
          className="mt-20 font-[family-name:var(--font-display)] italic text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
          style={{ color: "var(--ink-mute)" }}
        >
          ← Back to my works
        </Link>
      </div>
    </main>
  );
}
