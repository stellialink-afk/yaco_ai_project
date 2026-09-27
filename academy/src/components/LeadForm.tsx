"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * 無料視聴の入口。メールを登録 → lead を作成 → ログイン（認証コード）へ。
 */
export default function LeadForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "lp_free_preview" }),
      });
      if (!res.ok) throw new Error();
      router.push(`/signin?email=${encodeURIComponent(email)}&next=${encodeURIComponent("/learn")}`);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-md flex-col sm:flex-row gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="メールアドレス"
        className="flex-1 rounded-md border border-line bg-card px-4 py-3 outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-accent text-white px-6 py-3 font-medium hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "送信中…" : "第1回を無料で見る"}
      </button>
      {status === "error" && <p className="text-xs text-danger sm:col-span-2">登録に失敗しました。もう一度お試しください。</p>}
    </form>
  );
}
