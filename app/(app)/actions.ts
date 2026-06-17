"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { saveDailyRecord, getAllRecords, getSavingsGoals, markGoalAchieved } from "@/lib/data";
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
