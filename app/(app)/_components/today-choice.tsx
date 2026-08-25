"use client";

import { useTransition } from "react";
import type { Habit, HabitRecordWithHabit } from "@/lib/types";
import { toggleHabitToday } from "../actions";

export function TodayChoice({ habits, records }: { habits: Habit[]; records: HabitRecordWithHabit[] }) {
  const [pending, startTransition] = useTransition();
  const completedIds = new Set(records.map((record) => record.habit_id));

  return (
    <ul className="space-y-2.5">
      {habits.map((habit) => {
        const completed = completedIds.has(habit.id);
        return (
          <li key={habit.id}>
            <button type="button" disabled={pending} onClick={() => startTransition(() => toggleHabitToday(habit.id))} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition disabled:opacity-60 ${completed ? "border-emerald-200 bg-emerald-50" : "border-stone-200 bg-white active:bg-stone-50"}`}>
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${completed ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-300 text-transparent"}`}>✓</span>
              <span className="min-w-0 flex-1 font-semibold text-stone-800">{habit.name}</span>
              <span className={`text-sm font-semibold ${completed ? "text-emerald-700" : "text-stone-400"}`}>+¥{habit.amount.toLocaleString()}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
