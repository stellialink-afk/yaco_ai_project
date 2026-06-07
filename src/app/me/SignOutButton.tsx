"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="font-[family-name:var(--font-display)] italic text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-70 disabled:opacity-40"
      style={{ color: "var(--ink-mute)" }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
