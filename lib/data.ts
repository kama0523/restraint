import type { SupabaseClient } from "@supabase/supabase-js";
import type { Habit, HabitRecordWithHabit, SavingsGoal } from "./types";

export async function getHabits(supabase: SupabaseClient, userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Habit[];
}

export async function getHabitRecords(
  supabase: SupabaseClient,
  userId: string,
  start?: string,
  end?: string,
): Promise<HabitRecordWithHabit[]> {
  let query = supabase
    .from("habit_records")
    .select("*, habits(name, color)")
    .eq("user_id", userId)
    .order("date", { ascending: true });
  if (start) query = query.gte("date", start);
  if (end) query = query.lt("date", end);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as HabitRecordWithHabit[];
}

export async function getSavingsGoals(
  supabase: SupabaseClient,
  userId: string,
): Promise<SavingsGoal[]> {
  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", userId)
    .order("target_amount", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SavingsGoal[];
}

export async function markGoalAchieved(
  supabase: SupabaseClient,
  userId: string,
  goalId: string,
): Promise<void> {
  const { error } = await supabase
    .from("savings_goals")
    .update({ achieved_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", goalId)
    .is("achieved_at", null);
  if (error) throw error;
}
