import { createClient } from "@/lib/supabase/server";
import { getAllRecords, getSettings, getSavingsGoals } from "@/lib/data";
import { currentStreak } from "@/lib/streak";
import { todayJST } from "@/lib/date";
import { SlipConfirmScreen } from "./_components/slip-confirm-screen";

export default async function SlipConfirmPage() {
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
  const totalSaved = records.reduce((sum, r) => sum + r.daily_amount, 0);
  const streak = currentStreak(records, today);

  const nextGoal =
    goals
      .filter((g) => !g.achieved_at && g.target_amount > totalSaved)
      .sort((a, b) => a.target_amount - b.target_amount)[0] ?? null;

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <a href="/" className="text-stone-400 text-sm underline">
          ← 戻る
        </a>
        <h1 className="text-lg font-bold text-stone-800">ちょっと待って</h1>
      </header>

      <SlipConfirmScreen
        streak={streak}
        totalSaved={totalSaved}
        nextGoal={nextGoal}
        addictionLabel={settings.addiction_label ?? null}
      />
    </main>
  );
}
