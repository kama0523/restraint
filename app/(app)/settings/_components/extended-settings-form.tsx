"use client";

import { useState } from "react";
import { updateExtendedSettings } from "../actions";

const HABIT_PRESETS = ["運動", "勉強", "読書", "早起き", "家事", "自炊"] as const;

export function ExtendedSettingsForm({
  initialAddictionLabel,
  initialPledge,
  initialAlternativeActions,
  initialUrgeTimerMinutes,
  saved,
  onboarding,
}: {
  initialAddictionLabel: string | null;
  initialPledge: string | null;
  initialAlternativeActions: string | null;
  initialUrgeTimerMinutes: number;
  saved: boolean;
  onboarding: boolean;
}) {
  const [label, setLabel] = useState(initialAddictionLabel ?? "");

  return (
    <form action={updateExtendedSettings} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
      <div>
        <label htmlFor="habit-label" className="text-sm font-medium text-stone-700">続けたいこと</label>
        <p className="mt-1 text-xs text-stone-400">ホームに表示する習慣をひとつ決めます。</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {HABIT_PRESETS.map((preset) => (
          <button key={preset} type="button" onClick={() => setLabel(preset)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${label === preset ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-600"}`}>
            {preset}
          </button>
        ))}
      </div>
      <input id="habit-label" type="text" name="addiction_label" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="例：毎朝のウォーキング" required className="rounded-xl border border-stone-200 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none" />
      <input type="hidden" name="onboarding" value={onboarding ? "1" : "0"} />
      <input type="hidden" name="pledge" value={initialPledge ?? ""} />
      <input type="hidden" name="alternative_actions" value={initialAlternativeActions ?? ""} />
      <input type="hidden" name="urge_timer_minutes" value={initialUrgeTimerMinutes} />
      {saved && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">保存しました</p>}
      <button type="submit" className="rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white active:bg-emerald-700">
        {onboarding ? "これで始める" : "保存する"}
      </button>
    </form>
  );
}
