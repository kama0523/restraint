"use client";

import { useMemo, useState } from "react";
import type { CalendarCell } from "@/lib/calendar";
import type { DailyRecord, RegretNote } from "@/lib/types";
import { formatJapaneseDate } from "@/lib/date";
import { STATUS_BADGE_CLASS, STATUS_LABEL, STATUS_SYMBOL, STATUS_SYMBOL_CLASS } from "@/lib/status";

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function CalendarGrid({
  cells,
  records,
  regretNotes,
  today,
}: {
  cells: CalendarCell[];
  records: DailyRecord[];
  regretNotes: RegretNote[];
  today: string;
}) {
  const recordsByDate = useMemo(() => new Map(records.map((r) => [r.date, r])), [records]);
  const regretByRecordId = useMemo(
    () => new Map(regretNotes.map((n) => [n.daily_record_id, n])),
    [regretNotes],
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedRecord = selectedDate ? recordsByDate.get(selectedDate) ?? null : null;
  const selectedNote = selectedRecord ? regretByRecordId.get(selectedRecord.id) ?? null : null;

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 text-center text-xs text-stone-400">
        {WEEKDAYS_JA.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const record = recordsByDate.get(cell.date);
          const day = Number(cell.date.slice(8, 10));
          const isToday = cell.date === today;

          if (!cell.inMonth) {
            return <div key={cell.date} />;
          }

          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => setSelectedDate(cell.date)}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg bg-white text-sm ${
                isToday ? "ring-2 ring-emerald-400" : ""
              } ${selectedDate === cell.date ? "bg-emerald-50" : ""}`}
            >
              <span className="text-[10px] text-stone-400">{day}</span>
              <span
                className={`text-lg font-bold ${
                  record ? STATUS_SYMBOL_CLASS[record.status] : "text-stone-200"
                }`}
              >
                {record ? STATUS_SYMBOL[record.status] : "・"}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-700">{formatJapaneseDate(selectedDate)}</p>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-xs text-stone-400 underline"
            >
              閉じる
            </button>
          </div>

          {!selectedRecord && <p className="text-sm text-stone-400">記録がありません</p>}

          {selectedRecord && (
            <div className="flex flex-col gap-2">
              <span
                className={`inline-block w-fit rounded-full px-3 py-1 text-sm font-semibold ${STATUS_BADGE_CLASS[selectedRecord.status]}`}
              >
                {STATUS_LABEL[selectedRecord.status]}
              </span>

              {selectedRecord.memo && (
                <p className="whitespace-pre-wrap text-sm text-stone-600">{selectedRecord.memo}</p>
              )}

              {selectedNote && (
                <div className="flex flex-col gap-1 text-sm text-stone-600">
                  <p>
                    使用金額 ¥{selectedNote.amount_spent.toLocaleString()} / 損失金額 ¥
                    {selectedNote.amount_lost.toLocaleString()}
                  </p>
                  <p>
                    理由: {selectedNote.reason}
                    {selectedNote.reason_detail ? `(${selectedNote.reason_detail})` : ""}
                  </p>
                  {selectedNote.feeling && <p>気持ち: {selectedNote.feeling}</p>}
                  {selectedNote.next_action && <p>次回どうするか: {selectedNote.next_action}</p>}
                  {selectedNote.free_memo && (
                    <p className="whitespace-pre-wrap">{selectedNote.free_memo}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
