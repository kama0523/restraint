import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRecordById, getRegretNoteByRecordId } from "@/lib/data";
import { formatJapaneseDate } from "@/lib/date";
import { RegretForm } from "./_components/regret-form";

export default async function RegretNewPage({
  searchParams,
}: {
  searchParams: Promise<{ recordId?: string }>;
}) {
  const { recordId } = await searchParams;
  if (!recordId) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const record = await getRecordById(supabase, user.id, recordId);
  if (!record || record.status !== "went") redirect("/");

  const existingNote = await getRegretNoteByRecordId(supabase, user.id, recordId);

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <h1 className="text-lg font-bold text-stone-800">後悔メモ</h1>
      <p className="mb-1 mt-1 text-sm text-stone-400">{formatJapaneseDate(record.date)}</p>
      <p className="mb-6 text-sm text-stone-500">
        自分を責めなくて大丈夫。次に行きたくなった時の自分への、未来へのメモです。
      </p>

      <RegretForm recordId={record.id} initial={existingNote} />
    </main>
  );
}
