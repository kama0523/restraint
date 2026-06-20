import { createClient } from "@/lib/supabase/server";
import { getSettings, getAllRecords, getSavingsGoals, getAllRegretNotes } from "@/lib/data";
import { currentStreak } from "@/lib/streak";
import { todayJST } from "@/lib/date";
import { UrgeScreen } from "./_components/urge-screen";

export default async function UrgePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [settings, records, goals, regretNotes] = await Promise.all([
    getSettings(supabase, user.id),
    getAllRecords(supabase, user.id),
    getSavingsGoals(supabase, user.id).catch(() => []),
    getAllRegretNotes(supabase, user.id).catch(() => []),
  ]);

  const today = todayJST();
  const totalSaved = records.reduce((sum, r) => sum + r.daily_amount, 0);
  const streak = currentStreak(records, today);
  const totalSuccessDays = records.filter((r) => r.status !== "went").length;

  const nextGoal =
    goals
      .filter((g) => !g.achieved_at && g.target_amount > totalSaved)
      .sort((a, b) => a.target_amount - b.target_amount)[0] ?? null;

  const lastRegretNote = regretNotes[0] ?? null;

  const alternativeActions = (settings.alternative_actions ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <a href="/" className="text-stone-400 text-sm underline">
          ← 戻る
        </a>
        <h1 className="text-lg font-bold text-stone-800">衝動ブレーキ</h1>
      </header>

      <UrgeScreen
        addictionLabel={settings.addiction_label ?? null}
        pledge={settings.pledge ?? null}
        alternativeActions={alternativeActions}
        timerMinutes={settings.urge_timer_minutes ?? 20}
        totalSaved={totalSaved}
        nextGoal={nextGoal}
        lastRegretNote={lastRegretNote}
        streak={streak}
        totalSuccessDays={totalSuccessDays}
      />
    </main>
  );
}
