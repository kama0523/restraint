"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addGoal(formData: FormData): Promise<void> {
  const targetAmount = Number(formData.get("target_amount"));
  const title = String(formData.get("title") ?? "").trim() || null;
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) redirect("/settings?goal_error=1");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.from("savings_goals").insert({ user_id: user.id, target_amount: Math.round(targetAmount), title });
  if (error) redirect("/settings?goal_error=db");
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function deleteGoal(goalId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("savings_goals").delete().eq("user_id", user.id).eq("id", goalId);
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function addHabit(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const isOnboarding = formData.get("onboarding") === "1";
  if (!name || name.length > 50 || !Number.isFinite(amount) || amount < 0) redirect(`/settings?${isOnboarding ? "onboarding=1&" : ""}habit_error=1`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.from("habits").insert({ user_id: user.id, name, amount: Math.round(amount) });
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
