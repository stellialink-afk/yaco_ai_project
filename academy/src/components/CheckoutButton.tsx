"use client";

import { useState } from "react";

export default function CheckoutButton(props: {
  plan: "personal" | "business";
  courseSlug: string;
  label: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: props.plan, courseSlug: props.courseSlug }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || "決済ページを開けませんでした");
      window.location.href = json.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={start}
        disabled={loading || props.disabled}
        className="w-full rounded-md bg-gold text-accent font-semibold py-3.5 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {props.disabled ? "先行枠は満席です" : loading ? "決済ページへ移動中…" : props.label}
      </button>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
