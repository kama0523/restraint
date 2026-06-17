import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getRecordsForMonth, getRegretNotesByRecordIds } from "@/lib/data";
import { buildMonthGrid, shiftMonth } from "@/lib/calendar";
import { currentMonthJST, formatJapaneseDate, todayJST } from "@/lib/date";
import { CalendarGrid } from "./_components/calendar-grid";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const yearMonth = monthParam ?? currentMonthJST();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const records = await getRecordsForMonth(supabase, user.id, yearMonth);
  const wentRecordIds = records.filter((r) => r.status === "went").map((r) => r.id);
  const regretNotes = await getRegretNotesByRecordIds(supabase, user.id, wentRecordIds);

  const cells = buildMonthGrid(yearMonth);
  const [y, m] = yearMonth.split("-").map(Number);

  const notesWithDate = regretNotes
    .map((note) => ({
      ...note,
      date: records.find((r) => r.id === note.daily_record_id)?.date ?? "",
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/calendar?month=${shiftMonth(yearMonth, -1)}`}
          className="rounded-full px-3 py-1 text-stone-500 active:bg-stone-100"
        >
          ◀
        </Link>
        <h1 className="text-lg font-bold text-stone-800">
          {y}年{m}月
        </h1>
        <Link
          href={`/calendar?month=${shiftMonth(yearMonth, 1)}`}
          className="rounded-full px-3 py-1 text-stone-500 active:bg-stone-100"
        >
          ▶
        </Link>
      </div>

      <CalendarGrid cells={cells} records={records} regretNotes={regretNotes} today={todayJST()} />

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-stone-600">
          {y}年{m}月の後悔メモ
        </h2>
        {notesWithDate.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm text-stone-400">この月の記録はありません。</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notesWithDate.map((note) => (
              <li key={note.id} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="mb-1 text-xs text-stone-400">{formatJapaneseDate(note.date)}</p>
                <p className="whitespace-pre-wrap text-sm text-stone-700">
                  {note.free_memo || note.feeling || "(メモなし)"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
