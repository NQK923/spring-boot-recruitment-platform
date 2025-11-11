"use client";

import { useActionState } from "react";
import { respondOfferAction, type OfferActionState } from "@/app/candidate/applications/[applicationId]/actions";

const initialState: OfferActionState = {};

type OfferDecisionFormProps = {
  applicationId: number;
  disabled?: boolean;
};

export function OfferDecisionForm({ applicationId, disabled }: OfferDecisionFormProps) {
  const [state, formAction, pending] = useActionState(
    respondOfferAction.bind(null, applicationId),
    initialState
  );

  const isDisabled = disabled || pending;

  return (
    <form className="space-y-3 rounded-2xl border border-indigo-100 bg-white/70 p-4 shadow-sm" action={formAction}>
      <p className="text-sm font-semibold text-indigo-800">Phản hồi đề nghị</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-sm font-semibold text-indigo-900">
          <input
            type="radio"
            name="decision"
            value="ACCEPT"
            className="h-4 w-4 border-indigo-400 text-indigo-600 focus:ring-indigo-500"
            disabled={isDisabled}
            required
          />
          Tôi đồng ý nhận việc
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2 text-sm font-semibold text-rose-900">
          <input
            type="radio"
            name="decision"
            value="DECLINE"
            className="h-4 w-4 border-rose-400 text-rose-600 focus:ring-rose-500"
            disabled={isDisabled}
            required
          />
          Tôi từ chối đề nghị
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm text-slate-700">
        <span>Ghi chú (tuỳ chọn)</span>
        <textarea
          name="note"
          rows={3}
          placeholder="Chia sẻ thời gian nhận việc mong muốn hoặc lý do từ chối..."
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          disabled={isDisabled}
        />
      </label>
      <button
        type="submit"
        disabled={isDisabled}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Đang gửi phản hồi..." : "Gửi phản hồi"}
      </button>
      {state?.error ? (
        <p className="text-sm font-semibold text-rose-600">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="text-sm font-semibold text-emerald-600">{state.success}</p>
      ) : null}
    </form>
  );
}
