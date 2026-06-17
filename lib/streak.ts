import { addDays, diffDays } from "./date";
import type { DailyStatus } from "./types";

export interface StreakRecord {
  date: string;
  status: DailyStatus;
}

/** todayから遡って連続で成功(行かなかった/耐えた)している日数。todayが未記録なら前日から数える。 */
export function currentStreak(records: StreakRecord[], today: string): number {
  const byDate = new Map(records.map((r) => [r.date, r.status]));

  let cursor = byDate.has(today) ? today : addDays(today, -1);
  let streak = 0;

  while (true) {
    const status = byDate.get(cursor);
    if (!status || status === "went") break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

/** これまでの最長連続成功日数。 */
export function longestStreak(records: StreakRecord[]): number {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0;
  let running = 0;
  let prevDate: string | null = null;

  for (const record of sorted) {
    const isSuccess = record.status !== "went";
    const isConsecutive = prevDate !== null && diffDays(record.date, prevDate) === 1;

    running = isSuccess ? (isConsecutive ? running + 1 : 1) : 0;
    longest = Math.max(longest, running);
    prevDate = record.date;
  }

  return longest;
}
