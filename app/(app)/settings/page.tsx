import { createClient } from "@/lib/supabase/server";
import { getHabitRecords, getHabits, getSavingsGoals } from "@/lib/data";
import { GoalsForm } from "./_components/goals-form";
import { HabitsForm } from "./_components/habits-form";
import { signOut } from "../actions";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ goal_error?: string; habit_error?: string; habit_saved?: string; onboarding?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [habits, records, goals] = await Promise.all([
    getHabits(supabase, user.id).catch(() => []),
    getHabitRecords(supabase, user.id).catch(() => []),
    getSavingsGoals(supabase, user.id).catch(() => []),
  ]);
  const onboarding = params.onboarding === "1";
  const totalSaved = records.reduce((sum, record) => sum + record.amount, 0);
  const averageAmount = habits.length ? Math.round(habits.reduce((sum, habit) => sum + habit.amount, 0) / habits.length) : 500;

  return (
    <main className="mx-auto max-w-md px-4 pb-6 pt-6">
      <div className="mb-7">
        <p className="text-sm font-medium text-emerald-700">つづく貯金</p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">{onboarding ? "最初の習慣を登録しよう" : "設定"}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          {onboarding ? "少し面倒だけど続けたいことと、達成したときの貯金額を決めます。" : "続けたいことは、いくつでも追加できます。"}
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-bold text-stone-800">続けること</h2>
        <HabitsForm habits={habits} onboarding={onboarding} error={params.habit_error} saved={params.habit_saved === "1"} />
      </section>

      {!onboarding && (
        <>
          <section>
            <h2 className="mb-3 text-base font-bold text-stone-800">貯金の目標</h2>
            <GoalsForm goals={goals} totalSaved={totalSaved} dailyAmount={averageAmount} hasError={params.goal_error === "1"} dbError={params.goal_error === "db"} />
          </section>
          <section className="mt-10 border-t border-stone-200 pt-6">
            <form action={signOut}><button type="submit" className="w-full rounded-xl py-3 text-sm font-medium text-stone-500 active:bg-stone-100">ログアウト</button></form>
          </section>
        </>
      )}
    </main>
  );
}
