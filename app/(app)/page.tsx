import { createClient } from "@/lib/supabase/server";
import { getAllRecords, getSettings, getSavingsGoals } from "@/lib/data";
import { getConfiguredDailyAmount } from "@/lib/savings";
import { currentStreak } from "@/lib/streak";
import { currentMonthJST, formatJapaneseDate, todayJST } from "@/lib/date";
import { TodayChoice } from "./_components/today-choice";
import { SavingsChart } from "./_components/savings-chart";
import { GoalSection } from "./_components/goal-section";
import { signOut } from "./actions";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [settings, records, goals] = await Promise.all([
    getSettings(supabase, user.id),
    getAllRecords(supabase, user.id),
    getSavingsGoals(supabase, user.id).catch(() => []),
  ]);

  const today = todayJST();
  const month = currentMonthJST();
  const todayRecord = records.find((r) => r.date === today) ?? null;

  const totalSaved = records.reduce((sum, r) => sum + r.daily_amount, 0);

  // 達成判定はクライアント側で計算（DB書き込みはrecordToday時のみ）
  const newlyAchievedIds: string[] = [];
  const updatedGoals = goals.map((g) => {
    if (!g.achieved_at && totalSaved >= g.target_amount) {
      newlyAchievedIds.push(g.id);
      return { ...g, achieved_at: new Date().toISOString() };
    }
    return g;
  });

  const streak = currentStreak(records, today);
  const monthRecords = records.filter((r) => r.date.startsWith(month));
  const monthSuccessCount = monthRecords.filter((r) => r.status !== "went").length;
  const monthSlipCount = monthRecords.filter((r) => r.status === "went").length;
  const dailyAmount = getConfiguredDailyAmount(settings);

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-stone-800">積立</h1>
        <form action={signOut}>
          <button className="text-xs text-stone-400 underline">ログアウト</button>
        </form>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3">
        <StatCard label="現在の積立額" value={`¥${totalSaved.toLocaleString()}`} accent />
        <StatCard label="連続成功日数" value={`${streak}日`} />
        <StatCard label="今月の成功日数" value={`${monthSuccessCount}日`} />
        <StatCard label="今月のスリップ" value={`${monthSlipCount}回`} />
      </section>

      <section className="mb-6">
        <SavingsChart records={records} goals={updatedGoals} />
      </section>

      <section className="mb-6">
        <GoalSection
          goals={updatedGoals}
          totalSaved={totalSaved}
          newlyAchievedIds={newlyAchievedIds}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-stone-600">
          今日の状態({formatJapaneseDate(today)})
        </h2>
        <TodayChoice record={todayRecord} dailyAmount={dailyAmount} />
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
