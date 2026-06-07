import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditForm from "./EditForm";

export const metadata: Metadata = {
  title: "Profile — Sotto.",
  description: "アーティスト名を整える",
};

type Profile = {
  user_id: string;
  display_name: string;
  bio: string | null;
};

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, display_name, bio")
    .eq("user_id", user.id)
    .single<Profile>();

  // If trigger hasn't created the profile yet (race), fall back to email prefix
  const fallbackName = user.email?.split("@")[0] ?? "";

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-20 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(184,148,92,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center text-center w-full max-w-xl">
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

        <p
          className="mt-10 font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.28em] uppercase"
          style={{ color: "var(--ink-mute)" }}
        >
          — Profile —
        </p>

        <p
          className="mt-6 text-[13px] sm:text-sm leading-[2.0] tracking-[0.08em] max-w-md"
          style={{ color: "var(--ink-soft)" }}
        >
          あなたの名前を、作品に添える。
          <br />
          いつでも変えられます。
        </p>

        <div
          className="mt-12 mb-12 h-[1px] w-24"
          style={{ background: "var(--line)" }}
        />

        <EditForm
          initialDisplayName={profile?.display_name || fallbackName}
          initialBio={profile?.bio ?? ""}
        />

        <Link
          href="/me"
          className="mt-16 font-[family-name:var(--font-display)] italic text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
          style={{ color: "var(--ink-mute)" }}
        >
          ← Back to my gallery
        </Link>
      </div>
    </main>
  );
}
