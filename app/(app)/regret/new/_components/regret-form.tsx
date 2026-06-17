"use client";

import { useState } from "react";
import { saveRegretNoteAction } from "../actions";
import { REGRET_REASONS } from "@/lib/types";
import type { RegretNote } from "@/lib/types";

export function RegretForm({
  recordId,
  initial,
}: {
  recordId: string;
  initial: RegretNote | null;
}) {
  const [reason, setReason] = useState<string>(initial?.reason ?? "");

  return (
    <form action={saveRegretNoteAction} className="flex flex-col gap-4">
      <input type="hidden" name="record_id" value={recordId} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="使用金額">
          <MoneyInput name="amount_spent" defaultValue={initial?.amount_spent} />
        </Field>
        <Field label="負け金額">
          <MoneyInput name="amount_lost" defaultValue={initial?.amount_lost} />
        </Field>
      </div>

      <Field label="行った理由">
        <select
          name="reason"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
        >
          <option value="" disabled>
            選択してください
          </option>
          {REGRET_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      {reason === "その他" && (
        <Field label="理由の詳細">
          <textarea
            name="reason_detail"
            defaultValue={initial?.reason_detail ?? ""}
            rows={2}
            className="w-full rounded-lg border border-stone-300 p-3 text-base focus:border-emerald-500 focus:outline-none"
          />
        </Field>
      )}

      <Field label="帰宅時の気持ち">
        <textarea
          name="feeling"
          defaultValue={initial?.feeling ?? ""}
          rows={3}
          placeholder="帰り道、どんな気持ちだった?"
          className="w-full rounded-lg border border-stone-300 p-3 text-base focus:border-emerald-500 focus:outline-none"
        />
      </Field>

      <Field label="次回同じ状況になったらどうするか">
        <textarea
          name="next_action"
          defaultValue={initial?.next_action ?? ""}
          rows={3}
          placeholder="次に行きたくなったら、どうする?"
          className="w-full rounded-lg border border-stone-300 p-3 text-base focus:border-emerald-500 focus:outline-none"
        />
      </Field>

      <Field label="自由記述メモ">
        <textarea
          name="free_memo"
          defaultValue={initial?.free_memo ?? ""}
          rows={3}
          className="w-full rounded-lg border border-stone-300 p-3 text-base focus:border-emerald-500 focus:outline-none"
        />
      </Field>

      <button
        type="submit"
        className="mt-2 rounded-lg bg-emerald-600 py-3 text-base font-semibold text-white active:bg-emerald-700"
      >
        保存する
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-stone-700">{label}</label>
      {children}
    </div>
  );
}

function MoneyInput({ name, defaultValue }: { name: string; defaultValue?: number }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-3">
      <span className="text-stone-500">¥</span>
      <input
        type="number"
        name={name}
        min={0}
        step={100}
        defaultValue={defaultValue ?? ""}
        className="w-full text-base focus:outline-none"
      />
    </div>
  );
}
