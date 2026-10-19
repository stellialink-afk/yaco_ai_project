"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/site";

/** 月次の振り返りを保存（管理者のみ） */
export async function saveMonthlyReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return;

  const month = String(formData.get("month") ?? "");
  if (!/^\d{4}-\d{2}$/.test(month)) return;

  const actions = [1, 2, 3]
    .map((i) => ({
      title: String(formData.get(`action_${i}_title`) ?? "").trim(),
      due: String(formData.get(`action_${i}_due`) ?? "").trim(),
      expected: String(formData.get(`action_${i}_expected`) ?? "").trim(),
    }))
    .filter((a) => a.title);

  const admin = createAdminClient();
  await admin.from("monthly_reviews").upsert(
    {
      month: `${month}-01`,
      what_worked: String(formData.get("what_worked") ?? ""),
      what_didnt: String(formData.get("what_didnt") ?? ""),
      actions,
    },
    { onConflict: "month" }
  );
  revalidatePath("/admin");
}
