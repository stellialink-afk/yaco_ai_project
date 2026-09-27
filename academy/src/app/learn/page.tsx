import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "講座一覧 — Stellia Academy" };
export const dynamic = "force-dynamic";

export default async function LearnIndex() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, title, subtitle, lessons(id, slug, title, sort_order, is_free_preview, duration_min)")
    .eq("is_published", true)
    .order("created_at");

  const enrolled = new Set<string>();
  const done = new Set<string>();
  if (user) {
    const [{ data: enr }, { data: prog }] = await Promise.all([
      supabase.from("enrollments").select("course_id").eq("status", "active"),
      supabase.from("lesson_progress").select("lesson_id"),
    ]);
    enr?.forEach((e) => enrolled.add(e.course_id));
    prog?.forEach((p) => done.add(p.lesson_id));
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-2xl font-bold">講座</h1>
      {!user && (
        <p className="mt-3 text-sm text-ink-soft">
          無料公開のレッスンはログインなしで見られます。購入済みの方は
          <Link href="/signin" className="underline hover:text-gold">ログイン</Link>
          すると全レッスンが開きます。
        </p>
      )}
      {(courses ?? []).map((c) => {
        const lessons = [...(c.lessons ?? [])].sort((a, b) => a.sort_order - b.sort_order);
        const isEnrolled = enrolled.has(c.id);
        const completed = lessons.filter((l) => done.has(l.id)).length;
        return (
          <section key={c.id} className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-semibold">{c.title}</h2>
              {isEnrolled ? (
                <span className="text-xs text-gold">受講中 ・ {completed}/{lessons.length} 完了</span>
              ) : (
                <Link href="/#plans" className="text-xs underline hover:text-gold">申し込む</Link>
              )}
            </div>
            {c.subtitle && <p className="mt-1 text-sm text-ink-soft">{c.subtitle}</p>}
            <ol className="mt-5 divide-y divide-line border-y border-line">
              {lessons.map((l, i) => {
                const open = isEnrolled || l.is_free_preview;
                const row = (
                  <div className="flex items-center gap-4 py-4">
                    <span className="w-7 shrink-0 tabular-nums text-gold font-semibold">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1">{l.title}</span>
                    {done.has(l.id) && <span className="text-xs text-gold">✓ 完了</span>}
                    {l.is_free_preview && !isEnrolled && <span className="text-[11px] px-2 py-0.5 rounded bg-gold-soft text-gold">無料</span>}
                    {!open && <span className="text-xs text-ink-mute">🔒</span>}
                    {l.duration_min && <span className="text-xs text-ink-mute">{l.duration_min}分</span>}
                  </div>
                );
                return (
                  <li key={l.id}>
                    {open ? (
                      <Link href={`/learn/${c.slug}/${l.slug}`} className="block hover:bg-bg-soft -mx-2 px-2 rounded">
                        {row}
                      </Link>
                    ) : (
                      <div className="opacity-60">{row}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </main>
  );
}
