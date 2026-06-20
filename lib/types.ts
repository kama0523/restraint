export type DailyStatus = "avoided" | "resisted" | "went";
export type SavingsBasis = "weekly" | "daily";

export const REGRET_REASONS = ["暇", "ストレス", "不安", "衝動的に", "周りに流された", "習慣", "その他"] as const;
export type RegretReason = (typeof REGRET_REASONS)[number];

export const ADDICTION_PRESETS = [
  "パチンコ・スロット",
  "競馬・競輪・競艇",
  "お酒",
  "タバコ",
  "オンラインゲーム",
  "SNS・スマホ",
  "衝動買い",
  "その他",
] as const;

export interface Settings {
  user_id: string;
  weekly_amount: number;
  daily_amount: number | null;
  savings_basis: SavingsBasis;
  updated_at: string;
  addiction_label?: string | null;
  pledge?: string | null;
  alternative_actions?: string | null;
  urge_timer_minutes?: number | null;
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
