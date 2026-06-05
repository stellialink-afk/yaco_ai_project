"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SigninForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [status, setStatus] = useState<"idle" | "sending" | "verifying">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function sendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("idle");
      setErrorMessage(
        error.message.includes("rate")
          ? "少し時間をおいてから再度お試しください。"
          : "送信に失敗しました。もう一度お試しください。"
      );
    } else {
      setStatus("idle");
      setStep("code");
    }
  }

  async function verifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedCode = code.trim();
    if (!trimmedCode || trimmedCode.length < 6) {
      setErrorMessage("メールに記載された認証コードを入力してください。");
      return;
    }

    setStatus("verifying");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: trimmedCode,
      type: "email",
    });

    if (error) {
      setStatus("idle");
      setErrorMessage(
        error.message.includes("expired")
          ? "認証コードの有効期限が切れました。もう一度コードを送信してください。"
          : "認証コードが正しくありません。もう一度確認してください。"
      );
    } else {
      router.refresh();
      router.push("/");
    }
  }

  function goBackToEmail() {
    setStep("email");
    setCode("");
    setErrorMessage("");
  }

  // ───── Step 2: Enter the 6-digit code from email ─────
  if (step === "code") {
    return (
      <form
        onSubmit={verifyCode}
        className="flex flex-col items-center w-full max-w-sm gap-3"
      >
        <p
          className="text-[13px] leading-[1.8] tracking-[0.06em] text-center mb-4"
          style={{ color: "var(--ink-soft)" }}
        >
          <span style={{ color: "var(--gold)" }}>{email}</span>{" "}
          宛に
          <br />
          認証コードを送信しました。
        </p>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="00000000"
          disabled={status === "verifying"}
          autoFocus
          className="w-full bg-transparent border-0 border-b text-center py-3 px-1 outline-none transition-colors tracking-[0.35em] text-2xl"
          style={{
            borderBottomColor: "var(--line)",
            color: "var(--ink)",
            fontVariantNumeric: "tabular-nums",
          }}
        />

        <button
          type="submit"
          disabled={status === "verifying" || code.length < 6}
          className="mt-3 px-8 py-3 border font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.24em] uppercase transition-opacity disabled:opacity-50 hover:opacity-80"
          style={{
            borderColor: "var(--gold)",
            color: "var(--gold)",
          }}
        >
          {status === "verifying" ? "Verifying…" : "— Verify code —"}
        </button>

        {errorMessage && (
          <p className="text-xs mt-2" style={{ color: "#c87575" }}>
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={goBackToEmail}
          className="mt-6 font-[family-name:var(--font-display)] italic text-[11px] tracking-[0.16em] uppercase opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: "var(--ink-mute)" }}
        >
          ← 別のメールで再送信
        </button>
      </form>
    );
  }

  // ───── Step 1: Enter email ─────
  return (
    <form
      onSubmit={sendCode}
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
        {status === "sending" ? "Sending…" : "— Send code —"}
      </button>
      {errorMessage && (
        <p className="text-xs mt-2" style={{ color: "#c87575" }}>
          {errorMessage}
        </p>
      )}
    </form>
  );
}
