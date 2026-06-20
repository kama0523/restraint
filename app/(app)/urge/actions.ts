"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { saveDailyRecord, getAllRecords, getSavingsGoals, markGoalAchieved, getRecordByDate } from "@/lib/data";
import { todayJST } from "@/lib/date";

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

export async function recordOvercameUrge() {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const today = todayJST();
  const existing = await getRecordByDate(supabase, userId, today);

  if (!existing || existing.status !== "went") {
    await saveDailyRecord(supabase, userId, today, "resisted", "衝動ブレーキを使って乗り越えた");
    await checkAndMarkGoals(supabase, userId);
  }

  revalidatePath("/");
  redirect("/");
}

export async function recordGaveIn() {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const record = await saveDailyRecord(supabase, userId, todayJST(), "went");
  revalidatePath("/");
  redirect(`/regret/new?recordId=${record.id}`);
}
