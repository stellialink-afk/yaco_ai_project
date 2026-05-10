"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "登録に失敗しました");
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "登録に失敗しました"
      );
    }
  }

  if (status === "success") {
    return (
      <p
        className="font-[family-name:var(--font-display)] italic text-base tracking-[0.08em] py-3"
        style={{ color: "var(--gold)" }}
      >
        — お待ちしています。準備が整い次第、ご連絡します。 —
      </p>
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
        disabled={status === "submitting"}
        className="w-full bg-transparent border-0 border-b text-center py-2 px-1 outline-none transition-colors text-sm tracking-[0.06em]"
        style={{
          borderBottomColor: "var(--line)",
          color: "var(--ink)",
        }}
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 px-8 py-3 border font-[family-name:var(--font-display)] italic text-xs sm:text-sm tracking-[0.24em] uppercase transition-opacity disabled:opacity-50 hover:opacity-80"
        style={{
          borderColor: "var(--gold)",
          color: "var(--gold)",
        }}
      >
        {status === "submitting" ? "Sending…" : "— Send —"}
      </button>
      {status === "error" && (
        <p className="text-xs mt-2" style={{ color: "#c87575" }}>
          {errorMessage}
        </p>
      )}
    </form>
  );
}
