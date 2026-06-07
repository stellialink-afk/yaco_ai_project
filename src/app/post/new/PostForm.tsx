"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ───── allowed file types (Storage RLS と合わせる) ─────
const AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a"];
const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];
const AUDIO_MAX = 25 * 1024 * 1024; // 25 MB
const COVER_MAX = 5 * 1024 * 1024; //  5 MB

type Visibility = "public" | "unlisted" | "draft";

// AI tools — checkbox list
const AI_TOOLS = ["Suno", "Udio", "Stable Audio", "AIVA", "Mubert", "Other"];

export default function PostForm({ userId }: { userId: string }) {
  const router = useRouter();

  // form state
  const [title, setTitle] = useState("");
  const [concept, setConcept] = useState("");
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [btsNote, setBtsNote] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [licensable, setLicensable] = useState(false);
  const [spacesEligible, setSpacesEligible] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("public");

  // files
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // submission
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");
  const [progress, setProgress] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function toggleAiTool(tool: string) {
    setAiTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  }

  function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setAudioFile(null);
      return;
    }
    if (!AUDIO_TYPES.includes(file.type)) {
      setErrorMessage(
        "音源は MP3 / WAV / M4A のいずれかを選択してください。"
      );
      e.target.value = "";
      return;
    }
    if (file.size > AUDIO_MAX) {
      setErrorMessage("音源は 25MB 以下にしてください。");
      e.target.value = "";
      return;
    }
    setErrorMessage("");
    setAudioFile(file);
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }
    if (!COVER_TYPES.includes(file.type)) {
      setErrorMessage(
        "ジャケットは JPEG / PNG / WebP のいずれかを選択してください。"
      );
      e.target.value = "";
      return;
    }
    if (file.size > COVER_MAX) {
      setErrorMessage("ジャケットは 5MB 以下にしてください。");
      e.target.value = "";
      return;
    }
    setErrorMessage("");
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function safeExt(name: string): string {
    const m = name.match(/\.([a-zA-Z0-9]+)$/);
    return m ? m[1].toLowerCase() : "";
  }

  function makeFilename(prefix: string, file: File): string {
    const ext = safeExt(file.name) || "bin";
    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    return `${userId}/${prefix}-${ts}-${rand}.${ext}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("タイトルを入力してください。");
      return;
    }
    if (!audioFile) {
      setErrorMessage("音源ファイルを選択してください。");
      return;
    }
    if (!coverFile) {
      setErrorMessage("ジャケット画像を選択してください。");
      return;
    }

    setErrorMessage("");
    setStatus("uploading");

    const supabase = createClient();

    try {
      // ───── 1. upload audio ─────
      setProgress("音源をアップロードしています…");
      const audioPath = makeFilename("audio", audioFile);
      const { error: audioErr } = await supabase.storage
        .from("audios")
        .upload(audioPath, audioFile, {
          contentType: audioFile.type,
          upsert: false,
        });
      if (audioErr) throw new Error(`音源アップロード失敗: ${audioErr.message}`);

      // ───── 2. upload cover ─────
      setProgress("ジャケットをアップロードしています…");
      const coverPath = makeFilename("cover", coverFile);
      const { error: coverErr } = await supabase.storage
        .from("covers")
        .upload(coverPath, coverFile, {
          contentType: coverFile.type,
          upsert: false,
        });
      if (coverErr) {
        // rollback audio
        await supabase.storage.from("audios").remove([audioPath]);
        throw new Error(`ジャケットアップロード失敗: ${coverErr.message}`);
      }

      // cover public URL (covers bucket is public)
      const { data: coverUrlData } = supabase.storage
        .from("covers")
        .getPublicUrl(coverPath);
      const coverUrl = coverUrlData.publicUrl;

      // for audio_url we store the storage path; signed URLs are minted on detail page
      const audioUrl = audioPath;

      // ───── 3. estimate duration (best-effort) ─────
      const audioDurationSec = await estimateAudioDuration(audioFile);

      // ───── 4. insert into works ─────
      setStatus("saving");
      setProgress("作品情報を保存しています…");

      const tags = tagsInput
        .split(/[,、\s]+/)
        .map((t) => t.trim().replace(/^#/, ""))
        .filter((t) => t.length > 0)
        .slice(0, 12);

      setStatus("saving");
      const { data: inserted, error: insertErr } = await supabase
        .from("works")
        .insert({
          user_id: userId,
          title: title.trim(),
          concept: concept.trim() || null,
          audio_url: audioUrl,
          audio_duration_sec: audioDurationSec,
          cover_url: coverUrl,
          ai_tools: aiTools,
          prompt: prompt.trim() || null,
          lyrics: lyrics.trim() || null,
          bts_note: btsNote.trim() || null,
          tags,
          licensable,
          spaces_eligible: spacesEligible,
          visibility,
        })
        .select("id")
        .single();

      if (insertErr || !inserted) {
        // rollback storage uploads
        await supabase.storage.from("audios").remove([audioPath]);
        await supabase.storage.from("covers").remove([coverPath]);
        throw new Error(`保存に失敗しました: ${insertErr?.message ?? "unknown"}`);
      }

      // ───── 5. success → detail page ─────
      router.push(`/works/${inserted.id}`);
      router.refresh();
    } catch (err) {
      setStatus("idle");
      setProgress("");
      setErrorMessage(err instanceof Error ? err.message : "未知のエラーが発生しました。");
    }
  }

  const submitting = status !== "idle";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-10 text-left"
    >
      {/* ───── Title ───── */}
      <Field label="Title" required>
        <input
          type="text"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="作品のタイトル"
          disabled={submitting}
          className="w-full bg-transparent border-0 border-b py-2 px-1 outline-none transition-colors text-base tracking-[0.04em]"
          style={{ borderBottomColor: "var(--line)", color: "var(--ink)" }}
        />
      </Field>

      {/* ───── Concept ───── */}
      <Field label="Concept" hint="作品に込めた一言・世界観（任意・最大280字）">
        <textarea
          maxLength={280}
          rows={2}
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="夜明け前の、誰もいない街角で。"
          disabled={submitting}
          className="w-full bg-transparent border-0 border-b py-2 px-1 outline-none transition-colors text-[14px] tracking-[0.04em] leading-[1.8] resize-none"
          style={{ borderBottomColor: "var(--line)", color: "var(--ink)" }}
        />
      </Field>

      {/* ───── Audio file ───── */}
      <Field
        label="Audio file"
        required
        hint="MP3 / WAV / M4A、最大 25MB"
      >
        <input
          ref={audioInputRef}
          type="file"
          accept={AUDIO_TYPES.join(",")}
          onChange={handleAudioChange}
          disabled={submitting}
          className="hidden"
        />
        <FileButton
          onClick={() => audioInputRef.current?.click()}
          label={audioFile ? audioFile.name : "音源ファイルを選択"}
          subLabel={
            audioFile
              ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB`
              : undefined
          }
          disabled={submitting}
        />
      </Field>

      {/* ───── Cover image ───── */}
      <Field
        label="Cover image"
        required
        hint="JPEG / PNG / WebP、最大 5MB、正方形を推奨"
      >
        <input
          ref={coverInputRef}
          type="file"
          accept={COVER_TYPES.join(",")}
          onChange={handleCoverChange}
          disabled={submitting}
          className="hidden"
        />
        <div className="flex items-start gap-5">
          {coverPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverPreview}
              alt="cover preview"
              className="w-24 h-24 object-cover"
              style={{ border: "1px solid var(--line)" }}
            />
          )}
          <FileButton
            onClick={() => coverInputRef.current?.click()}
            label={coverFile ? coverFile.name : "ジャケット画像を選択"}
            subLabel={
              coverFile
                ? `${(coverFile.size / 1024 / 1024).toFixed(1)} MB`
                : undefined
            }
            disabled={submitting}
          />
        </div>
      </Field>

      {/* ───── AI tools ───── */}
      <Field label="AI tools used" hint="使用した生成AIをすべて選択（任意）">
        <div className="flex flex-wrap gap-2 mt-2">
          {AI_TOOLS.map((tool) => {
            const selected = aiTools.includes(tool);
            return (
              <button
                key={tool}
                type="button"
                onClick={() => toggleAiTool(tool)}
                disabled={submitting}
                className="px-3 py-1.5 text-xs tracking-[0.1em] transition-opacity"
                style={{
                  border: `1px solid ${selected ? "var(--gold)" : "var(--line)"}`,
                  color: selected ? "var(--gold)" : "var(--ink-soft)",
                  opacity: submitting ? 0.5 : 1,
                }}
              >
                {tool}
              </button>
            );
          })}
        </div>
      </Field>

      {/* ───── Prompt ───── */}
      <Field label="Prompt" hint="生成に使ったプロンプト（任意）">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="lo-fi, ambient, 70bpm, warm vinyl..."
          disabled={submitting}
          className="w-full bg-transparent border-0 border-b py-2 px-1 outline-none transition-colors text-[13px] tracking-[0.04em] leading-[1.8] resize-none font-mono"
          style={{ borderBottomColor: "var(--line)", color: "var(--ink)" }}
        />
      </Field>

      {/* ───── Lyrics ───── */}
      <Field label="Lyrics" hint="歌詞があれば（任意）">
        <textarea
          rows={4}
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          disabled={submitting}
          className="w-full bg-transparent border-0 border-b py-2 px-1 outline-none transition-colors text-[14px] tracking-[0.04em] leading-[2.0] resize-none"
          style={{ borderBottomColor: "var(--line)", color: "var(--ink)" }}
        />
      </Field>

      {/* ───── BTS note ───── */}
      <Field label="Behind the scenes" hint="制作の背景や試行錯誤（任意）">
        <textarea
          rows={3}
          value={btsNote}
          onChange={(e) => setBtsNote(e.target.value)}
          disabled={submitting}
          className="w-full bg-transparent border-0 border-b py-2 px-1 outline-none transition-colors text-[14px] tracking-[0.04em] leading-[1.8] resize-none"
          style={{ borderBottomColor: "var(--line)", color: "var(--ink)" }}
        />
      </Field>

      {/* ───── Tags ───── */}
      <Field
        label="Tags"
        hint="カンマ・スペース・# 区切り、最大12個（例：ambient, lo-fi, cafe）"
      >
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="ambient, lo-fi, cafe"
          disabled={submitting}
          className="w-full bg-transparent border-0 border-b py-2 px-1 outline-none transition-colors text-sm tracking-[0.04em]"
          style={{ borderBottomColor: "var(--line)", color: "var(--ink)" }}
        />
      </Field>

      {/* ───── Licensing flags ───── */}
      <Field label="Licensing">
        <div className="flex flex-col gap-3 mt-2">
          <Checkbox
            label="ライセンス可（B2B/外部利用に対応する）"
            checked={licensable}
            onChange={setLicensable}
            disabled={submitting}
          />
          <Checkbox
            label="Sotto Spaces 候補にする（店舗BGMでの利用を許可）"
            checked={spacesEligible}
            onChange={setSpacesEligible}
            disabled={submitting}
          />
        </div>
      </Field>

      {/* ───── Visibility ───── */}
      <Field label="Visibility">
        <div className="flex flex-col gap-2 mt-2">
          {(["public", "unlisted", "draft"] as const).map((v) => (
            <label
              key={v}
              className="flex items-center gap-3 cursor-pointer text-[13px] tracking-[0.04em]"
              style={{ color: "var(--ink-soft)" }}
            >
              <input
                type="radio"
                name="visibility"
                value={v}
                checked={visibility === v}
                onChange={() => setVisibility(v)}
                disabled={submitting}
                className="accent-current"
                style={{ accentColor: "var(--gold)" }}
              />
              <span>
                {v === "public" && "公開（誰でも閲覧可）"}
                {v === "unlisted" && "限定公開（URLを知る人のみ）"}
                {v === "draft" && "下書き（自分のみ）"}
              </span>
            </label>
          ))}
        </div>
      </Field>

      {/* ───── Submit ───── */}
      <div className="flex flex-col items-center gap-4 mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="px-12 py-4 border font-[family-name:var(--font-display)] italic text-sm tracking-[0.24em] uppercase transition-opacity disabled:opacity-50 hover:opacity-80"
          style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
        >
          {submitting ? "Placing…" : "— Place this work —"}
        </button>

        {progress && (
          <p className="text-xs tracking-[0.06em]" style={{ color: "var(--ink-mute)" }}>
            {progress}
          </p>
        )}
        {errorMessage && (
          <p className="text-xs mt-2 text-center" style={{ color: "#c87575" }}>
            {errorMessage}
          </p>
        )}
      </div>
    </form>
  );
}

