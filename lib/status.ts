import type { DailyStatus } from "./types";

export const STATUS_LABEL: Record<DailyStatus, string> = {
  avoided: "○ 踏みとどまった",
  resisted: "◎ 衝動を乗り越えた",
  went: "× やってしまった",
};

export const STATUS_BADGE_CLASS: Record<DailyStatus, string> = {
  avoided: "bg-emerald-50 text-emerald-700",
  resisted: "bg-sky-50 text-sky-700",
  went: "bg-stone-100 text-stone-600",
};

export const STATUS_SYMBOL: Record<DailyStatus, string> = {
  avoided: "○",
  resisted: "◎",
  went: "×",
};

export const STATUS_SYMBOL_CLASS: Record<DailyStatus, string> = {
  avoided: "text-emerald-600",
  resisted: "text-sky-600",
  went: "text-stone-400",
};
