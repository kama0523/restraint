import type { Settings } from "./types";

/** 週あたり積立額から1日あたりの積立額を計算する(小数点以下切り捨て)。 */
export function dailyAmountFromWeekly(weeklyAmount: number): number {
  return Math.floor(weeklyAmount / 7);
}

export function weeklyAmountFromDaily(dailyAmount: number): number {
  return dailyAmount * 7;
}

export function getConfiguredDailyAmount(settings: Pick<Settings, "weekly_amount" | "daily_amount" | "savings_basis">): number {
  if (settings.savings_basis === "daily") {
    return settings.daily_amount ?? dailyAmountFromWeekly(settings.weekly_amount);
  }

  return dailyAmountFromWeekly(settings.weekly_amount);
}
