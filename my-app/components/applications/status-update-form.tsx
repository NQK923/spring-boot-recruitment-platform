"use client";

import { useActionState, useMemo, useState } from "react";
import { updateStatusAction, type ActionState } from "@/app/dashboard/applications/[applicationId]/actions";
import type { ApplicationStatus } from "@/lib/types";

const STATUSES: ApplicationStatus[] = ["APPLIED", "SCREENING", "INTERVIEWING", "OFFERED", "HIRED", "REJECTED"];

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Đã nộp",
  SCREENING: "Sàng lọc",
  INTERVIEWING: "Phỏng vấn",
  OFFERED: "Đề nghị",
  HIRED: "Đã tuyển",
  REJECTED: "Đã từ chối",
};

type Props = {
  applicationId: number;
  currentStatus: ApplicationStatus;
};

const initialState: ActionState = {};

export function StatusUpdateForm({ applicationId, currentStatus }: Props) {
  const [state, formAction, pending] = useActionState(
    updateStatusAction.bind(null, applicationId),
    initialState
  );
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(currentStatus);
  const defaultTimezone = useMemo(() => {
    if (typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Asia/Ho_Chi_Minh";
    }
    return "Asia/Ho_Chi_Minh";
  }, []);

  const needsInterviewDetails = selectedStatus === "INTERVIEWING";
  const needsOfferDetails = selectedStatus === "OFFERED";

  return (
    <form className="flex flex-col gap-4" action={formAction}>
      <select
        name="status"
        value={selectedStatus}
        onChange={(event) => setSelectedStatus(event.target.value as ApplicationStatus)}
        className="h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status] ?? status}
          </option>
        ))}
      </select>

      {needsInterviewDetails ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-800 shadow-inner">
          <p className="mb-3 font-semibold text-blue-900">Thông tin phỏng vấn bắt buộc</p>
          <label className="mb-3 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Thời gian phỏng vấn *</span>
            <input
              type="datetime-local"
              name="interviewScheduledAt"
              required
              className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={pending}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Múi giờ *</span>
              <input
                type="text"
                name="interviewTimezone"
                defaultValue={defaultTimezone}
                required
                className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={pending}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Địa điểm / liên kết *</span>
              <input
                type="text"
                name="interviewLocation"
                required
                placeholder="Phòng họp, Google Meet..."
                className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={pending}
              />
            </label>
          </div>
          <label className="mt-3 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Ghi chú cho ứng viên</span>
            <textarea
              name="interviewInstructions"
              rows={3}
              placeholder="Chuẩn bị tài liệu, người liên hệ..."
              className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={pending}
            />
          </label>
        </div>
      ) : null}

      {needsOfferDetails ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-slate-800 shadow-inner">
          <p className="mb-3 font-semibold text-amber-900">Thông tin đề nghị bắt buộc</p>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Mức lương đề nghị *</span>
              <input
                type="number"
                name="offerSalaryAmount"
                min="0"
                step="0.01"
                required
                placeholder="Ví dụ: 25000000"
                className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                disabled={pending}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Tiền tệ *</span>
              <input
                type="text"
                name="offerCurrency"
                defaultValue="VND"
                required
                className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                disabled={pending}
              />
            </label>
          </div>
          <label className="mt-3 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Hạn phản hồi</span>
            <input
              type="datetime-local"
              name="offerExpiresAt"
              className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              disabled={pending}
            />
          </label>
          <label className="mt-3 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Ghi chú gửi ứng viên</span>
            <textarea
              name="offerNotes"
              rows={3}
              placeholder="Chi tiết phúc lợi, thời gian nhận việc..."
              className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              disabled={pending}
            />
          </label>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Đang cập nhật...
          </span>
        ) : (
          "Cập nhật trạng thái"
        )}
      </button>
      {state?.error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{state.error}</p>
        </div>
      ) : null}
      {state?.success ? (
        <div
          id="status-success-banner"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{state.success}</p>
        </div>
      ) : null}
    </form>
  );
}
