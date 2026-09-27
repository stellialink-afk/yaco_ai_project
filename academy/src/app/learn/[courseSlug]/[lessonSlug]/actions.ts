"use server";

import { createClient } from "@/lib/supabase/server";
import { readTrackingContext, trackEvent } from "@/lib/track";

/** 進捗の切り替え。RLS で本人の行しか書けない。 */
export async function toggleLessonComplete(lessonId: string, complete: boolean): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  if (complete) {
    const { error } = await supabase.from("lesson_progress").upsert({ user_id: user.id, lesson_id: lessonId }, { onConflict: "user_id,lesson_id" });
    if (error) return { ok: false };
    const ctx = await readTrackingContext();
    await trackEvent({ name: "lesson_complete", visitorId: ctx.visitorId, leadId: ctx.leadId, userId: user.id, props: { lesson_id: lessonId } });
  } else {
    const { error } = await supabase.from("lesson_progress").delete().eq("user_id", user.id).eq("lesson_id", lessonId);
    if (error) return { ok: false };
  }
  return { ok: true };
}
