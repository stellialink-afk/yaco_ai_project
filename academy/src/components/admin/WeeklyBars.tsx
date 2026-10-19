/**
 * 単一系列の週次棒グラフ（サーバー描画SVG）。
 * 1軸のみ。最大値と最新値だけラベル。各棒に <title> でホバー表示。
 */
export default function WeeklyBars(props: {
  title: string;
  unit: string; // "円" | "件" | "人"
  points: { week: string; value: number }[];
  format?: (v: number) => string;
}) {
  const fmt = props.format ?? ((v: number) => v.toLocaleString("ja-JP"));
  const W = 640;
  const H = 200;
  const padL = 8;
  const padR = 8;
  const padT = 24;
  const padB = 28;
  const pts = props.points;
  const max = Math.max(1, ...pts.map((p) => p.value));
  const n = Math.max(pts.length, 1);
  const slot = (W - padL - padR) / n;
  const barW = Math.max(6, Math.min(28, slot * 0.6));
  const plotH = H - padT - padB;
  const y = (v: number) => padT + plotH - (v / max) * plotH;
  const maxIdx = pts.findIndex((p) => p.value === max);
  const lastIdx = pts.length - 1;
  const gridVals = [0.5, 1].map((f) => max * f);

  return (
    <figure className="rounded-lg border border-line bg-card p-5">
      <figcaption className="text-sm font-semibold">{props.title}</figcaption>
      {pts.length === 0 ? (
        <p className="mt-6 text-sm text-ink-mute">まだデータがありません</p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full h-auto" role="img" aria-label={props.title}>
          {gridVals.map((g) => (
            <g key={g}>
              <line x1={padL} x2={W - padR} y1={y(g)} y2={y(g)} stroke="currentColor" strokeOpacity={0.08} />
              <text x={W - padR} y={y(g) - 4} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.45}>
                {fmt(g)}
              </text>
            </g>
          ))}
          <line x1={padL} x2={W - padR} y1={y(0)} y2={y(0)} stroke="currentColor" strokeOpacity={0.25} />
          {pts.map((p, i) => {
            const x = padL + slot * i + (slot - barW) / 2;
            const top = y(p.value);
            const h = Math.max(0, y(0) - top);
            const label = p.value > 0 && (i === maxIdx || i === lastIdx);
            const month = p.week.slice(5, 7).replace(/^0/, "");
            const day = p.week.slice(8, 10).replace(/^0/, "");
            return (
              <g key={p.week}>
                <rect x={x} y={top} width={barW} height={h} rx={h >= 4 ? 4 : 0} fill="var(--accent)" fillOpacity={i === lastIdx ? 1 : 0.7}>
                  <title>{`${p.week}の週: ${fmt(p.value)}${props.unit}`}</title>
                </rect>
                {label && (
                  <text x={x + barW / 2} y={top - 6} textAnchor="middle" fontSize={11} fill="currentColor">
                    {fmt(p.value)}
                  </text>
                )}
                {(i % Math.ceil(n / 8) === 0 || i === lastIdx) && (
                  <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.55}>
                    {month}/{day}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      <p className="mt-1 text-[11px] text-ink-mute">週の始まり（月曜）ごと。単位: {props.unit}</p>
    </figure>
  );
}
