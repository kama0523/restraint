"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { upsertSavingsSettings, upsertExtendedSettings } from "@/lib/data";
import { dailyAmountFromWeekly, weeklyAmountFromDaily } from "@/lib/savings";
import type { SavingsBasis } from "@/lib/types";

export async function updateSettings(formData: FormData) {
  const savingsBasis = formData.get("savings_basis");

  if (savingsBasis !== "weekly" && savingsBasis !== "daily") {
    redirect("/settings?error=invalid");
  }

  const amount = Number(formData.get("amount"));

  if (!Number.isFinite(amount) || amount < 0) {
    redirect("/settings?error=invalid");
  }

  const roundedAmount = Math.round(amount);
  const weeklyAmount =
    savingsBasis === "weekly" ? roundedAmount : weeklyAmountFromDaily(roundedAmount);
  const dailyAmount =
    savingsBasis === "daily" ? roundedAmount : dailyAmountFromWeekly(roundedAmount);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await upsertSavingsSettings(supabase, user.id, {
    weeklyAmount,
    dailyAmount,
    savingsBasis: savingsBasis as SavingsBasis,
  });
  revalidatePath("/settings");
  revalidatePath("/");
  redirect("/settings?saved=1");
}

export async function updateExtendedSettings(formData: FormData) {
  const addictionLabel = (formData.get("addiction_label") as string)?.trim() || null;
  const isOnboarding = formData.get("onboarding") === "1";
  if (!addictionLabel) redirect("/settings?onboarding=1");
  const pledge = (formData.get("pledge") as string)?.trim() || null;
  const alternativeActions = (formData.get("alternative_actions") as string)?.trim() || null;
  const timerRaw = Number(formData.get("urge_timer_minutes"));
  const urgeTimerMinutes = Number.isFinite(timerRaw)
    ? Math.max(5, Math.min(60, timerRaw))
    : 20;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await upsertExtendedSettings(supabase, user.id, {
    addictionLabel,
    pledge,
    alternativeActions,
    urgeTimerMinutes,
  });
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/urge");
  redirect(isOnboarding ? "/" : "/settings?saved=1");
}

export async function addGoal(formData: FormData): Promise<void> {
  const targetAmount = Number(formData.get("target_amount"));
  const title = (formData.get("title") as string)?.trim() || null;

  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    redirect("/settings?goal_error=1");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("savings_goals")
    .insert({ user_id: user.id, target_amount: Math.round(targetAmount), title });

  if (error) {
    redirect("/settings?goal_error=db");
  }

  revalidatePath("/settings");
  revalidatePath("/");
}

export async function deleteGoal(goalId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("user_id", user.id)
    .eq("id", goalId);

  if (error) return;

  revalidatePath("/settings");
  revalidatePath("/");
}

export async function addHabit(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const isOnboarding = formData.get("onboarding") === "1";
  if (!name || name.length > 50 || !Number.isFinite(amount) || amount < 0) {
    redirect(`/settings?${isOnboarding ? "onboarding=1&" : ""}habit_error=1`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.from("habits").insert({
    user_id: user.id,
    name,
    amount: Math.round(amount),
  });
  if (error) redirect(`/settings?${isOnboarding ? "onboarding=1&" : ""}habit_error=db`);
  revalidatePath("/");
  revalidatePath("/settings");
  redirect(isOnboarding ? "/" : "/settings?habit_saved=1");
}

export async function deleteHabit(habitId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("habits").update({ is_active: false }).eq("id", habitId).eq("user_id", user.id);
  revalidatePath("/");
  revalidatePath("/settings");
}
