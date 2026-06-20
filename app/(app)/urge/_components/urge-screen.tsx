"use client";

import { useState, useEffect, useTransition } from "react";
import { recordOvercameUrge, recordGaveIn } from "../actions";
import type { SavingsGoal, RegretNoteWithDate } from "@/lib/types";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function UrgeScreen({
  addictionLabel,
  pledge,
  alternativeActions,
  timerMinutes,
  totalSaved,
  nextGoal,
  lastRegretNote,
  streak,
  totalSuccessDays,
}: {
  addictionLabel: string | null;
  pledge: string | null;
  alternativeActions: string[];
  timerMinutes: number;
  totalSaved: number;
  nextGoal: SavingsGoal | null;
  lastRegretNote: RegretNoteWithDate | null;
  streak: number;
  totalSuccessDays: number;
}) {
  const totalSeconds = timerMinutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [timerDone, setTimerDone] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (remaining <= 0) {
      setTimerDone(true);
      return;
    }
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setTimerDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const progress = ((totalSeconds - remaining) / totalSeconds) * 100;
  const nextGoalProgress = nextGoal
    ? Math.min((totalSaved / nextGoal.target_amount) * 100, 100)
    : null;
  const targetLabel = addictionLabel ? `「${addictionLabel}」` : "それ";

  return (
    <div className="flex flex-col gap-6">
      {/* タイマー */}
      <section className="rounded-2xl bg-white p-6 shadow-sm text-center">
        <p className="text-sm font-medium text-stone-500 mb-1">
          衝動は平均{timerMinutes}分で薄れます
        </p>
        <p className="text-xs text-stone-400 mb-4">タイマーが終わるまで、ここで待ってみましょう</p>
        <div className="relative inline-flex items-center justify-center mb-3">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#e7e5e4" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={timerDone ? "#059669" : "#0ea5e9"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-3xl font-bold text-stone-800 tabular-nums">
            {timerDone ? "完了" : formatTime(remaining)}
          </span>
        </div>
        {timerDone && (
          <p className="text-sm font-semibold text-emerald-600">
            よく頑張りました！衝動を乗り越えましょう
          </p>
        )}
      </section>

      {/* 自己誓約書 */}
      {pledge && (
        <section className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-5">
          <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wide">
            あなたの誓い
          </p>
          <p className="text-base text-stone-800 whitespace-pre-wrap leading-relaxed">{pledge}</p>
        </section>
      )}

      {/* 積立・目標の現状 */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wide">
          今{targetLabel}をやると失うもの
        </p>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-xs text-stone-400">現在の積立</span>
          <span className="text-2xl font-bold text-emerald-600">
            ¥{totalSaved.toLocaleString()}
          </span>
          <span className="text-xs text-stone-400">が守られています</span>
        </div>
        {nextGoal && nextGoalProgress !== null && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-stone-500 mb-1">
              <span>目標「{nextGoal.title ?? `¥${nextGoal.target_amount.toLocaleString()}`}」</span>
              <span>{Math.round(nextGoalProgress)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-100">
              <div
                className="h-2 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${nextGoalProgress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-stone-400">
              あと ¥{(nextGoal.target_amount - totalSaved).toLocaleString()} で達成
            </p>
          </div>
        )}
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-stone-500">
            連続 <span className="font-bold text-stone-700">{streak}日</span>
          </span>
          <span className="text-stone-500">
            累計成功 <span className="font-bold text-stone-700">{totalSuccessDays}日</span>
          </span>
        </div>
      </section>

      {/* 過去の後悔メモ */}
      {lastRegretNote && (
        <section className="rounded-2xl bg-stone-100 p-5">
          <p className="text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wide">
            前回やってしまった日の記録
          </p>
          <p className="text-xs text-stone-400 mb-2">
            {lastRegretNote.daily_records.date.replace(/-/g, "/")}
          </p>
          {lastRegretNote.feeling && (
            <div className="mb-2">
              <p className="text-xs text-stone-500">帰宅時の気持ち</p>
              <p className="text-sm text-stone-700 whitespace-pre-wrap">{lastRegretNote.feeling}</p>
            </div>
          )}
          {lastRegretNote.next_action && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 mt-2">
              <p className="text-xs font-medium text-amber-700">当時の自分からのメッセージ</p>
              <p className="text-sm text-amber-900 mt-1 whitespace-pre-wrap">
                {lastRegretNote.next_action}
              </p>
            </div>
          )}
          <p className="mt-3 text-xs text-stone-400">
            損失: ¥{lastRegretNote.amount_lost.toLocaleString()} / 使用: ¥{lastRegretNote.amount_spent.toLocaleString()}
          </p>
        </section>
      )}

      {/* 代替行動リスト */}
      {alternativeActions.length > 0 && (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wide">
            代わりにできること
          </p>
          <ul className="flex flex-col gap-2">
            {alternativeActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                <span className="text-emerald-500 font-bold mt-0.5">→</span>
                {action}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* アクションボタン */}
      <section className="flex flex-col gap-3 pt-2 pb-4">
        <form action={recordOvercameUrge}>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-2xl bg-emerald-600 py-5 text-lg font-bold text-white shadow-lg active:bg-emerald-700 disabled:opacity-50"
          >
            乗り越えた！
          </button>
        </form>
        <form action={recordGaveIn}>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg py-3 text-sm text-stone-400 active:text-stone-600 disabled:opacity-50"
          >
            やはりやってしまった
          </button>
        </form>
      </section>
    </div>
  );
}
