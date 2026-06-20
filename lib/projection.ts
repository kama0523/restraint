export interface SavingsProjection {
  days30: number;
  days90: number;
  days365: number;
}

export function calcSuccessRate(records: { status: string }[]): number {
  if (records.length === 0) return 1;
  return records.filter((r) => r.status !== "went").length / records.length;
}

export function calcProjection(dailyAmount: number, successRate: number): SavingsProjection {
  const daily = dailyAmount * Math.min(Math.max(successRate, 0), 1);
  return {
    days30: Math.round(daily * 30),
    days90: Math.round(daily * 90),
    days365: Math.round(daily * 365),
  };
}
