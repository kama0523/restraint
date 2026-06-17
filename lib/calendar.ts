import { addDays } from "./date";

export interface CalendarCell {
  date: string;
  inMonth: boolean;
}

/** 指定月(YYYY-MM)の週始まり(日曜)から週終わり(土曜)までを含むカレンダーグリッドを生成する。 */
export function buildMonthGrid(yearMonth: string): CalendarCell[] {
  const [y, m] = yearMonth.split("-").map(Number);
  const firstOfMonth = `${yearMonth}-01`;
  const firstWeekday = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const cells: CalendarCell[] = [];

  for (let i = firstWeekday; i > 0; i--) {
    cells.push({ date: addDays(firstOfMonth, -i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: `${yearMonth}-${String(d).padStart(2, "0")}`, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: addDays(cells[cells.length - 1].date, 1), inMonth: false });
  }

  return cells;
}

/** YYYY-MM文字列をamount分シフトする。 */
export function shiftMonth(yearMonth: string, amount: number): string {
  const [y, m] = yearMonth.split("-").map(Number);
  const total = y * 12 + (m - 1) + amount;
  const newY = Math.floor(total / 12);
  const newM = ((total % 12) + 12) % 12;
  return `${newY}-${String(newM + 1).padStart(2, "0")}`;
}
