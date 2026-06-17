export type DailyStatus = "avoided" | "resisted" | "went";
export type SavingsBasis = "weekly" | "daily";

export const REGRET_REASONS = ["暇", "ストレス", "給料日", "誘われた", "その他"] as const;
export type RegretReason = (typeof REGRET_REASONS)[number];

export interface Settings {
  user_id: string;
  weekly_amount: number;
  daily_amount: number | null;
  savings_basis: SavingsBasis;
  updated_at: string;
}

export interface DailyRecord {
  id: string;
  user_id: string;
  date: string;
  status: DailyStatus;
  daily_amount: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegretNote {
  id: string;
  daily_record_id: string;
  user_id: string;
  amount_spent: number;
  amount_lost: number;
  reason: RegretReason;
  reason_detail: string | null;
  feeling: string | null;
  next_action: string | null;
  free_memo: string | null;
  created_at: string;
}

export interface RegretNoteWithDate extends RegretNote {
  daily_records: { date: string };
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  target_amount: number;
  title: string | null;
  achieved_at: string | null;
  created_at: string;
}
