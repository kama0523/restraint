import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHabitRecords, getHabits, getSavingsGoals } from "@/lib/data";
import { currentStreak } from "@/lib/streak";
import { formatJapaneseDate, todayJST } from "@/lib/date";
import type { DailyRecord } from "@/lib/types";
import { TodayChoice } from "./_components/today-choice";
import { GoalSection } from "./_components/goal-section";
import { SavingsChart } from "./_components/savings-chart";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [habits, habitRecords, goals] = await Promise.all([
    getHabits(supabase, user.id).catch(() => []),
    getHabitRecords(supabase, user.id).catch(() => []),
    getSavingsGoals(supabase, user.id).catch(() => []),
  ]);
  if (habits.length === 0) redirect("/settings?onboarding=1");

  const today = todayJST();
  const todayRecords = habitRecords.filter((record) => record.date === today);
  const totalSaved = habitRecords.reduce((sum, record) => sum + record.amount, 0);
  const todaySaved = todayRecords.reduce((sum, record) => sum + record.amount, 0);
  const amountsByDate = new Map<string, number>();
  habitRecords.forEach((record) => amountsByDate.set(record.date, (amountsByDate.get(record.date) ?? 0) + record.amount));
  const chartRecords: DailyRecord[] = [...amountsByDate].sort(([a], [b]) => a.localeCompare(b)).map(([date, amount]) => ({ id: date, user_id: user.id, date, status: "avoided", daily_amount: amount, memo: null, created_at: date, updated_at: date }));
  const streak = currentStreak(chartRecords, today);

  return (
    <main className="mx-auto w-full max-w-md px-5 pb-8 pt-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-emerald-700">つづく貯金</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">がんばった分だけ、貯まっていく。</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">習慣とお金を、一緒に積み立てよう。</p>
      </header>

      <section className="mb-5 overflow-hidden rounded-3xl bg-emerald-600 p-6 text-white shadow-sm">
        <p className="text-sm text-emerald-100">これまでに貯まった金額</p>
        <p className="mt-2 text-4xl font-bold tracking-tight">¥{totalSaved.toLocaleString()}</p>
        <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4 text-sm text-emerald-50">
          <span>{streak}日継続中</span><span>今日は +¥{todaySaved.toLocaleString()}</span>
        </div>
      </section>

      <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
        <div className="mb-4">
          <p className="text-xs font-medium text-stone-400">{formatJapaneseDate(today)}</p>
          <h2 className="mt-1 text-lg font-bold text-stone-800">今日できたこと</h2>
          <p className="mt-1 text-xs text-stone-400">できた習慣をタップしてください。</p>
        </div>
        <TodayChoice habits={habits} records={todayRecords} />
        <Link href="/settings" className="mt-4 block text-center text-xs font-medium text-emerald-700">＋ 習慣を追加する</Link>
      </section>

      <section className="mb-5"><GoalSection goals={goals} totalSaved={totalSaved} newlyAchievedIds={[]} /></section>
      <section className="mb-5">
        <h2 className="mb-3 text-base font-bold text-stone-800">貯金の歩み</h2>
        <SavingsChart records={chartRecords} goals={goals} />
      </section>
      <Link href="/calendar" className="flex items-center justify-between rounded-2xl px-1 py-3 text-sm font-medium text-stone-600"><span>これまでの記録を見る</span><span aria-hidden="true" className="text-stone-400">→</span></Link>
    </main>
  );
}
