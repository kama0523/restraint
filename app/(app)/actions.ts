"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { saveDailyRecord, getAllRecords, getSavingsGoals, markGoalAchieved, getHabitRecords } from "@/lib/data";
import { todayJST } from "@/lib/date";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

async function requireUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return data.user.id;
}

async function checkAndMarkGoals(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  try {
    const [records, goals] = await Promise.all([
      getAllRecords(supabase, userId),
      getSavingsGoals(supabase, userId),
    ]);
    const totalSaved = records.reduce((sum, r) => sum + r.daily_amount, 0);
    await Promise.all(
      goals
        .filter((g) => !g.achieved_at && totalSaved >= g.target_amount)
        .map((g) => markGoalAchieved(supabase, userId, g.id)),
    );
  } catch {
    // テーブル未作成などは無視
  }
}

export async function recordToday(status: "avoided") {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  await saveDailyRecord(supabase, userId, todayJST(), status);
  await checkAndMarkGoals(supabase, userId);
  revalidatePath("/");
}

export async function recordRest() {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  await saveDailyRecord(supabase, userId, todayJST(), "went");
  revalidatePath("/");
}

export async function recordWent() {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const record = await saveDailyRecord(supabase, userId, todayJST(), "went");
  revalidatePath("/");
  redirect(`/regret/new?recordId=${record.id}`);
}

export async function updateTodayMemo(memo: string) {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  await saveDailyRecord(supabase, userId, todayJST(), "resisted", memo);
  revalidatePath("/");
}

export async function toggleHabitToday(habitId: string) {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const today = todayJST();
  const { data: habit } = await supabase.from("habits").select("id, amount").eq("id", habitId).eq("user_id", userId).eq("is_active", true).maybeSingle();
  if (!habit) return;

  const { data: existing } = await supabase.from("habit_records").select("id").eq("habit_id", habitId).eq("user_id", userId).eq("date", today).maybeSingle();
  if (existing) {
    await supabase.from("habit_records").delete().eq("id", existing.id).eq("user_id", userId);
  } else {
    await supabase.from("habit_records").insert({ habit_id: habitId, user_id: userId, date: today, amount: habit.amount });
  }

  const [records, goals] = await Promise.all([getHabitRecords(supabase, userId), getSavingsGoals(supabase, userId).catch(() => [])]);
  const totalSaved = records.reduce((sum, record) => sum + record.amount, 0);
  await Promise.all(goals.filter((goal) => !goal.achieved_at && totalSaved >= goal.target_amount).map((goal) => markGoalAchieved(supabase, userId, goal.id)));
  revalidatePath("/");
  revalidatePath("/calendar");
}
