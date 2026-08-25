import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getHabitRecords } from "@/lib/data";
import { buildMonthGrid, shiftMonth } from "@/lib/calendar";
import { currentMonthJST, todayJST } from "@/lib/date";
import { CalendarGrid } from "./_components/calendar-grid";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const yearMonth = month ?? currentMonthJST();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const start = `${yearMonth}-01`;
  const end = `${shiftMonth(yearMonth, 1)}-01`;
  const records = await getHabitRecords(supabase, user.id, start, end).catch(() => []);
  const [year, monthNumber] = yearMonth.split("-").map(Number);

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <Link href={`/calendar?month=${shiftMonth(yearMonth, -1)}`} className="rounded-full px-3 py-1 text-stone-500">←</Link>
        <div className="text-center"><p className="text-xs text-emerald-700">記録</p><h1 className="text-lg font-bold text-stone-800">{year}年{monthNumber}月</h1></div>
        <Link href={`/calendar?month=${shiftMonth(yearMonth, 1)}`} className="rounded-full px-3 py-1 text-stone-500">→</Link>
      </div>
      <CalendarGrid cells={buildMonthGrid(yearMonth)} records={records} today={todayJST()} />
    </main>
  );
}
