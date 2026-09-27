import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { readTrackingContext, trackEvent } from "@/lib/track";
import LessonVideo from "@/components/LessonVideo";
import CompleteButton from "./CompleteButton";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: course } = await supabase.from("courses").select("id, slug, title").eq("slug", courseSlug).maybeSingle();
  if (!course) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, slug, title, summary, sort_order, is_free_preview, duration_min, body_md")
    .eq("course_id", course.id)
    .order("sort_order");
  const lesson = lessons?.find((l) => l.slug === lessonSlug);
  if (!lesson || !lessons) notFound();

  // 受講判定
  let isEnrolled = false;
  if (user) {
    const { data: enr } = await supabase.from("enrollments").select("id").eq("course_id", course.id).eq("status", "active").maybeSingle();
    isEnrolled = !!enr;
  }
  const canWatch = isEnrolled || lesson.is_free_preview;

  // 動画URLは受講判定の後に service role で取得（ブラウザには視聴可能な人にしか渡さない）
  let videoUrl: string | null = null;
  if (canWatch) {
    try {
      const admin = createAdminClient();
      const { data } = await admin.from("lessons").select("video_url").eq("id", lesson.id).single();
      videoUrl = data?.video_url ?? null;
    } catch {
      videoUrl = null;
    }
    const ctx = await readTrackingContext();
    await trackEvent({ name: "lesson_view", path: `/learn/${courseSlug}/${lessonSlug}`, visitorId: ctx.visitorId, leadId: ctx.leadId, userId: user?.id ?? null, props: { lesson_id: lesson.id, lesson: lesson.slug } });
  }

  let completed = false;
  if (user) {
    const { data: p } = await supabase.from("lesson_progress").select("lesson_id").eq("lesson_id", lesson.id).maybeSingle();
    completed = !!p;
  }

  const idx = lessons.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/learn" className="text-xs text-ink-mute hover:text-ink">← {course.title}</Link>
      <p className="mt-6 text-gold text-sm font-semibold">Lesson {String(idx + 1).padStart(2, "0")}</p>
      <h1 className="mt-1 text-2xl font-bold">{lesson.title}</h1>
      {lesson.summary && <p className="mt-3 text-ink-soft text-sm">{lesson.summary}</p>}

      <div className="mt-8">
        {canWatch ? (
          <LessonVideo url={videoUrl} />
        ) : (
          <div className="rounded-lg border border-line bg-bg-soft p-10 text-center">
            <p className="font-medium">このレッスンは受講者向けです</p>
            <p className="mt-2 text-sm text-ink-soft">
              {user ? "講座を申し込むと、全レッスンが視聴できます。" : "購入済みの方はログインしてください。"}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {!user && <Link href={`/signin?next=/learn/${courseSlug}/${lessonSlug}`} className="rounded-md border border-line bg-card px-5 py-2.5 text-sm hover:border-gold">ログイン</Link>}
              <Link href="/#plans" className="rounded-md bg-accent text-white px-5 py-2.5 text-sm hover:opacity-90">申し込む</Link>
            </div>
          </div>
        )}
      </div>

      {canWatch && lesson.body_md && (
        <article className="prose-md mt-10 text-[15px] whitespace-pre-line">{lesson.body_md}</article>
      )}

      {canWatch && user && (
        <div className="mt-10">
          <CompleteButton lessonId={lesson.id} completed={completed} />
        </div>
      )}

      <nav className="mt-14 flex justify-between text-sm">
        {prev ? <Link href={`/learn/${courseSlug}/${prev.slug}`} className="hover:text-gold">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/learn/${courseSlug}/${next.slug}`} className="hover:text-gold text-right">{next.title} →</Link> : <span />}
      </nav>
    </main>
  );
}
