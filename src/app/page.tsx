import Link from "next/link";
import WaitlistForm from "./WaitlistForm";

export default function Home() {
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
          className="mt-16 mb-12 h-[1px] w-24"
          style={{ background: "var(--line)" }}
        />

        {/* waitlist label */}
        <p
          className="font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.2em] uppercase mb-6"
          style={{ color: "var(--ink-mute)" }}
        >
          — Join the waitlist —
        </p>

        {/* waitlist form */}
        <WaitlistForm />

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
          className="mt-12 font-[family-name:var(--font-display)] italic text-xs tracking-[0.16em]"
          style={{ color: "var(--ink-mute)" }}
        >
          Sotto · 2026
        </p>
      </div>
    </main>
  );
}
