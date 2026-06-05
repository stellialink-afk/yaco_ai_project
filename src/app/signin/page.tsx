import type { Metadata } from "next";
import Link from "next/link";
import SigninForm from "./SigninForm";

export const metadata: Metadata = {
  title: "Sign in — Sotto.",
  description: "クリエイターとしてSotto.に入る",
};

export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "auth_failed";

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
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
        {/* brand mark (linked back home) */}
        <Link href="/" aria-label="Sotto. home">
          <h2
            className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-[0.06em] transition-opacity hover:opacity-70"
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

        {/* signin label */}
        <p
          className="mt-14 font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.28em] uppercase"
          style={{ color: "var(--ink-mute)" }}
        >
          — Sign in to share —
        </p>

        {/* concept text */}
        <p
          className="mt-10 text-[13px] sm:text-sm leading-[2.0] tracking-[0.08em] max-w-md"
          style={{ color: "var(--ink-soft)" }}
        >
          メールアドレスを入力すると、
          <br />
          認証コードが届きます。
          <br />
          パスワード不要でログインできます。
        </p>

        {/* divider */}
        <div
          className="mt-14 mb-10 h-[1px] w-24"
          style={{ background: "var(--line)" }}
        />

        {/* signin form */}
        <SigninForm />

        {/* error banner */}
        {hasError && (
          <p
            className="mt-6 text-xs tracking-[0.06em]"
            style={{ color: "#c87575" }}
          >
            認証に失敗しました。もう一度メールを送信してください。
          </p>
        )}

        {/* sub text */}
        <p
          className="mt-12 text-[11px] tracking-[0.1em] max-w-sm"
          style={{ color: "var(--ink-mute)" }}
        >
          初めての方も、登録済みの方も、
          <br />
          同じフォームで進めます。
        </p>

        {/* back link */}
        <Link
          href="/"
          className="mt-20 font-[family-name:var(--font-display)] italic text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
          style={{ color: "var(--ink-mute)" }}
        >
          ← Back to Sotto.
        </Link>
      </div>
    </main>
  );
}
