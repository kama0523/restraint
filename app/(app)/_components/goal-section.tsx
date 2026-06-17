"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SavingsGoal } from "@/lib/types";

export function GoalSection({
  goals,
  totalSaved,
  newlyAchievedIds,
}: {
  goals: SavingsGoal[];
  totalSaved: number;
  newlyAchievedIds: string[];
}) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const sorted = [...goals].sort((a, b) => a.target_amount - b.target_amount);

  const celebrating = sorted.filter(
    (g) => newlyAchievedIds.includes(g.id) && !dismissedIds.includes(g.id),
  );

  // 現在の目標: 未達成のうち最も低い金額のもの
  const currentGoal = sorted.find((g) => !g.achieved_at);

  // 残り10%以内かどうか
  const isNearGoal =
    currentGoal != null && totalSaved >= currentGoal.target_amount * 0.9;

  // 現在の目標が最上位の目標のとき（次の目標がない）に提案する
  const highestGoal = sorted[sorted.length - 1];
  const shouldSuggestNext =
    isNearGoal && currentGoal != null && currentGoal.id === highestGoal?.id;

  const achievedGoals = sorted.filter((g) => g.achieved_at);

  if (goals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 p-4 text-center">
        <p className="text-sm text-stone-500">目標積立額を設定してみましょう</p>
        <Link
          href="/settings"
          className="mt-1.5 inline-block text-sm font-medium text-emerald-600 underline"
        >
          目標を設定する →
        </Link>
      </div>
    );
  }

  return (
    <>
      {celebrating.map((goal) => (
        <CelebrationModal
          key={goal.id}
          goal={goal}
          onDismiss={() => setDismissedIds((ids) => [...ids, goal.id])}
        />
      ))}

      {currentGoal && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-semibold text-stone-700">
              {currentGoal.title ?? "目標"}
            </span>
            <span className="text-xs text-stone-400">
              ¥{totalSaved.toLocaleString()} / ¥{currentGoal.target_amount.toLocaleString()}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all duration-700"
              style={{
                width: `${Math.min(100, (totalSaved / currentGoal.target_amount) * 100)}%`,
              }}
            />
          </div>

          <div className="mt-1 flex justify-between text-xs text-stone-400">
            <span>
              {Math.min(100, Math.round((totalSaved / currentGoal.target_amount) * 100))}%
            </span>
            <span>
              あと¥{Math.max(0, currentGoal.target_amount - totalSaved).toLocaleString()}
            </span>
          </div>

          {shouldSuggestNext && (
            <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2.5">
              <p className="text-sm font-semibold text-amber-700">達成まであと少し！</p>
              <p className="mt-0.5 text-xs text-amber-600">
                次の目標も設定しておくとモチベーションが続きます
              </p>
              <Link
                href="/settings"
                className="mt-2 inline-block text-xs font-medium text-amber-700 underline"
              >
                次の目標を追加する →
              </Link>
            </div>
          )}
        </div>
      )}

      {achievedGoals.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {achievedGoals.map((g) => (
            <span
              key={g.id}
              className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
            >
              ✓ {g.title ?? `¥${g.target_amount.toLocaleString()}`}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function CelebrationModal({
  goal,
  onDismiss,
}: {
  goal: SavingsGoal;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className={`w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl transition-all duration-300 ${
          visible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <div className="mb-3 text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-stone-800">目標達成！</h2>
        <p className="mt-1 text-sm text-stone-500">
          {goal.title ?? `¥${goal.target_amount.toLocaleString()}`}
        </p>
        <p className="mt-1 text-2xl font-bold text-emerald-600">
          ¥{goal.target_amount.toLocaleString()}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          コツコツ続けてきた結果です。
          <br />
          本当によくがんばりました！
        </p>
        <button
          onClick={onDismiss}
          className="mt-5 w-full rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white active:bg-emerald-700"
        >
          ありがとう！
        </button>
      </div>
    </div>
  );
}
