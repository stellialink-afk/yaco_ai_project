import Link from "next/link";
import WaitlistForm from "./WaitlistForm";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const signedIn = !!user;

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center min-h-screen px-6 py-16 overflow-hidden">
      {/* subtle gradient background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(184,148,92,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center text-center max-w-xl w-full">
        {/* brand mark */}
        <h1
          className="font-[family-name:var(--font-display)] text-[64px] sm:text-[88px] leading-none tracking-[0.04em]"
          style={{ color: "var(--ink)", fontWeight: 300 }}
        >
          Sotto
          <span
            style={{ color: "var(--gold)", fontStyle: "italic" }}
            className="ml-0.5"
          >
            .
          </span>
        </h1>

        {/* tagline */}
        <p
          className="mt-6 font-[family-name:var(--font-display)] italic text-lg sm:text-xl tracking-[0.16em]"
          style={{ color: "var(--ink-soft)" }}
        >
          — Quietly, soon. —
        </p>

        {/* hero copy — main message */}
        <p
          className="mt-14 font-[family-name:var(--font-display)] text-2xl sm:text-3xl tracking-[0.08em] leading-[1.6]"
          style={{ color: "var(--ink)", fontWeight: 300 }}
        >
          音楽が空間に届く。
        </p>

        {/* concept text */}
        <p
          className="mt-10 text-[13px] sm:text-sm leading-[2.0] tracking-[0.08em] max-w-md"
          style={{ color: "var(--ink-soft)" }}
        >
          AIで作った1曲を「作品」として置く場所として。
          <br />
          やがてその音楽が
          <br />
          世界のさまざまな空間へ流れるホームとして。
          <br />
          クリエイターと場をつなぐ、新しい音楽の届けかた。
        </p>

        {/* divider */}
        <div
          className="mt-16 mb-14 h-[1px] w-24"
          style={{ background: "var(--line)" }}
        />

        {/* ───── For Creators ───── */}
        <section className="flex flex-col items-center w-full">
          <p
            className="font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.28em] uppercase"
            style={{ color: "var(--ink-mute)" }}
          >
            — For Creators —
          </p>
          <p
            className="mt-4 text-[13px] sm:text-sm leading-[1.9] tracking-[0.06em]"
            style={{ color: "var(--ink-soft)" }}
          >
            あなたの1曲を、世界の空間へ。
          </p>
          {signedIn ? (
            <div className="mt-6 flex flex-col items-center gap-3">
              <Link
                href="/post/new"
                className="px-8 py-3 border font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.24em] uppercase transition-opacity hover:opacity-80"
                style={{
                  borderColor: "var(--gold)",
                  color: "var(--gold)",
                }}
              >
                — Place a new work —
              </Link>
              <Link
                href="/me"
                className="font-[family-name:var(--font-display)] italic text-[11px] tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
                style={{ color: "var(--ink-mute)" }}
              >
                My works  →
              </Link>
            </div>
          ) : (
            <Link
              href="/signin"
              className="mt-6 px-8 py-3 border font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.24em] uppercase transition-opacity hover:opacity-80"
              style={{
                borderColor: "var(--gold)",
                color: "var(--gold)",
              }}
            >
              — Sign in to share —
            </Link>
          )}
        </section>

        {/* in-between divider */}
        <div
          className="mt-16 mb-14 h-[1px] w-16"
          style={{ background: "var(--line-soft)" }}
        />

        {/* ───── For Listeners ───── */}
        <section className="flex flex-col items-center w-full">
          <p
            className="font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.28em] uppercase"
            style={{ color: "var(--ink-mute)" }}
          >
            — For Listeners —
          </p>
          <p
            className="mt-4 text-[13px] sm:text-sm leading-[1.9] tracking-[0.06em]"
            style={{ color: "var(--ink-soft)" }}
          >
            視聴は登録不要、間もなく公開。
            <br />
            新着のお知らせを受け取る。
          </p>
          <div className="mt-6 w-full max-w-sm">
            <WaitlistForm />
          </div>
        </section>

        {/* letter link */}
        <Link
          href="/letter"
          className="mt-20 group flex flex-col items-center gap-2 transition-opacity hover:opacity-75"
        >
          <span
            className="font-[family-name:var(--font-display)] italic text-base sm:text-lg tracking-[0.24em] uppercase"
            style={{ color: "var(--gold)" }}
          >
            — Letter —
          </span>
          <span
            className="text-[11px] sm:text-xs tracking-[0.16em]"
            style={{ color: "var(--ink-soft)" }}
          >
            Sotto.の想いを読む  →
          </span>
        </Link>

        {/* footer */}
        <p
          className="mt-16 font-[family-name:var(--font-display)] italic text-xs tracking-[0.16em]"
          style={{ color: "var(--ink-mute)" }}
        >
          Sotto · 2026
        </p>
      </div>
    </main>
  );
}
