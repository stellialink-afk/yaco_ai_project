"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditForm({
  initialDisplayName,
  initialBio,
}: {
  initialDisplayName: string;
  initialBio: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) {
      setErrorMessage("アーティスト名を入力してください。");
      return;
    }
    if (name.length > 40) {
      setErrorMessage("アーティスト名は40文字以内にしてください。");
      return;
    }

    setStatus("saving");
    setErrorMessage("");
    setSavedFlash(false);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus("idle");
      setErrorMessage("セッションが切れました。再度サインインしてください。");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          display_name: name,
          bio: bio.trim() || null,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      setStatus("idle");
      setErrorMessage(`保存に失敗しました: ${error.message}`);
      return;
    }

    setStatus("idle");
    setSavedFlash(true);
    router.refresh();
    setTimeout(() => setSavedFlash(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-10 text-left">
      {/* ───── display name ───── */}
      <div className="flex flex-col w-full">
        <div className="flex items-baseline justify-between mb-2">
          <span
            className="font-[family-name:var(--font-display)] italic text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--ink-mute)" }}
          >
            Artist name <span style={{ color: "var(--gold)" }}>*</span>
          </span>
          <span
            className="text-[10px] tracking-[0.04em]"
            style={{ color: "var(--ink-mute)" }}
          >
            最大40字
          </span>
        </div>
        <input
          type="text"
          required
          maxLength={40}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="あなたの名前"
          disabled={status === "saving"}
          className="w-full bg-transparent border-0 border-b py-2 px-1 outline-none text-base tracking-[0.04em]"
          style={{ borderBottomColor: "var(--line)", color: "var(--ink)" }}
        />
      </div>

      {/* ───── bio ───── */}
      <div className="flex flex-col w-full">
        <div className="flex items-baseline justify-between mb-2">
          <span
            className="font-[family-name:var(--font-display)] italic text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--ink-mute)" }}
          >
            Bio
          </span>
          <span
            className="text-[10px] tracking-[0.04em]"
            style={{ color: "var(--ink-mute)" }}
          >
            任意 / 最大160字
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={160}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="あなたの音楽について、ひとこと。"
          disabled={status === "saving"}
          className="w-full bg-transparent border-0 border-b py-2 px-1 outline-none text-[14px] tracking-[0.04em] leading-[1.8] resize-none"
          style={{ borderBottomColor: "var(--line)", color: "var(--ink)" }}
        />
      </div>

      {/* ───── submit ───── */}
      <div className="flex flex-col items-center gap-4 mt-2">
        <button
          type="submit"
          disabled={status === "saving"}
          className="px-12 py-3 border font-[family-name:var(--font-display)] italic text-sm tracking-[0.24em] uppercase transition-opacity disabled:opacity-50 hover:opacity-80"
          style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
        >
          {status === "saving" ? "Saving…" : "— Save —"}
        </button>

        {savedFlash && (
          <p
            className="text-xs tracking-[0.06em]"
            style={{ color: "var(--gold)" }}
          >
            保存しました。
          </p>
        )}
        {errorMessage && (
          <p className="text-xs mt-1" style={{ color: "#c87575" }}>
            {errorMessage}
          </p>
        )}
      </div>
    </form>
  );
}
