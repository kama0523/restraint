"use client";

import { useState, useTransition } from "react";
import type { Habit } from "@/lib/types";
import { addHabit, deleteHabit } from "../actions";

const PRESETS = ["自炊", "運動", "読書", "早起き", "勉強", "家事"];

export function HabitsForm({ habits, onboarding, error, saved }: { habits: Habit[]; onboarding: boolean; error?: string; saved: boolean }) {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {habits.length > 0 && (
        <ul className="space-y-2">
          {habits.map((habit) => (
            <li key={habit.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
              <div>
                <p className="font-semibold text-stone-800">{habit.name}</p>
                <p className="mt-0.5 text-xs text-stone-400">達成するたび ¥{habit.amount.toLocaleString()}</p>
              </div>
              <button type="button" disabled={pending} onClick={() => startTransition(() => deleteHabit(habit.id))} className="px-2 py-1 text-xs text-stone-400 disabled:opacity-50">削除</button>
            </li>
          ))}
        </ul>
      )}

      <form action={addHabit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
        <input type="hidden" name="onboarding" value={onboarding ? "1" : "0"} />
        <div>
          <label htmlFor="habit-name" className="text-sm font-medium text-stone-700">続けたいこと</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button key={preset} type="button" onClick={() => setName(preset)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${name === preset ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-600"}`}>{preset}</button>
            ))}
          </div>
          <input id="habit-name" name="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={50} placeholder="例：毎朝のウォーキング" className="mt-3 w-full rounded-xl border border-stone-200 px-4 py-3 focus:border-emerald-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="habit-amount" className="text-sm font-medium text-stone-700">達成したときの貯金額</label>
          <div className="mt-2 flex items-center gap-2"><span className="text-stone-500">¥</span><input id="habit-amount" name="amount" type="number" min={0} step={100} defaultValue={500} required className="w-full rounded-xl border border-stone-200 px-4 py-3 focus:border-emerald-500 focus:outline-none" /></div>
        </div>
        {error === "1" && <p className="text-sm text-red-600">習慣名と金額を確認してください。</p>}
        {error === "db" && <p className="text-sm text-red-600">保存できませんでした。最新のDBマイグレーションを実行してください。</p>}
        {saved && <p className="text-sm text-emerald-700">追加しました。</p>}
        <button type="submit" className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white active:bg-emerald-700">{onboarding ? "これで始める" : "習慣を追加する"}</button>
      </form>
    </div>
  );
}
