/**
 * 動画の埋め込み。Vimeo / YouTube の URL、または mp4 直リンクに対応。
 * URL が未設定なら「準備中」を表示。
 */
export default function LessonVideo({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="aspect-video w-full rounded-lg border border-line bg-bg-soft grid place-items-center text-sm text-ink-mute">
        動画は準備中です
      </div>
    );
  }
  const embed = toEmbed(url);
  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={embed}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="lesson video"
        />
      </div>
    );
  }
  return (
    <video controls playsInline preload="metadata" className="aspect-video w-full rounded-lg bg-black" src={url} />
  );
}

function toEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("vimeo.com")) {
      if (u.hostname === "player.vimeo.com") return url;
      const parts = u.pathname.split("/").filter(Boolean);
      const id = parts[0];
      const hash = parts[1];
      return `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ""}`;
    }
    if (u.hostname.includes("youtube.com") || u.hostname === "youtu.be") {
      const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") ?? u.pathname.split("/").pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null;
    }
    return null;
  } catch {
    return null;
  }
}
