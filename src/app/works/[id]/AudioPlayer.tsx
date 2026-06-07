"use client";

import { useEffect, useRef, useState } from "react";

export default function AudioPlayer({
  src,
  durationSec,
}: {
  src: string;
  durationSec: number | null;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState<number>(durationSec ?? 0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function onLoaded() {
      if (audio && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
        setReady(true);
      }
    }
    function onTime() {
      if (audio) setCurrent(audio.currentTime);
    }
    function onEnded() {
      setPlaying(false);
      setCurrent(0);
    }

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrent(t);
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      className="flex flex-col items-center gap-4 p-6"
      style={{ border: "1px solid var(--line)", background: "var(--bg-soft)" }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* play / pause */}
      <button
        type="button"
        onClick={toggle}
        disabled={!ready && !src}
        aria-label={playing ? "Pause" : "Play"}
        className="w-14 h-14 flex items-center justify-center transition-opacity disabled:opacity-30 hover:opacity-80"
        style={{ border: "1px solid var(--gold)", color: "var(--gold)" }}
      >
        {playing ? (
          // Pause icon
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3" y="2" width="4" height="14" fill="currentColor" />
            <rect x="11" y="2" width="4" height="14" fill="currentColor" />
          </svg>
        ) : (
          // Play icon
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 2 L16 9 L4 16 Z" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* progress bar */}
      <div className="w-full flex flex-col gap-2">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={seek}
          className="w-full appearance-none h-[2px] cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--gold) ${pct}%, var(--line) ${pct}%)`,
          }}
        />
        <div
          className="flex justify-between text-[10px] tracking-[0.08em] font-mono"
          style={{ color: "var(--ink-mute)" }}
        >
          <span>{formatTime(current)}</span>
          <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
        </div>
      </div>
    </div>
  );
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
