"use client";

import { useState } from "react";
import { updateExtendedSettings } from "../actions";
import { ADDICTION_PRESETS } from "@/lib/types";

export function ExtendedSettingsForm({
  initialAddictionLabel,
  initialPledge,
  initialAlternativeActions,
  initialUrgeTimerMinutes,
  saved,
}: {
  initialAddictionLabel: string | null;
  initialPledge: string | null;
  initialAlternativeActions: string | null;
  initialUrgeTimerMinutes: number;
  saved: boolean;
}) {
  const [label, setLabel] = useState(initialAddictionLabel ?? "");
  const [timer, setTimer] = useState(initialUrgeTimerMinutes);

  return (
    <form action={updateExtendedSettings} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-stone-700">やめたいこと</label>
        <div className="flex flex-wrap gap-2">
          {ADDICTION_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setLabel(preset)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                label === preset
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-100 text-stone-600 active:bg-stone-200"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <input
          type="text"
          name="addiction_label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="例: パチンコ・スロット"
          className="rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
        />
        <p className="text-xs text-stone-400">プリセットを選ぶか直接入力してください</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stone-700">自己誓約書</label>
        <textarea
          name="pledge"
          defaultValue={initialPledge ?? ""}
          rows={4}
          placeholder={"例: 家族のために絶対にやめる。\nあの日の後悔を二度と繰り返さない。"}
          className="rounded-lg border border-stone-300 p-3 text-base focus:border-emerald-500 focus:outline-none"
        />
        <p className="text-xs text-stone-400">衝動ブレーキ画面とホームに表示されます</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stone-700">代替行動リスト</label>
        <textarea
          name="alternative_actions"
          defaultValue={initialAlternativeActions ?? ""}
          rows={4}
          placeholder={"1行1つで入力してください\n例:\n散歩に行く\nコーヒーを飲む\n友人に連絡する\n冷水を飲む"}
          className="rounded-lg border border-stone-300 p-3 text-base focus:border-emerald-500 focus:outline-none"
        />
        <p className="text-xs text-stone-400">衝動を感じたときの代わりの行動リスト</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stone-700">
          衝動ブレーキのタイマー時間
          <span className="ml-2 font-bold text-emerald-600">{timer}分</span>
        </label>
        <input
          type="range"
          name="urge_timer_minutes"
          min={5}
          max={60}
          step={5}
          value={timer}
          onChange={(e) => setTimer(Number(e.target.value))}
          className="accent-emerald-600"
        />
        <div className="flex justify-between text-xs text-stone-400">
          <span>5分</span>
          <span>60分</span>
        </div>
        <p className="text-xs text-stone-400">
          衝動は平均20分で薄れます。短すぎると効果が出にくいです
        </p>
      </div>

      {saved && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">保存しました</p>
      )}

      <button
        type="submit"
        className="rounded-lg bg-emerald-600 py-3 text-base font-semibold text-white active:bg-emerald-700"
      >
        保存する
      </button>
    </form>
  );
}
