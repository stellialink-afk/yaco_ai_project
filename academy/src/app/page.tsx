import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { lp } from "@/content/lp";
import { yen } from "@/lib/site";
import CheckoutButton from "@/components/CheckoutButton";
import LeadForm from "@/components/LeadForm";

export const dynamic = "force-dynamic";

type Course = {
  id: string;
  slug: string;
  title: string;
  price_personal: number;
  price_business: number;
  list_price_personal: number | null;
  list_price_business: number | null;
  presale_seats_personal: number;
  presale_seats_business: number;
};
type Lesson = { title: string; summary: string | null; duration_min: number | null; is_free_preview: boolean; slug: string };

async function loadCourse(): Promise<{ course: Course | null; lessons: Lesson[]; sold: { personal: number; business: number } }> {
  try {
    const supabase = await createClient();
    const { data: course } = await supabase
      .from("courses")
      .select("id, slug, title, price_personal, price_business, list_price_personal, list_price_business, presale_seats_personal, presale_seats_business")
      .eq("slug", lp.courseSlug)
      .maybeSingle();
    if (!course) return { course: null, lessons: [], sold: { personal: 0, business: 0 } };

    const { data: lessons } = await supabase
      .from("lessons")
      .select("title, summary, duration_min, is_free_preview, slug")
      .eq("course_id", course.id)
      .order("sort_order");

    // 売れた枠数（残席表示用）。service role で購入数を数える。
    let sold = { personal: 0, business: 0 };
    try {
      const admin = createAdminClient();
      const { data } = await admin.from("purchases").select("plan").eq("course_id", course.id).eq("status", "paid");
      sold = {
        personal: (data ?? []).filter((p) => p.plan === "personal").length,
        business: (data ?? []).filter((p) => p.plan === "business").length,
      };
    } catch {
      /* service role 未設定でもLPは表示する */
    }
    return { course: course as Course, lessons: (lessons ?? []) as Lesson[], sold };
  } catch {
    return { course: null, lessons: [], sold: { personal: 0, business: 0 } };
  }
}

