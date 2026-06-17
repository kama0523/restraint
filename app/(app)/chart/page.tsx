import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllRecords, getSavingsGoals } from "@/lib/data";
import { DetailChart } from "./_components/detail-chart";

export default async function ChartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [records, goals] = await Promise.all([
    getAllRecords(supabase, user.id),
    getSavingsGoals(supabase, user.id).catch(() => []),
  ]);

  const totalSaved = records.reduce((sum, r) => sum + r.daily_amount, 0);
  const sortedGoals = [...goals].sort((a, b) => a.target_amount - b.target_amount);

  return (
    <main className="mx-auto max-w-md px-4 pt-6 pb-6">
      <header className="mb-5 flex items-center gap-3">
        <Link href="/" className="text-sm text-stone-400">
          ← 戻る
        </Link>
        <h1 className="text-lg font-bold text-stone-800">積立推移</h1>
      </header>

      {records.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white text-sm text-stone-400 shadow-sm">
          記録が増えるとグラフが表示されます
        </div>
      ) : (
        <section className="mb-6">
          <DetailChart records={records} goals={goals} />
        </section>
      )}

      {sortedGoals.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-stone-600">目標一覧</h2>
          <ul className="flex flex-col gap-2">
            {sortedGoals.map((goal) => {
              const isAchieved = !!goal.achieved_at || totalSaved >= goal.target_amount;
              const pct = Math.min(100, Math.round((totalSaved / goal.target_amount) * 100));
              const remaining = Math.max(0, goal.target_amount - totalSaved);

              return (
                <li key={goal.id} className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-stone-800">
                        {goal.title ?? `目標 ¥${goal.target_amount.toLocaleString()}`}
                      </p>
                      <p className="text-xs text-stone-400">
                        ¥{goal.target_amount.toLocaleString()}
                      </p>
                    </div>
                    {isAchieved ? (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        達成済
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        {pct}%
                      </span>
                    )}
                  </div>

                  {!isAchieved && (
                    <div className="mt-3">
                      <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1 text-right text-xs text-stone-400">
                        あと¥{remaining.toLocaleString()}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
