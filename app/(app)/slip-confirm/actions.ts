"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { saveDailyRecord } from "@/lib/data";
import { todayJST } from "@/lib/date";

export async function recordWent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const record = await saveDailyRecord(supabase, data.user.id, todayJST(), "went");
  revalidatePath("/");
  redirect(`/regret/new?recordId=${record.id}`);
}