export default async function LandingPage() {
  const { course, lessons, sold } = await loadCourse();
  const remaining = (seats: number, soldCount: number) => (seats > 0 ? Math.max(seats - soldCount, 0) : null);
  const remPersonal = course ? remaining(course.presale_seats_personal, sold.personal) : null;
  const remBusiness = course ? remaining(course.presale_seats_business, sold.business) : null;

  return (
    <main>
      {/* ───── Hero ───── */}
      <section className="mx-auto max-w-5xl px-5 pt-16 pb-20 sm:pt-24">
        <p className="text-xs tracking-[0.2em] text-gold font-medium">{lp.hero.eyebrow}</p>
        <h1 className="mt-5 text-3xl sm:text-5xl font-bold leading-[1.3] whitespace-pre-line">{lp.hero.title}</h1>
        <p className="mt-7 max-w-2xl text-ink-soft text-[15px] sm:text-base">{lp.hero.lead}</p>
        <div className="mt-9 flex flex-col sm:flex-row gap-3">
          <a href="#plans" className="inline-flex justify-center items-center px-7 py-3.5 rounded-md bg-accent text-white font-medium hover:opacity-90">
            {lp.hero.ctaPrimary}
          </a>
          <Link href="/learn" className="inline-flex justify-center items-center px-7 py-3.5 rounded-md border border-line bg-card hover:border-gold">
            {lp.hero.ctaSecondary}
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink-mute">{lp.hero.note}</p>
      </section>

      {/* ───── Pains ───── */}
      <section className="bg-bg-soft">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-xl sm:text-2xl font-bold">{lp.pains.title}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {lp.pains.items.map((p) => (
              <div key={p.title} className="rounded-lg bg-card border border-line p-6">
                <h3 className="font-semibold leading-snug">{p.title}</h3>
                <p className="mt-3 text-sm text-ink-soft">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Promise ───── */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-xl sm:text-2xl font-bold">{lp.promise.title}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {lp.promise.items.map((t) => (
            <li key={t} className="flex gap-3 text-[15px]">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ───── Method ───── */}
      <section className="bg-bg-soft">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-xl sm:text-2xl font-bold">{lp.method.title}</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {lp.method.items.map((m, i) => (
              <div key={m.title}>
                <p className="text-gold text-sm font-semibold">0{i + 1}</p>
                <h3 className="mt-1 font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Curriculum ───── */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-xl sm:text-2xl font-bold">{lp.curriculum.title}</h2>
        <p className="mt-2 text-sm text-ink-mute">{lp.curriculum.note}</p>
        <ol className="mt-8 divide-y divide-line border-y border-line">
          {lessons.length === 0 && (
            <li className="py-6 text-sm text-ink-mute">カリキュラムは準備中です（Supabase に seed.sql を投入すると表示されます）。</li>
          )}
          {lessons.map((l, i) => (
            <li key={l.slug} className="py-5 flex gap-5">
              <span className="text-gold font-semibold tabular-nums w-8 shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{l.title}</h3>
                  {l.is_free_preview && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-gold-soft text-gold font-medium">無料公開</span>
                  )}
                </div>
                {l.summary && <p className="mt-1 text-sm text-ink-soft">{l.summary}</p>}
              </div>
              {l.duration_min && <span className="text-xs text-ink-mute shrink-0">約{l.duration_min}分</span>}
            </li>
          ))}
        </ol>
      </section>

      {/* ───── Plans ───── */}
      <section id="plans" className="bg-accent text-white">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <h2 className="text-xl sm:text-2xl font-bold">{lp.plans.title}</h2>
          {!course ? (
            <p className="mt-6 text-white/70 text-sm">講座データが見つかりません。Supabase の設定と seed.sql を確認してください。</p>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <PlanCard
                name={lp.plans.personal.name}
                forWhom={lp.plans.personal.for}
                price={course.price_personal}
                listPrice={course.list_price_personal}
                remaining={remPersonal}
                includes={lp.plans.personal.includes}
                action={<CheckoutButton plan="personal" courseSlug={course.slug} label={`個人プランを${yen(course.price_personal)}で申し込む`} disabled={remPersonal === 0} />}
              />
              <PlanCard
                name={lp.plans.business.name}
                forWhom={lp.plans.business.for}
                price={course.price_business}
                listPrice={course.list_price_business}
                remaining={remBusiness}
                includes={lp.plans.business.includes}
                highlight
                action={<CheckoutButton plan="business" courseSlug={course.slug} label={`法人プランを${yen(course.price_business)}で申し込む`} disabled={remBusiness === 0} />}
              />
            </div>
          )}
          <ul className="mt-8 space-y-1 text-xs text-white/60">
            {lp.plans.presaleTerms.map((t) => (
              <li key={t}>・{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── Instructor ───── */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-xl sm:text-2xl font-bold">{lp.instructor.title}</h2>
        <div className="mt-6 flex flex-col sm:flex-row gap-6 items-start">
          <div className="h-24 w-24 shrink-0 rounded-full bg-bg-soft border border-line" aria-hidden />
          <div>
            <p className="font-semibold">{lp.instructor.name}</p>
            <p className="mt-2 text-sm text-ink-soft max-w-2xl">{lp.instructor.body}</p>
          </div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="bg-bg-soft">
        <div className="mx-auto max-w-3xl px-5 py-16">
          <h2 className="text-xl sm:text-2xl font-bold">{lp.faq.title}</h2>
          <div className="mt-6 divide-y divide-line">
            {lp.faq.items.map((f) => (
              <details key={f.q} className="py-4 group">
                <summary className="cursor-pointer font-medium list-none flex justify-between gap-4">
                  {f.q}
                  <span className="text-ink-mute group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Closing / Lead capture ───── */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h2 className="text-xl sm:text-2xl font-bold">{lp.closing.title}</h2>
        <p className="mt-4 text-ink-soft">{lp.closing.body}</p>
        <div className="mt-8">
          <LeadForm />
        </div>
      </section>
    </main>
  );
}

function PlanCard(props: {
  name: string;
  forWhom: string;
  price: number;
  listPrice: number | null;
  remaining: number | null;
  includes: readonly string[];
  highlight?: boolean;
  action: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl p-7 border ${props.highlight ? "border-gold bg-white/5" : "border-white/15"}`}>
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-bold">{props.name}</h3>
        {props.remaining !== null && (
          <span className="text-xs text-gold">{props.remaining === 0 ? "先行枠は満席" : `先行枠 残り${props.remaining}`}</span>
        )}
      </div>
      <p className="mt-1 text-sm text-white/60">{props.forWhom}</p>
      <div className="mt-6 flex items-end gap-3">
        <span className="text-3xl font-bold tabular-nums">{yen(props.price)}</span>
        {props.listPrice && props.listPrice > props.price && (
          <span className="text-sm text-white/50 line-through tabular-nums">正規 {yen(props.listPrice)}</span>
        )}
      </div>
      <p className="text-xs text-white/50">税込・買い切り</p>
      <ul className="mt-6 space-y-2 text-sm">
        {props.includes.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="text-gold">✓</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">{props.action}</div>
    </div>
  );
}
