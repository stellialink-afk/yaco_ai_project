"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SigninForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(
        error.message.includes("rate")
          ? "少し時間をおいてから再度お試しください。"
          : "送信に失敗しました。もう一度お試しください。"
      );
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center text-center max-w-sm">
        <p
          className="font-[family-name:var(--font-display)] italic text-base sm:text-lg tracking-[0.12em] mb-4"
          style={{ color: "var(--gold)" }}
        >
          — メールを送りました —
        </p>
        <p
          className="text-[13px] leading-[2.0] tracking-[0.06em]"
          style={{ color: "var(--ink-soft)" }}
        >
          受信ボックスを確認してください。
          <br />
          メールに記載されたリンクをクリックすると、
          <br />
          Sotto.にログインできます。
        </p>
        <p
          className="mt-8 text-[11px] tracking-[0.1em]"
          style={{ color: "var(--ink-mute)" }}
        >
          メールが届かない場合は、迷惑メールフォルダもご確認ください。
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center w-full max-w-sm gap-3"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        disabled={status === "sending"}
        className="w-full bg-transparent border-0 border-b text-center py-2 px-1 outline-none transition-colors text-sm tracking-[0.06em]"
        style={{
          borderBottomColor: "var(--line)",
          color: "var(--ink)",
        }}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 px-8 py-3 border font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.24em] uppercase transition-opacity disabled:opacity-50 hover:opacity-80"
        style={{
          borderColor: "var(--gold)",
          color: "var(--gold)",
        }}
      >
        {status === "sending" ? "Sending…" : "— Send magic link —"}
      </button>
      {status === "error" && (
        <p className="text-xs mt-2" style={{ color: "#c87575" }}>
          {errorMessage}
        </p>
      )}
    </form>
  );
}
