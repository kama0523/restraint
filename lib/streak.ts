import { addDays } from "./date";
export interface StreakRecord {
  date: string;
}

/** todayから遡って連続で成功(行かなかった/耐えた)している日数。todayが未記録なら前日から数える。 */
export function currentStreak(records: StreakRecord[], today: string): number {
  const dates = new Set(records.map((record) => record.date));

  let cursor = dates.has(today) ? today : addDays(today, -1);
  let streak = 0;

  while (true) {
    if (!dates.has(cursor)) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}
