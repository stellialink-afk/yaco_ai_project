import type { FunnelStep } from "@/lib/analytics";

export default function FunnelBars({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const w = Math.max(2, (s.value / max) * 100);
        return (
          <li key={s.key} className="grid grid-cols-[150px_1fr_110px] sm:grid-cols-[180px_1fr_140px] items-center gap-3 text-sm">
            <div>
              <p className="font-medium leading-tight">{s.label}</p>
              <p className="text-[11px] text-ink-mute leading-tight">{s.note}</p>
            </div>
            <div className="h-6 rounded bg-bg-soft overflow-hidden" title={`${s.label}: ${s.value.toLocaleString("ja-JP")}`}>
              <div className="h-full rounded bg-accent" style={{ width: `${w}%`, opacity: 0.55 + 0.45 * (i / Math.max(steps.length - 1, 1)) }} />
            </div>
            <div className="text-right tabular-nums">
              <span className="font-semibold">{s.value.toLocaleString("ja-JP")}</span>
              {s.rateFromPrev !== null && <span className="ml-2 text-xs text-ink-mute">{s.rateFromPrev.toFixed(1)}%</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
