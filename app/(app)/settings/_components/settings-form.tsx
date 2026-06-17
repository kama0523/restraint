"use client";

import { useState } from "react";
import { updateSettings } from "../actions";
import { dailyAmountFromWeekly, weeklyAmountFromDaily } from "@/lib/savings";
import type { SavingsBasis } from "@/lib/types";

export function SettingsForm({
  initialWeeklyAmount,
  initialDailyAmount,
  initialSavingsBasis,
  saved,
}: {
  initialWeeklyAmount: number;
  initialDailyAmount: number | null;
  initialSavingsBasis: SavingsBasis;
  saved: boolean;
}) {
  const [weeklyAmount, setWeeklyAmount] = useState(initialWeeklyAmount);
  const [dailyAmount, setDailyAmount] = useState(initialDailyAmount ?? dailyAmountFromWeekly(initialWeeklyAmount));
  const [savingsBasis, setSavingsBasis] = useState<SavingsBasis>(initialSavingsBasis);
  const amount = savingsBasis === "daily" ? dailyAmount : weeklyAmount;
  const configuredDailyAmount =
    savingsBasis === "daily" ? dailyAmount : dailyAmountFromWeekly(weeklyAmount);
  const weeklyEquivalent =
    savingsBasis === "daily" ? weeklyAmountFromDaily(dailyAmount) : weeklyAmount;

  return (
    <form action={updateSettings} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-stone-700">積立額の決め方</legend>
        <div className="grid grid-cols-2 rounded-lg bg-stone-100 p-1">
          <label
            className={`rounded-md px-3 py-2 text-center text-sm font-semibold ${
              savingsBasis === "weekly" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
            }`}
          >
            <input
              type="radio"
              name="savings_basis"
              value="weekly"
              checked={savingsBasis === "weekly"}
              onChange={() => setSavingsBasis("weekly")}
              className="sr-only"
            />
            週あたり
          </label>
          <label
            className={`rounded-md px-3 py-2 text-center text-sm font-semibold ${
              savingsBasis === "daily" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
            }`}
          >
            <input
              type="radio"
              name="savings_basis"
              value="daily"
              checked={savingsBasis === "daily"}
              onChange={() => setSavingsBasis("daily")}
              className="sr-only"
            />
            1日あたり
          </label>
        </div>
      </fieldset>

      <input type="hidden" name="amount" value={amount} />

      <div className="flex flex-col gap-1">
        <label htmlFor="amount_input" className="text-sm font-medium text-stone-700">
          {savingsBasis === "weekly" ? "週あたりの積立額" : "1日あたりの積立額"}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-stone-500">¥</span>
          <input
            id="amount_input"
            type="number"
            min={0}
            step={100}
            value={amount}
            onChange={(e) => {
              const nextAmount = Number(e.target.value);
              if (savingsBasis === "weekly") {
                setWeeklyAmount(nextAmount);
              } else {
                setDailyAmount(nextAmount);
              }
            }}
            className="w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <p className="text-xs text-stone-400">
          {savingsBasis === "weekly"
            ? `1日あたり¥${configuredDailyAmount.toLocaleString()}になります`
            : `週換算で¥${weeklyEquivalent.toLocaleString()}です`}
        </p>
      </div>

      <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        現在の設定では1日あたり{" "}
        <span className="font-bold">¥{configuredDailyAmount.toLocaleString()}</span> の積立
      </div>

      {saved && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">保存しました</p>
      )}

      <button
        type="submit"
        className="rounded-lg bg-emerald-600 py-3 text-base font-semibold text-white active:bg-emerald-700"
      >
        保存する
      </button>
    </form>
  );
}
