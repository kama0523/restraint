"use client";

import { useMemo, useState } from "react";
import type { CalendarCell } from "@/lib/calendar";
import type { HabitRecordWithHabit } from "@/lib/types";
import { formatJapaneseDate } from "@/lib/date";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function CalendarGrid({ cells, records, today }: { cells: CalendarCell[]; records: HabitRecordWithHabit[]; today: string }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const byDate = useMemo(() => {
    const map = new Map<string, HabitRecordWithHabit[]>();
    records.forEach((record) => map.set(record.date, [...(map.get(record.date) ?? []), record]));
    return map;
  }, [records]);
  const selected = selectedDate ? byDate.get(selectedDate) ?? [] : [];

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 text-center text-xs text-stone-400">{WEEKDAYS.map((day) => <div key={day}>{day}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          if (!cell.inMonth) return <div key={cell.date} />;
          const dayRecords = byDate.get(cell.date) ?? [];
          const amount = dayRecords.reduce((sum, record) => sum + record.amount, 0);
          return (
            <button key={cell.date} type="button" onClick={() => setSelectedDate(cell.date)} className={`flex aspect-square flex-col items-center justify-center rounded-xl bg-white ${cell.date === today ? "ring-2 ring-emerald-400" : ""}`}>
              <span className="text-[10px] text-stone-400">{Number(cell.date.slice(8))}</span>
              {dayRecords.length ? <><span className="text-sm font-bold text-emerald-600">{dayRecords.length}個</span><span className="text-[8px] text-stone-400">¥{amount.toLocaleString()}</span></> : <span className="text-stone-200">·</span>}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
          <div className="mb-3 flex justify-between"><p className="font-semibold text-stone-700">{formatJapaneseDate(selectedDate)}</p><button type="button" onClick={() => setSelectedDate(null)} className="text-xs text-stone-400">閉じる</button></div>
          {selected.length === 0 ? <p className="text-sm text-stone-400">この日の達成記録はありません。</p> : (
            <ul className="space-y-2">{selected.map((record) => <li key={record.id} className="flex justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm"><span className="font-medium text-stone-700">✓ {record.habits?.name ?? "習慣"}</span><span className="font-semibold text-emerald-700">+¥{record.amount.toLocaleString()}</span></li>)}</ul>
          )}
        </div>
      )}
    </div>
  );
}