// ───── helpers ─────

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-baseline justify-between mb-2">
        <span
          className="font-[family-name:var(--font-display)] italic text-[11px] tracking-[0.2em] uppercase"
          style={{ color: "var(--ink-mute)" }}
        >
          {label}
          {required && <span style={{ color: "var(--gold)" }}> *</span>}
        </span>
        {hint && (
          <span
            className="text-[10px] tracking-[0.04em]"
            style={{ color: "var(--ink-mute)" }}
          >
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function FileButton({
  onClick,
  label,
  subLabel,
  disabled,
}: {
  onClick: () => void;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex-1 px-4 py-3 text-left transition-opacity disabled:opacity-50 hover:opacity-80"
      style={{ border: "1px dashed var(--line)", color: "var(--ink-soft)" }}
    >
      <div className="text-[13px] tracking-[0.04em] truncate">{label}</div>
      {subLabel && (
        <div
          className="text-[10px] mt-1 tracking-[0.04em]"
          style={{ color: "var(--ink-mute)" }}
        >
          {subLabel}
        </div>
      )}
    </button>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className="flex items-center gap-3 cursor-pointer text-[13px] tracking-[0.04em]"
      style={{ color: "var(--ink-soft)" }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{ accentColor: "var(--gold)" }}
      />
      <span>{label}</span>
    </label>
  );
}

// best-effort duration estimator (sec, integer)
async function estimateAudioDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const audio = new Audio();
      audio.preload = "metadata";
      audio.src = url;
      audio.onloadedmetadata = () => {
        const dur = Number.isFinite(audio.duration)
          ? Math.round(audio.duration)
          : null;
        URL.revokeObjectURL(url);
        resolve(dur);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}
