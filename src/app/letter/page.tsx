import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Letter — Sotto.",
  description:
    "Sottoを作った想い。AIで作った1曲を「作品」として置く場所として。",
  openGraph: {
    title: "Letter from yaco. — Sotto.",
    description: "Sottoを作った想い",
    type: "article",
    locale: "ja_JP",
  },
};

export default function Letter() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
      {/* subtle gradient background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 25%, rgba(184,148,92,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-lg flex flex-col items-center">
        {/* brand mark (linked back home) */}
        <Link href="/" aria-label="Sotto. home">
          <h2
            className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-[0.06em] text-center transition-opacity hover:opacity-70"
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

        {/* letter label */}
        <p
          className="mt-14 mb-12 font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.28em] uppercase text-center"
          style={{ color: "var(--ink-mute)" }}
        >
          — Letter —
        </p>

        {/* body */}
        <article
          className="text-[14px] sm:text-[15px] leading-[2.2] tracking-[0.06em] w-full"
          style={{ color: "var(--ink-soft)" }}
        >
          <p className="text-center" style={{ color: "var(--ink)" }}>
            Sottoは、AIで作った1曲を
            <br />
            「作品」として置く場所です。
          </p>

          <p className="mt-12 text-center">
            仕事でAIを毎日使う中で
            <br />
            AI音楽を作るクリエイターたちが
            <br />
            自分の作品をどこに置けばいいか
            <br />
            自分の作品をもっと活かしたい
            <br />
            作った先は？
            <br />
            と考えているのを目の当たりにしてきました。
          </p>

          <p className="mt-12 text-center">
            Sotto.をきっかけに
            <br />
            個性や才能である星と星、音と場が繋がり
            <br />
            輝いていただけたら嬉しいです。
          </p>
        </article>

        {/* divider */}
        <div
          className="mt-20 h-[1px] w-16"
          style={{ background: "var(--line)" }}
        />

        {/* signature — The Sotto Lounge Project */}
        <p
          className="mt-10 font-[family-name:var(--font-display)] italic text-sm sm:text-base tracking-[0.2em]"
          style={{ color: "var(--gold)" }}
        >
          The Sotto Lounge Project
        </p>

        {/* back link */}
        <Link
          href="/"
          className="mt-24 font-[family-name:var(--font-display)] italic text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
          style={{ color: "var(--ink-mute)" }}
        >
          ← Back to Sotto.
        </Link>
      </div>
    </main>
  );
}
