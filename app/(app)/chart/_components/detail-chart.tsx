import type { SavingsDay, SavingsGoal } from "@/lib/types";

const WIDTH = 300;
const HEIGHT = 180;
const PAD_X = 8;
const PAD_Y = 10;

function toY(value: number, max: number) {
  return HEIGHT - PAD_Y - (value / max) * (HEIGHT - PAD_Y * 2);
}

function fmtAmount(v: number): string {
  if (v >= 10000) return `¥${Math.round(v / 1000)}k`;
  if (v >= 1000) return `¥${(v / 1000).toFixed(1)}k`;
  return `¥${v}`;
}

function fmtDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m)}/${parseInt(d)}`;
}

export function DetailChart({
  records,
  goals,
}: {
  records: SavingsDay[];
  goals: SavingsGoal[];
}) {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const n = sorted.length;

  const totals = sorted.reduce<number[]>((acc, r, i) => {
    const prev = i === 0 ? 0 : acc[i - 1];
    return [...acc, prev + r.amount];
  }, []);
  const points = sorted.map((_, i) => ({ total: totals[i] }));

  const sortedGoals = [...goals].sort((a, b) => a.target_amount - b.target_amount);

  const max = Math.max(
    ...points.map((p) => p.total),
    ...sortedGoals.map((g) => g.target_amount),
    1,
  );

  const coords = points.map((p, i) => ({
    ...p,
    x: n === 1 ? WIDTH / 2 : PAD_X + (i / (n - 1)) * (WIDTH - PAD_X * 2),
    y: toY(p.total, max),
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${coords[n - 1].x.toFixed(1)},${(HEIGHT - PAD_Y).toFixed(1)} L${coords[0].x.toFixed(1)},${(HEIGHT - PAD_Y).toFixed(1)} Z`;

  // Y軸: 0 / 25% / 50% / 75% / 100%
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map((r) => Math.round(max * r));

  // X軸: 等間隔で最大6点
  const xStride = Math.max(1, Math.floor(n / 5));
  const xSamples = sorted
    .filter((_, i) => i % xStride === 0)
    .concat(n > 1 ? [sorted[n - 1]] : [])
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 6);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex gap-2">
        {/* Y軸ラベル */}
        <div
          className="flex w-12 shrink-0 flex-col justify-between text-right text-[9px] leading-none text-stone-300"
          style={{ paddingTop: `${(PAD_Y / HEIGHT) * 100}%`, paddingBottom: `${(PAD_Y / HEIGHT) * 100}%` }}
        >
          {[...yLabels].reverse().map((v, i) => (
            <span key={i}>{fmtAmount(v)}</span>
          ))}
        </div>

        {/* チャートエリア */}
        <div className="relative flex-1">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="w-full"
            style={{ height: `${HEIGHT}px` }}
          >
            {/* Y軸グリッド */}
            {yLabels.slice(1, -1).map((v, i) => {
              const gy = toY(v, max);
              return (
                <line
                  key={i}
                  x1={PAD_X}
                  y1={gy}
                  x2={WIDTH - PAD_X}
                  y2={gy}
                  stroke="rgb(231 229 228)"
                  strokeWidth={0.5}
                />
              );
            })}

            {/* 目標ライン（全て） */}
            {sortedGoals.map((goal) => {
              const gy = toY(goal.target_amount, max);
              if (gy < PAD_Y || gy > HEIGHT - PAD_Y) return null;
              return (
                <line
                  key={goal.id}
                  x1={PAD_X}
                  y1={gy}
                  x2={WIDTH - PAD_X}
                  y2={gy}
                  stroke={goal.achieved_at ? "rgb(16 185 129)" : "rgb(251 191 36)"}
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  strokeLinecap="round"
                />
              );
            })}

            <path d={areaPath} fill="rgb(16 185 129 / 0.12)" stroke="none" />
            <path
              d={linePath}
              fill="none"
              stroke="rgb(5 150 105)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>

          {/* 目標ラベル */}
          {sortedGoals.map((goal) => {
            const gy = toY(goal.target_amount, max);
            if (gy < PAD_Y || gy > HEIGHT - PAD_Y) return null;
            return (
              <div
                key={goal.id}
                className="pointer-events-none absolute right-0"
                style={{ top: `${(gy / HEIGHT) * 100}%` }}
              >
                <span
                  className={`-translate-y-full block px-1 pb-0.5 text-[10px] font-semibold leading-none ${
                    goal.achieved_at ? "text-emerald-600" : "text-amber-500"
                  }`}
                >
                  {goal.title ?? `¥${goal.target_amount.toLocaleString()}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* X軸ラベル */}
      <div className="ml-14 flex justify-between pt-2 text-[9px] text-stone-300">
        {xSamples.map((r, i) => (
          <span key={i}>{fmtDate(r.date)}</span>
        ))}
      </div>
    </div>
  );
}
