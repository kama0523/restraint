"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { recordToday, recordWent, updateTodayMemo } from "../actions";
import type { DailyRecord } from "@/lib/types";
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "@/lib/status";

export function TodayChoice({
  record,
  dailyAmount,
}: {
  record: DailyRecord | null;
  dailyAmount: number;
}) {
  const [pending, startTransition] = useTransition();
  const [memo, setMemo] = useState(record?.memo ?? "");
  const [memoDirty, setMemoDirty] = useState(false);

  if (!record) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => recordToday("avoided"))}
          className="rounded-xl bg-emerald-600 py-4 text-base font-semibold text-white shadow-sm active:bg-emerald-700 disabled:opacity-50"
        >
          ○ 行かなかった
          <span className="ml-2 text-sm font-normal text-emerald-100">+¥{dailyAmount}</span>
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => recordWent())}
          className="rounded-xl border border-stone-300 py-4 text-base font-semibold text-stone-500 active:bg-stone-100 disabled:opacity-50"
        >
          × 行ってしまった
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <span
        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${STATUS_BADGE_CLASS[record.status]}`}
      >
        {STATUS_LABEL[record.status]}
      </span>

      {record.status === "resisted" && (
        <div className="mt-3">
          <label className="mb-1 block text-xs text-stone-400">メモ(任意)</label>
          <textarea
            value={memo}
            onChange={(e) => {
              setMemo(e.target.value);
              setMemoDirty(true);
            }}
            rows={2}
            placeholder="何があった?どう耐えた?"
            className="w-full rounded-lg border border-stone-200 p-2 text-sm focus:border-sky-400 focus:outline-none"
          />
          {memoDirty && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await updateTodayMemo(memo);
                  setMemoDirty(false);
                })
              }
              className="mt-2 rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              メモを保存
            </button>
          )}
        </div>
      )}

      {record.status === "went" && (
        <Link
          href={`/regret/new?recordId=${record.id}`}
          className="mt-3 block text-sm font-medium text-emerald-700 underline"
        >
          後悔メモを見る・編集する →
        </Link>
      )}
    </div>
  );
}
