"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { recordWent } from "../actions";
import type { SavingsGoal } from "@/lib/types";

const WAIT_SECONDS = 30;

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function SlipConfirmScreen({
  streak,
  totalSaved,
  nextGoal,
  addictionLabel,
}: {
  streak: number;
  totalSaved: number;
  nextGoal: SavingsGoal | null;
  addictionLabel: string | null;
}) {
  const [remaining, setRemaining] = useState(WAIT_SECONDS);
  const [pending, startTransition] = useTransition();
  const canConfirm = remaining === 0;
  const progress = ((WAIT_SECONDS - remaining) / WAIT_SECONDS) * 100;

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const nextGoalProgress = nextGoal
    ? Math.min((totalSaved / nextGoal.target_amount) * 100, 100)
    : null;

  return (
    <div className="flex flex-col gap-5">
      {/* 失うものの可視化 */}
      <section className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex flex-col gap-4">
        <p className="text-sm font-semibold text-amber-700">このボタンを押すと…</p>

        <div className="flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-xs text-stone-500">連続記録</p>
            <p className="text-lg font-bold text-stone-800">
              {streak > 0 ? (
                <>
                  <span className="text-amber-600">{streak}日</span> が途切れます
                </>
              ) : (
                "記録がリセットされます"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <p className="text-xs text-stone-500">今日の積立</p>
            <p className="text-lg font-bold text-stone-800">
              <span className="text-amber-600">¥{totalSaved.toLocaleString()}</span> が増えません
            </p>
          </div>
        </div>

        {nextGoal && nextGoalProgress !== null && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <p className="text-xs text-stone-500">
                  目標「{nextGoal.title ?? `¥${nextGoal.target_amount.toLocaleString()}`}」
                </p>
                <p className="text-sm font-semibold text-stone-700">
                  達成まであと ¥{(nextGoal.target_amount - totalSaved).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="ml-10 h-2 w-full rounded-full bg-stone-200">
              <div
                className="h-2 rounded-full bg-amber-400"
                style={{ width: `${nextGoalProgress}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* 強制待機タイマー */}
      <section className="rounded-2xl bg-white p-5 shadow-sm flex flex-col items-center gap-3">
        {canConfirm ? (
          <p className="text-sm font-semibold text-stone-600">
            待機時間が終わりました。それでもやりますか？
          </p>
        ) : (
          <>
            <p className="text-sm text-stone-500">
              {WAIT_SECONDS}秒後に確認ボタンが押せます
            </p>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#e7e5e4" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-xl font-bold text-stone-700 tabular-nums">
                {formatTime(remaining)}
              </span>
            </div>
            <p className="text-xs text-stone-400 text-center">
              この時間に、本当にやりたいのか考えてみましょう
            </p>
          </>
        )}
      </section>

      {/* ボタン */}
      <div className="flex flex-col gap-3 pb-4">
        <Link
          href="/"
          className="w-full rounded-2xl bg-emerald-600 py-5 text-center text-lg font-bold text-white shadow-lg active:bg-emerald-700"
        >
          やっぱりやめておく
        </Link>

        <form action={() => startTransition(() => recordWent())}>
          <button
            type="submit"
            disabled={!canConfirm || pending}
            className={`w-full rounded-xl py-4 text-sm font-semibold transition-all ${
              canConfirm
                ? "bg-stone-100 text-stone-600 active:bg-stone-200"
                : "cursor-not-allowed bg-stone-50 text-stone-300"
            } disabled:opacity-60`}
          >
            {canConfirm
              ? `それでも${addictionLabel ? `${addictionLabel}を` : ""}やってしまった`
              : `あと${remaining}秒お待ちください`}
          </button>
        </form>
      </div>
    </div>
  );
}
