"use client";

import { useTransition } from "react";
import { addGoal, deleteGoal } from "../actions";
import type { SavingsGoal } from "@/lib/types";

export function GoalsForm({
  goals,
  totalSaved,
  dailyAmount,
  hasError,
  dbError,
}: {
  goals: SavingsGoal[];
  totalSaved: number;
  dailyAmount: number;
  hasError: boolean;
  dbError: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const sorted = [...goals].sort((a, b) => a.target_amount - b.target_amount);

  return (
    <div className="flex flex-col gap-4">
      {sorted.length > 0 && (
        <ul className="flex flex-col gap-2">
          {sorted.map((goal) => {
            const isAchieved = !!goal.achieved_at || totalSaved >= goal.target_amount;
            const pct = Math.min(100, Math.round((totalSaved / goal.target_amount) * 100));
            const remaining = Math.max(0, goal.target_amount - totalSaved);
            const daysToGo = dailyAmount > 0 ? Math.ceil(remaining / dailyAmount) : null;

            return (
              <li key={goal.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-800 truncate">
                      {goal.title ?? `目標 ¥${goal.target_amount.toLocaleString()}`}
                    </p>
                    <p className="text-xs text-stone-400">¥{goal.target_amount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isAchieved ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        達成済
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => startTransition(() => deleteGoal(goal.id))}
                        className="text-xs text-stone-300 underline disabled:opacity-50"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>

                {!isAchieved && (
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-stone-100">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-stone-400">
                      <span>{pct}%</span>
                      <span>
                        あと¥{remaining.toLocaleString()}
                        {daysToGo !== null && `（約${daysToGo}日）`}
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <form action={addGoal} className="rounded-xl bg-white p-4 shadow-sm flex flex-col gap-3">
        <p className="text-sm font-semibold text-stone-700">新しい目標を追加</p>

        <div className="flex flex-col gap-1">
          <label htmlFor="goal_title" className="text-xs text-stone-400">
            目標名（任意）
          </label>
          <input
            id="goal_title"
            name="title"
            type="text"
            placeholder="例: 旅行資金、新しいゲーム機…"
            className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="goal_amount" className="text-xs text-stone-400">
            目標金額
          </label>
          <div className="flex items-center gap-2">
            <span className="text-stone-400 text-sm">¥</span>
            <input
              id="goal_amount"
              name="target_amount"
              type="number"
              min={1}
              step={1}
              placeholder="50000"
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {hasError && (
          <p className="text-xs text-red-500">正しい金額を入力してください</p>
        )}
        {dbError && (
          <p className="text-xs text-red-500">
            保存に失敗しました。Supabase に savings_goals テーブルを作成してください。
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white active:bg-emerald-700 disabled:opacity-50"
        >
          追加する
        </button>
      </form>
    </div>
  );
}
