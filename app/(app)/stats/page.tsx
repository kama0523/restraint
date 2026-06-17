import { createClient } from "@/lib/supabase/server";
import { getAllRecords, getAllRegretNotes } from "@/lib/data";
import { longestStreak } from "@/lib/streak";
import { monthlySuccessRates, reasonRanking } from "@/lib/stats";
import { todayJST } from "@/lib/date";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [records, regretNotes] = await Promise.all([
    getAllRecords(supabase, user.id),
    getAllRegretNotes(supabase, user.id),
  ]);

  const totalSaved = records.reduce((sum, r) => sum + r.daily_amount, 0);
  const totalSuccessDays = records.filter((r) => r.status !== "went").length;
  const longest = longestStreak(records);
  const monthly = monthlySuccessRates(records, todayJST());
  const ranking = reasonRanking(regretNotes);

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <h1 className="mb-6 text-lg font-bold text-stone-800">統計</h1>

      <section className="mb-6 grid grid-cols-2 gap-3">
        <StatCard label="累計積立額" value={`¥${totalSaved.toLocaleString()}`} accent />
        <StatCard label="累計成功日数" value={`${totalSuccessDays}日`} />
        <StatCard label="最長連続記録" value={`${longest}日`} />
      </section>

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
        <h2 className="mb-2 text-sm font-semibold text-stone-600">行ってしまった理由ランキング</h2>
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
