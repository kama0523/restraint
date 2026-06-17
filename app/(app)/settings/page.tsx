import { createClient } from "@/lib/supabase/server";
import { getSettings, getAllRecords, getSavingsGoals } from "@/lib/data";
import { getConfiguredDailyAmount } from "@/lib/savings";
import { SettingsForm } from "./_components/settings-form";
import { GoalsForm } from "./_components/goals-form";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; goal_error?: string }>;
}) {
  const { saved, goal_error } = await searchParams;
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

  const totalSaved = records.reduce((sum, r) => sum + r.daily_amount, 0);
  const dailyAmount = getConfiguredDailyAmount(settings);

  return (
    <main className="mx-auto max-w-md px-4 pt-6 pb-6">
      <h1 className="mb-6 text-lg font-bold text-stone-800">積立設定</h1>
      <SettingsForm
        initialWeeklyAmount={settings.weekly_amount}
        initialDailyAmount={settings.daily_amount}
        initialSavingsBasis={settings.savings_basis}
        saved={saved === "1"}
      />

      <div className="mt-8">
        <h2 className="mb-4 text-base font-bold text-stone-800">目標設定</h2>
        <GoalsForm
          goals={goals}
          totalSaved={totalSaved}
          dailyAmount={dailyAmount}
          hasError={goal_error === "1"}
          dbError={goal_error === "db"}
        />
      </div>
    </main>
  );
}
