"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRecordById, saveRegretNote } from "@/lib/data";
import { REGRET_REASONS, type RegretReason } from "@/lib/types";

function isRegretReason(value: string): value is RegretReason {
  return (REGRET_REASONS as readonly string[]).includes(value);
}

export async function saveRegretNoteAction(formData: FormData) {
  const recordId = formData.get("record_id") as string;
  const reason = formData.get("reason") as string;

  if (!recordId || !isRegretReason(reason)) {
    redirect(`/regret/new?recordId=${recordId}&error=invalid`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const record = await getRecordById(supabase, user.id, recordId);
  if (!record || record.status !== "went") redirect("/");

  await saveRegretNote(supabase, user.id, recordId, {
    amount_spent: Number(formData.get("amount_spent")) || 0,
    amount_lost: Number(formData.get("amount_lost")) || 0,
    reason,
    reason_detail: (formData.get("reason_detail") as string) || null,
    feeling: (formData.get("feeling") as string) || null,
    next_action: (formData.get("next_action") as string) || null,
    free_memo: (formData.get("free_memo") as string) || null,
  });

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/stats");
  redirect("/");
}
