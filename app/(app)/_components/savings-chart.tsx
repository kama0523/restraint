import Link from "next/link";
import type { DailyRecord, SavingsGoal } from "@/lib/types";

const WIDTH = 300;
const HEIGHT = 120;
const PAD = 8;

function toY(value: number, max: number) {
  return HEIGHT - PAD - (value / max) * (HEIGHT - PAD * 2);
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

export function SavingsChart({
  records,
  goals = [],
}: {
  records: DailyRecord[];
  goals?: SavingsGoal[];
}) {
  if (records.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl bg-white text-sm text-stone-400 shadow-sm">
        記録が増えるとグラフが表示されます
      </div>
    );
  }

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const n = sorted.length;

  const totals = sorted.reduce<number[]>((acc, r, i) => {
    const prev = i === 0 ? 0 : acc[i - 1];
    return [...acc, prev + r.daily_amount];
  }, []);
  const points = sorted.map((r, i) => ({ status: r.status, total: totals[i] }));
  const cumulative = totals[n - 1];

  const sortedGoals = [...goals].sort((a, b) => a.target_amount - b.target_amount);
  const nextGoal = sortedGoals.find((g) => !g.achieved_at);
  const visibleGoals = [
    ...sortedGoals.filter((g) => !!g.achieved_at),
    ...(nextGoal ? [nextGoal] : []),
  ];

  const max = Math.max(...points.map((p) => p.total), nextGoal?.target_amount ?? 0, 1);

  const coords = points.map((p, i) => ({
    ...p,
    x: n === 1 ? WIDTH / 2 : PAD + (i / (n - 1)) * (WIDTH - PAD * 2),
    y: toY(p.total, max),
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${coords[n - 1].x.toFixed(1)},${(HEIGHT - PAD).toFixed(1)} L${coords[0].x.toFixed(1)},${(HEIGHT - PAD).toFixed(1)} Z`;

  // X軸: 最初・中間（多い場合）・最後
  const xDates = [
    sorted[0].date,
    ...(n > 8 ? [sorted[Math.floor(n / 2)].date] : []),
    ...(n > 1 ? [sorted[n - 1].date] : []),
  ];

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-xs text-stone-400">積立額の推移</p>
        <div className="flex items-baseline gap-3">
          <p className="text-sm font-bold text-emerald-700">¥{cumulative.toLocaleString()}</p>
          <Link href="/chart" className="text-xs text-stone-400 underline">
            詳細
          </Link>
        </div>
      </div>

      <div className="flex gap-1">
        {/* Y軸ラベル */}
        <div className="flex w-10 shrink-0 flex-col justify-between py-2 text-right text-[9px] leading-none text-stone-300">
          <span>{fmtAmount(max)}</span>
          <span>¥0</span>
        </div>

        {/* チャートエリア */}
        <div className="relative flex-1">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="h-28 w-full"
          >
            {visibleGoals.map((goal) => {
              const gy = toY(goal.target_amount, max);
              if (gy < PAD) return null;
              return (
                <line
                  key={goal.id}
                  x1={PAD}
                  y1={gy}
                  x2={WIDTH - PAD}
                  y2={gy}
                  stroke={goal.achieved_at ? "rgb(16 185 129)" : "rgb(251 191 36)"}
                  strokeWidth={1}
                  strokeDasharray="4 3"
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
            {coords.map((c, i) =>
              c.status === "went" ? (
                <circle key={i} cx={c.x} cy={c.y} r={2.5} fill="rgb(168 162 158)" />
              ) : null,
            )}
          </svg>

          {/* 目標ラベル */}
          {visibleGoals.map((goal) => {
            const gy = toY(goal.target_amount, max);
            if (gy < PAD) return null;
            return (
              <div
                key={goal.id}
                className="pointer-events-none absolute right-0"
                style={{ top: `${(gy / HEIGHT) * 100}%` }}
              >
                <span
                  className={`-translate-y-full block px-1 pb-0.5 text-[9px] font-semibold leading-none ${
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
      <div className="ml-11 flex justify-between pt-1 text-[9px] text-stone-300">
        {xDates.map((d, i) => (
          <span key={i}>{fmtDate(d)}</span>
        ))}
      </div>
    </div>
  );
}
