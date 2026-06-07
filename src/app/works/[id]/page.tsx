import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AudioPlayer from "./AudioPlayer";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: work } = await supabase
    .from("works")
    .select("title, concept, cover_url, visibility")
    .eq("id", id)
    .single();

  if (!work) return { title: "Not found — Sotto." };

  return {
    title: `${work.title} — Sotto.`,
    description: work.concept ?? "A work placed on Sotto.",
    openGraph: {
      title: `${work.title} — Sotto.`,
      description: work.concept ?? "A work placed on Sotto.",
      images: work.cover_url ? [{ url: work.cover_url }] : undefined,
    },
  };
}

type Work = {
  id: string;
  user_id: string;
  title: string;
  concept: string | null;
  audio_url: string;
  audio_duration_sec: number | null;
  cover_url: string;
  ai_tools: string[];
  prompt: string | null;
  lyrics: string | null;
  bts_note: string | null;
  tags: string[];
  licensable: boolean;
  spaces_eligible: boolean;
  visibility: "public" | "unlisted" | "draft";
  published_at: string | null;
  created_at: string;
};

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // fetch the work; RLS handles public visibility, but draft requires sign-in
  const { data: work, error } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .single<Work>();

  if (error || !work) notFound();

  // ownership / visibility check
  const isOwner = user?.id === work.user_id;
  if (work.visibility === "draft" && !isOwner) {
    notFound();
  }

  // mint signed URL for the audio (audios bucket is private)
  // valid for 1 hour
  const { data: signed, error: signErr } = await supabase.storage
    .from("audios")
    .createSignedUrl(work.audio_url, 60 * 60);

  if (signErr) {
    // If we can't even sign, redirect to sign-in (most likely auth required)
    if (!user) redirect("/signin");
  }

  // fetch artist profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", work.user_id)
    .single<{ display_name: string }>();
  const artistName = profile?.display_name?.trim() || "Unknown artist";

  const audioSrc = signed?.signedUrl ?? "";
  const dateLabel = formatDate(work.published_at ?? work.created_at);

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(184,148,92,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center text-center w-full max-w-xl">
        {/* brand mark */}
        <Link href="/" aria-label="Sotto. home">
          <h2
            className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl tracking-[0.06em] transition-opacity hover:opacity-70"
            style={{ color: "var(--ink)", fontWeight: 300 }}
          >
            Sotto
            <span
              style={{ color: "var(--gold)", fontStyle: "italic" }}
              className="ml-0.5"
            >
              .
            </span>
          </h2>
        </Link>

        {/* visibility badge for owner */}
        {isOwner && work.visibility !== "public" && (
          <p
            className="mt-6 font-[family-name:var(--font-display)] italic text-[10px] tracking-[0.28em] uppercase"
            style={{ color: "var(--ink-mute)" }}
          >
            — {work.visibility === "draft" ? "Draft" : "Unlisted"} —
          </p>
        )}

        {/* cover */}
        <div
          className="mt-12 w-full max-w-[360px] aspect-square"
          style={{ border: "1px solid var(--line)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={work.cover_url}
            alt={work.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* title */}
        <h1
          className="mt-10 font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-[0.04em] leading-[1.3]"
          style={{ color: "var(--ink)", fontWeight: 300 }}
        >
          {work.title}
        </h1>

        {/* artist name */}
        <p
          className="mt-3 font-[family-name:var(--font-display)] italic text-sm sm:text-base tracking-[0.16em]"
          style={{ color: "var(--gold)" }}
        >
          by {artistName}
        </p>

        {/* concept */}
        {work.concept && (
          <p
            className="mt-6 text-[13px] sm:text-sm leading-[2.0] tracking-[0.06em] max-w-md"
            style={{ color: "var(--ink-soft)" }}
          >
            {work.concept}
          </p>
        )}

        {/* audio player */}
        <div className="mt-12 w-full max-w-md">
          <AudioPlayer src={audioSrc} durationSec={work.audio_duration_sec} />
        </div>

        {/* tags */}
        {work.tags && work.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap justify-center gap-2 max-w-md">
            {work.tags.map((t: string) => (
              <span
                key={t}
                className="px-3 py-1 text-[11px] tracking-[0.08em]"
                style={{
                  border: "1px solid var(--line)",
                  color: "var(--ink-soft)",
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* divider */}
        <div
          className="mt-16 mb-12 h-[1px] w-24"
          style={{ background: "var(--line)" }}
        />

        {/* AI tools */}
        {work.ai_tools && work.ai_tools.length > 0 && (
          <DetailBlock label="AI tools">
            <p
              className="text-[13px] tracking-[0.06em]"
              style={{ color: "var(--ink-soft)" }}
            >
              {work.ai_tools.join(" · ")}
            </p>
          </DetailBlock>
        )}

        {/* prompt */}
        {work.prompt && (
          <DetailBlock label="Prompt">
            <pre
              className="text-[12px] tracking-[0.04em] leading-[1.8] whitespace-pre-wrap text-left max-w-md w-full font-mono"
              style={{ color: "var(--ink-soft)" }}
            >
              {work.prompt}
            </pre>
          </DetailBlock>
        )}

        {/* lyrics */}
        {work.lyrics && (
          <DetailBlock label="Lyrics">
            <pre
              className="text-[13px] tracking-[0.04em] leading-[2.0] whitespace-pre-wrap text-left max-w-md w-full"
              style={{ color: "var(--ink-soft)", fontFamily: "inherit" }}
            >
              {work.lyrics}
            </pre>
          </DetailBlock>
        )}

        {/* BTS */}
        {work.bts_note && (
          <DetailBlock label="Behind the scenes">
            <p
              className="text-[13px] tracking-[0.04em] leading-[2.0] text-left max-w-md w-full"
              style={{ color: "var(--ink-soft)" }}
            >
              {work.bts_note}
            </p>
          </DetailBlock>
        )}

        {/* licensing badges */}
        {(work.licensable || work.spaces_eligible) && (
          <DetailBlock label="License">
            <div className="flex flex-wrap justify-center gap-2">
              {work.licensable && (
                <span
                  className="px-3 py-1 text-[11px] tracking-[0.1em] uppercase"
                  style={{
                    border: "1px solid var(--gold)",
                    color: "var(--gold)",
                  }}
                >
                  Licensable
                </span>
              )}
              {work.spaces_eligible && (
                <span
                  className="px-3 py-1 text-[11px] tracking-[0.1em] uppercase"
                  style={{
                    border: "1px solid var(--gold)",
                    color: "var(--gold)",
                  }}
                >
                  Spaces eligible
                </span>
              )}
            </div>
          </DetailBlock>
        )}

        {/* published date */}
        <p
          className="mt-12 font-[family-name:var(--font-display)] italic text-[11px] tracking-[0.16em]"
          style={{ color: "var(--ink-mute)" }}
        >
          {dateLabel}
        </p>

        {/* footer nav */}
        <div className="mt-16 flex flex-col items-center gap-6">
          {isOwner && (
            <Link
              href="/me"
              className="font-[family-name:var(--font-display)] italic text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
              style={{ color: "var(--gold)" }}
            >
              — My Gallery —
            </Link>
          )}
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] italic text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
            style={{ color: "var(--ink-mute)" }}
          >
            ← Back to Sotto.
          </Link>
        </div>
      </div>
    </main>
  );
}

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center mt-10 w-full">
      <p
        className="font-[family-name:var(--font-display)] italic text-[10px] tracking-[0.28em] uppercase mb-3"
        style={{ color: "var(--ink-mute)" }}
      >
        — {label} —
      </p>
      {children}
    </section>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
