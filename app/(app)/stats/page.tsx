import { createClient } from "@/lib/supabase/server";
import { getAllRecords, getAllRegretNotes, getSettings } from "@/lib/data";
import { getConfiguredDailyAmount } from "@/lib/savings";
import { longestStreak } from "@/lib/streak";
import { monthlySuccessRates, reasonRanking } from "@/lib/stats";
import { calcProjection, calcSuccessRate } from "@/lib/projection";
import { todayJST } from "@/lib/date";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [settings, records, regretNotes] = await Promise.all([
    getSettings(supabase, user.id),
    getAllRecords(supabase, user.id),
    getAllRegretNotes(supabase, user.id),
  ]);

  const totalSaved = records.reduce((sum, r) => sum + r.daily_amount, 0);
  const totalSuccessDays = records.filter((r) => r.status !== "went").length;
  const longest = longestStreak(records);
  const monthly = monthlySuccessRates(records, todayJST());
  const ranking = reasonRanking(regretNotes);

  const totalSpent = regretNotes.reduce((sum, n) => sum + n.amount_spent, 0);
  const totalLost = regretNotes.reduce((sum, n) => sum + n.amount_lost, 0);

  const dailyAmount = getConfiguredDailyAmount(settings);
  const successRate = calcSuccessRate(records);
  const projection = calcProjection(dailyAmount, successRate);

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <h1 className="mb-6 text-lg font-bold text-stone-800">統計</h1>

      <section className="mb-6 grid grid-cols-2 gap-3">
        <StatCard label="累計積立額" value={`¥${totalSaved.toLocaleString()}`} accent />
        <StatCard label="累計成功日数" value={`${totalSuccessDays}日`} />
        <StatCard label="最長連続記録" value={`${longest}日`} />
        <StatCard label="成功率" value={`${Math.round(successRate * 100)}%`} />
      </section>

      {/* 損失 vs 積立 */}
      {regretNotes.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-stone-600">損失 vs 積立</h2>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">やってしまった日の使用総額</span>
                <span className="text-base font-bold text-red-500">
                  -¥{totalSpent.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">やってしまった日の損失総額</span>
                <span className="text-base font-bold text-red-600">
                  -¥{totalLost.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-stone-700">踏みとどまって守った積立</span>
                <span className="text-base font-bold text-emerald-600">
                  +¥{totalSaved.toLocaleString()}
                </span>
              </div>
              {totalSaved > totalLost && (
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  損失より{" "}
                  <span className="font-bold">
                    ¥{(totalSaved - totalLost).toLocaleString()}
                  </span>{" "}
                  多く手元に残っています
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 節約シミュレーター */}
      {records.length >= 3 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-stone-600">
            このペースで続けると…
            <span className="ml-2 text-xs font-normal text-stone-400">
              成功率{Math.round(successRate * 100)}%ベース
            </span>
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <ProjectionCard label="30日後" value={projection.days30} current={totalSaved} />
            <ProjectionCard label="90日後" value={projection.days90} current={totalSaved} />
            <ProjectionCard label="1年後" value={projection.days365} current={totalSaved} />
          </div>
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-stone-600">月別成功率</h2>
        {monthly.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm text-stone-400">まだ記録はありません。</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {monthly.map((m) => (
              <li key={m.month} className="rounded-xl bg-white p-3 shadow-sm">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-stone-700">{m.month}</span>
                  <span className="text-stone-500">
                    {m.rate}%(成功{m.successDays} / スリップ{m.slipDays})
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-stone-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(m.rate, 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-stone-600">やってしまった理由ランキング</h2>
        {ranking.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm text-stone-400">
            まだ記録はありません。
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {ranking.map((r, i) => (
              <li
                key={r.reason}
                className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
              >
                <span className="text-sm text-stone-700">
                  {MEDALS[i] ?? `${i + 1}位`} {r.reason}
                </span>
                <span className="text-sm font-semibold text-stone-500">{r.count}回</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 shadow-sm ${
        accent ? "bg-emerald-600 text-white" : "bg-white text-stone-800"
      }`}
    >
      <p className={`text-xs ${accent ? "text-emerald-100" : "text-stone-400"}`}>{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function ProjectionCard({
  label,
  value,
  current,
}: {
  label: string;
  value: number;
  current: number;
}) {
  const total = current + value;
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm text-center">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="mt-1 text-base font-bold text-emerald-600">
        +¥{value >= 10000 ? `${(value / 10000).toFixed(1)}万` : value.toLocaleString()}
      </p>
      <p className="text-xs text-stone-400">
        累計¥{total >= 10000 ? `${Math.floor(total / 10000)}万` : total.toLocaleString()}
      </p>
    </div>
  );
}
