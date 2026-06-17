import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays } from "./date";
import { getConfiguredDailyAmount } from "./savings";
import type {
  DailyRecord,
  DailyStatus,
  RegretNote,
  RegretNoteWithDate,
  RegretReason,
  SavingsBasis,
  SavingsGoal,
  Settings,
} from "./types";

export async function getSettings(supabase: SupabaseClient, userId: string): Promise<Settings> {
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) {
    const settings = data as Partial<Settings> & Pick<Settings, "user_id" | "weekly_amount" | "updated_at">;

    return {
      ...settings,
      daily_amount: settings.daily_amount ?? null,
      savings_basis: settings.savings_basis ?? "weekly",
    };
  }

  return {
    user_id: userId,
    weekly_amount: 3000,
    daily_amount: null,
    savings_basis: "weekly",
    updated_at: new Date().toISOString(),
  };
}

export async function upsertSavingsSettings(
  supabase: SupabaseClient,
  userId: string,
  input: {
    weeklyAmount: number;
    dailyAmount: number | null;
    savingsBasis: SavingsBasis;
  },
): Promise<void> {
  const { error } = await supabase
    .from("settings")
    .upsert({
      user_id: userId,
      weekly_amount: input.weeklyAmount,
      daily_amount: input.dailyAmount,
      savings_basis: input.savingsBasis,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
}

export async function getAllRecords(
  supabase: SupabaseClient,
  userId: string,
): Promise<DailyRecord[]> {
  const { data, error } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DailyRecord[];
}

export async function getRecordByDate(
  supabase: SupabaseClient,
  userId: string,
  date: string,
): Promise<DailyRecord | null> {
  const { data } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  return (data as DailyRecord) ?? null;
}

export async function getRecordById(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<DailyRecord | null> {
  const { data } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  return (data as DailyRecord) ?? null;
}

export async function getRecordsForMonth(
  supabase: SupabaseClient,
  userId: string,
  yearMonth: string,
): Promise<DailyRecord[]> {
  const start = `${yearMonth}-01`;
  const end = addDays(start, 31).slice(0, 7) + "-01";

  const { data, error } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", userId)
    .gte("date", start)
    .lt("date", end)
    .order("date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DailyRecord[];
}

export async function saveDailyRecord(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  status: DailyStatus,
  memo?: string | null,
): Promise<DailyRecord> {
  let dailyAmount = 0;

  if (status !== "went") {
    const settings = await getSettings(supabase, userId);
    dailyAmount = getConfiguredDailyAmount(settings);
  }

  const { data, error } = await supabase
    .from("daily_records")
    .upsert(
      {
        user_id: userId,
        date,
        status,
        daily_amount: dailyAmount,
        memo: memo ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" },
    )
    .select()
    .single();

  if (error) throw error;
  return data as DailyRecord;
}

export interface RegretNoteInput {
  amount_spent: number;
  amount_lost: number;
  reason: RegretReason;
  reason_detail?: string | null;
  feeling?: string | null;
  next_action?: string | null;
  free_memo?: string | null;
}

export async function saveRegretNote(
  supabase: SupabaseClient,
  userId: string,
  dailyRecordId: string,
  input: RegretNoteInput,
): Promise<void> {
  const { error } = await supabase.from("regret_notes").upsert(
    {
      daily_record_id: dailyRecordId,
      user_id: userId,
      ...input,
    },
    { onConflict: "daily_record_id" },
  );

  if (error) throw error;
}

export async function getRegretNoteByRecordId(
  supabase: SupabaseClient,
  userId: string,
  dailyRecordId: string,
): Promise<RegretNote | null> {
  const { data } = await supabase
    .from("regret_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("daily_record_id", dailyRecordId)
    .maybeSingle();

  return (data as RegretNote) ?? null;
}

export async function getRegretNotesByRecordIds(
  supabase: SupabaseClient,
  userId: string,
  recordIds: string[],
): Promise<RegretNote[]> {
  if (recordIds.length === 0) return [];

  const { data, error } = await supabase
    .from("regret_notes")
    .select("*")
    .eq("user_id", userId)
    .in("daily_record_id", recordIds);

  if (error) throw error;
  return (data ?? []) as RegretNote[];
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

export async function addSavingsGoal(
  supabase: SupabaseClient,
  userId: string,
  targetAmount: number,
  title: string | null,
): Promise<SavingsGoal> {
  const { data, error } = await supabase
    .from("savings_goals")
    .insert({ user_id: userId, target_amount: targetAmount, title })
    .select()
    .single();
  if (error) throw error;
  return data as SavingsGoal;
}

export async function deleteSavingsGoal(
  supabase: SupabaseClient,
  userId: string,
  goalId: string,
): Promise<void> {
  const { error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("user_id", userId)
    .eq("id", goalId);
  if (error) throw error;
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

export async function getAllRegretNotes(
  supabase: SupabaseClient,
  userId: string,
): Promise<RegretNoteWithDate[]> {
  const { data, error } = await supabase
    .from("regret_notes")
    .select("*, daily_records(date)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as RegretNoteWithDate[];
}
