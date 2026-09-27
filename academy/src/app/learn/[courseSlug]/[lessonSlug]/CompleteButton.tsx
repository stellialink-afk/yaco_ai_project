"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleLessonComplete } from "./actions";

export default function CompleteButton({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [state, setState] = useState(completed);

  async function onClick() {
    setPending(true);
    const res = await toggleLessonComplete(lessonId, !state);
    if (res.ok) setState(!state);
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`rounded-md px-6 py-3 text-sm font-medium border ${state ? "border-gold text-gold bg-gold-soft" : "border-line bg-card hover:border-gold"} disabled:opacity-50`}
    >
      {state ? "✓ 完了にしました（取り消す）" : "このレッスンを完了にする"}
    </button>
  );
}
