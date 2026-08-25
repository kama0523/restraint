"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getHabitRecords, getSavingsGoals, markGoalAchieved } from "@/lib/data";
import { todayJST } from "@/lib/date";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function toggleHabitToday(habitId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const today = todayJST();
  const { data: habit } = await supabase.from("habits").select("id, amount").eq("id", habitId).eq("user_id", user.id).eq("is_active", true).maybeSingle();
  if (!habit) return;

  const { data: existing } = await supabase.from("habit_records").select("id").eq("habit_id", habitId).eq("user_id", user.id).eq("date", today).maybeSingle();
  if (existing) {
    await supabase.from("habit_records").delete().eq("id", existing.id).eq("user_id", user.id);
  } else {
    await supabase.from("habit_records").insert({ habit_id: habitId, user_id: user.id, date: today, amount: habit.amount });
  }

  const [records, goals] = await Promise.all([getHabitRecords(supabase, user.id), getSavingsGoals(supabase, user.id).catch(() => [])]);
  const totalSaved = records.reduce((sum, record) => sum + record.amount, 0);
  await Promise.all(goals.filter((goal) => !goal.achieved_at && totalSaved >= goal.target_amount).map((goal) => markGoalAchieved(supabase, user.id, goal.id)));
  revalidatePath("/");
  revalidatePath("/calendar");
}
