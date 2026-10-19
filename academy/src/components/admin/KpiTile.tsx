export default function KpiTile(props: {
  label: string;
  value: string;
  sub?: string;
  plain?: string;
  status?: "good" | "warn" | "none";
}) {
  const ring = props.status === "good" ? "border-emerald-300" : props.status === "warn" ? "border-amber-300" : "border-line";
  return (
    <div className={`rounded-lg border bg-card p-5 ${ring}`}>
      <p className="text-xs text-ink-mute">{props.label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{props.value}</p>
      {props.sub && <p className="mt-1 text-xs text-ink-mute">{props.sub}</p>}
      {props.plain && <p className="mt-2 text-[11px] leading-5 text-ink-soft">{props.plain}</p>}
    </div>
  );
}
