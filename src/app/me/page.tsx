import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

export const metadata: Metadata = {
  title: "My Gallery — Sotto.",
  description: "あなたの作品一覧",
};

type WorkSummary = {
  id: string;
  title: string;
  concept: string | null;
  cover_url: string;
  visibility: "public" | "unlisted" | "draft";
  created_at: string;
};

type Profile = {
  display_name: string;
  bio: string | null;
};

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const [worksRes, profileRes] = await Promise.all([
    supabase
      .from("works")
      .select("id, title, concept, cover_url, visibility, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<WorkSummary[]>(),
    supabase
      .from("profiles")
      .select("display_name, bio")
      .eq("user_id", user.id)
      .single<Profile>(),
  ]);

  const list = worksRes.data ?? [];
  const profile = profileRes.data;
  const fallbackName = user.email?.split("@")[0] ?? "";
  const displayName = profile?.display_name?.trim() || fallbackName;

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(184,148,92,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center text-center w-full max-w-3xl">
        {/* brand */}
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
          className="mt-8 font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.28em] uppercase"
          style={{ color: "var(--ink-mute)" }}
        >
          — My Gallery —
        </p>

        {/* artist name */}
        <p
          className="mt-4 font-[family-name:var(--font-display)] text-xl sm:text-2xl tracking-[0.04em]"
          style={{ color: "var(--ink)", fontWeight: 300 }}
        >
          {displayName}
        </p>
        {profile?.bio && (
          <p
            className="mt-3 text-[12px] tracking-[0.06em] leading-[1.8] max-w-md"
            style={{ color: "var(--ink-soft)" }}
          >
            {profile.bio}
          </p>
        )}
        <p
          className="mt-2 text-[11px] tracking-[0.06em]"
          style={{ color: "var(--ink-mute)" }}
        >
          {user.email}
        </p>
        <Link
          href="/me/edit"
          className="mt-3 font-[family-name:var(--font-display)] italic text-[11px] tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
          style={{ color: "var(--ink-mute)" }}
        >
          Edit profile  →
        </Link>

        {/* new post button */}
        <Link
          href="/post/new"
          className="mt-10 px-10 py-3 border font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.24em] uppercase transition-opacity hover:opacity-80"
          style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
        >
          — Place a new work —
        </Link>

        {/* divider */}
        <div
          className="mt-16 mb-12 h-[1px] w-24"
          style={{ background: "var(--line)" }}
        />

        {/* works grid */}
        {list.length === 0 ? (
          <p
            className="mt-8 text-[13px] tracking-[0.06em] leading-[2.0]"
            style={{ color: "var(--ink-soft)" }}
          >
            まだ作品はありません。
            <br />
            最初の1曲を、静かに置いてみましょう。
          </p>
        ) : (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {list.map((w: WorkSummary) => (
              <Link
                key={w.id}
                href={`/works/${w.id}`}
                className="group flex flex-col items-start text-left transition-opacity hover:opacity-80"
              >
                <div
                  className="w-full aspect-square mb-3"
                  style={{ border: "1px solid var(--line)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.cover_url}
                    alt={w.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3
                  className="font-[family-name:var(--font-display)] text-base tracking-[0.04em] leading-[1.4]"
                  style={{ color: "var(--ink)", fontWeight: 300 }}
                >
                  {w.title}
                </h3>
                {w.concept && (
                  <p
                    className="mt-1 text-[11px] tracking-[0.04em] leading-[1.6] line-clamp-2"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {w.concept}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="font-[family-name:var(--font-display)] italic text-[10px] tracking-[0.16em] uppercase"
                    style={{
                      color:
                        w.visibility === "public"
                          ? "var(--gold)"
                          : "var(--ink-mute)",
                    }}
                  >
                    {w.visibility}
                  </span>
                  <span
                    className="text-[10px] tracking-[0.04em]"
                    style={{ color: "var(--ink-mute)" }}
                  >
                    · {formatDate(w.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* footer nav */}
        <div className="mt-20 flex flex-col items-center gap-6">
          <SignOutButton />
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] italic text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
            style={{ color: "var(--ink-mute)" }}
          >
            ← Back to Sotto.
          </Link>
        </div>
      </div>
    </main>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
