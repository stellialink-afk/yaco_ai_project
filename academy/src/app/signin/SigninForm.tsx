"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SigninForm({ initialEmail, next }: { initialEmail: string; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [status, setStatus] = useState<"idle" | "sending" | "verifying">("idle");
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
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setStatus("idle");
    if (error) {
      setErrorMessage(error.message.includes("rate") ? "少し時間をおいてから再度お試しください。" : "送信に失敗しました。もう一度お試しください。");
    } else {
      setStep("code");
    }
  }

  async function verifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = code.trim();
    if (t.length < 6) {
      setErrorMessage("メールに記載された認証コードを入力してください。");
      return;
    }
    setStatus("verifying");
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: t, type: "email" });
    if (error) {
      setStatus("idle");
      setErrorMessage(error.message.includes("expired") ? "認証コードの有効期限が切れました。もう一度送信してください。" : "認証コードが正しくありません。");
    } else {
      // lead とログインユーザーを紐づける（失敗しても進む）
      fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), source: "signin" }) }).catch(() => {});
      router.refresh();
      router.push(next);
    }
  }

  const input = "w-full rounded-md border border-line bg-card px-4 py-3 outline-none focus:border-gold";
  const button = "w-full rounded-md bg-accent text-white py-3 font-medium hover:opacity-90 disabled:opacity-50";

  if (step === "code") {
    return (
      <form onSubmit={verifyCode} className="flex flex-col gap-3">
        <p className="text-sm text-ink-soft">
          <span className="font-medium text-ink">{email}</span> 宛に認証コードを送信しました。
        </p>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="認証コード"
          disabled={status === "verifying"}
          className={`${input} text-center tracking-[0.3em] text-xl`}
        />
        <button type="submit" disabled={status === "verifying" || code.length < 6} className={button}>
          {status === "verifying" ? "確認中…" : "ログイン"}
        </button>
        {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
        <button type="button" onClick={() => { setStep("email"); setCode(""); setErrorMessage(""); }} className="text-xs text-ink-mute hover:text-ink mt-2">
          ← 別のメールアドレスで送り直す
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="flex flex-col gap-3">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" disabled={status === "sending"} className={input} />
      <button type="submit" disabled={status === "sending"} className={button}>
        {status === "sending" ? "送信中…" : "認証コードを送る"}
      </button>
      {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
    </form>
  );
}
