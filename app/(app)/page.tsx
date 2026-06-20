import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllRecords, getSettings, getSavingsGoals } from "@/lib/data";
import { getConfiguredDailyAmount } from "@/lib/savings";
import { currentStreak } from "@/lib/streak";
import { currentMonthJST, formatJapaneseDate, todayJST } from "@/lib/date";
import { calcProjection, calcSuccessRate } from "@/lib/projection";
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

  const successRate = calcSuccessRate(records);
  const projection = calcProjection(dailyAmount, successRate);

  const pledge = settings.pledge ?? null;
  const addictionLabel = settings.addiction_label ?? null;
  const appTitle = addictionLabel ? `${addictionLabel}の抑制積立` : "抑制積立";

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-stone-800">{appTitle}</h1>
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

      {/* 節約シミュレーター */}
      {records.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-stone-600">
            このペースで続けると…
            {records.length >= 7 && (
              <span className="ml-2 text-xs font-normal text-stone-400">
                (成功率{Math.round(successRate * 100)}%ベース)
              </span>
            )}
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <ProjectionCard label="30日後" value={projection.days30} />
            <ProjectionCard label="90日後" value={projection.days90} />
            <ProjectionCard label="1年後" value={projection.days365} />
          </div>
        </section>
      )}

      {/* 自己誓約書 */}
      {pledge && (
        <section className="mb-6">
          <div className="rounded-xl border-l-4 border-emerald-500 bg-white p-4 shadow-sm">
            <p className="mb-1 text-xs font-semibold text-emerald-600">あなたの誓い</p>
            <p className="whitespace-pre-wrap text-sm text-stone-700 leading-relaxed">{pledge}</p>
          </div>
        </section>
      )}

      {/* 衝動ブレーキ */}
      <section className="mb-6">
        <Link
          href="/urge"
          className="flex w-full items-center justify-between rounded-xl bg-sky-600 px-5 py-4 text-white shadow-sm active:bg-sky-700"
        >
          <div>
            <p className="text-base font-bold">衝動ブレーキ</p>
            <p className="text-xs text-sky-100 mt-0.5">やりたくなったらここをタップ</p>
          </div>
          <span className="text-2xl">🛑</span>
        </Link>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-stone-600">
          今日の記録({formatJapaneseDate(today)})
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

function ProjectionCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm text-center">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="mt-1 text-base font-bold text-stone-800">
        ¥{value >= 10000 ? `${Math.floor(value / 10000)}万` : value.toLocaleString()}
      </p>
    </div>
  );
}
