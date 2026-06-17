import { shiftMonth } from "./calendar";
import type { DailyStatus, RegretReason } from "./types";

export interface MonthlyStat {
  month: string;
  successDays: number;
  slipDays: number;
  rate: number;
}

/** 月別の成功率(その月の経過日数に対する成功日数の割合)。最新月が先頭。 */
export function monthlySuccessRates(
  records: { date: string; status: DailyStatus }[],
  today: string,
): MonthlyStat[] {
  if (records.length === 0) return [];

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const firstMonth = sorted[0].date.slice(0, 7);
  const currentMonth = today.slice(0, 7);

  const months: string[] = [];
  for (let cursor = firstMonth; cursor <= currentMonth; cursor = shiftMonth(cursor, 1)) {
    months.push(cursor);
  }

  return months
    .map((month) => {
      const monthRecords = records.filter((r) => r.date.startsWith(month));
      const successDays = monthRecords.filter((r) => r.status !== "went").length;
      const slipDays = monthRecords.filter((r) => r.status === "went").length;

      const [y, m] = month.split("-").map(Number);
      const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const elapsedDays = month === currentMonth ? Number(today.slice(8, 10)) : daysInMonth;
      const rate = elapsedDays > 0 ? Math.round((successDays / elapsedDays) * 100) : 0;

      return { month, successDays, slipDays, rate };
    })
    .reverse();
}

export interface ReasonRanking {
  reason: RegretReason;
  count: number;
}

/** 行ってしまった理由を件数の多い順に並べる。 */
export function reasonRanking(notes: { reason: RegretReason }[]): ReasonRanking[] {
  const counts = new Map<RegretReason, number>();
  for (const note of notes) {
    counts.set(note.reason, (counts.get(note.reason) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}
