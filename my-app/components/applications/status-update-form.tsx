"use client";

import { useActionState, useMemo } from "react";
import { updateStatusAction, type ActionState } from "@/app/dashboard/applications/[applicationId]/actions";
import type { ApplicationStatus } from "@/lib/types";

const LINEAR_STATUSES: ApplicationStatus[] = ["APPLIED", "SCREENING", "INTERVIEWING", "OFFERED", "HIRED"];

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

function getNextStatus(current: ApplicationStatus): ApplicationStatus | null {
  const index = LINEAR_STATUSES.indexOf(current);
  if (index === -1 || index >= LINEAR_STATUSES.length - 1) {
    return null;
  }
  return LINEAR_STATUSES[index + 1];
}

export function StatusUpdateForm({ applicationId, currentStatus }: Props) {
  const [state, formAction, pending] = useActionState(
    updateStatusAction.bind(null, applicationId),
    initialState
  );

  const defaultTimezone = useMemo(() => {
    if (typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Asia/Ho_Chi_Minh";
    }
    return "Asia/Ho_Chi_Minh";
  }, []);

  const nextStatus = getNextStatus(currentStatus);
  const needsInterviewDetails = nextStatus === "INTERVIEWING";
  const needsOfferDetails = nextStatus === "OFFERED";

  return (
    <div className="space-y-6">
      {nextStatus ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <form className="space-y-4" action={formAction}>
            <input type="hidden" name="status" value={nextStatus} />
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Bước tiếp theo</p>
              <h4 className="text-xl font-bold text-slate-900">
                {STATUS_LABELS[currentStatus]} &rarr; {STATUS_LABELS[nextStatus]}
              </h4>
              <p className="text-sm text-slate-600">
                Bạn chỉ có thể tiến một bước mỗi lần; hệ thống sẽ gửi email tự động khi cập nhật.
              </p>
            </header>

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
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
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
                `Chuyển sang ${STATUS_LABELS[nextStatus]}`
              )}
            </button>
          </form>

          <div className="border-t border-slate-200 pt-4">
            <form action={formAction}>
              <input type="hidden" name="status" value="REJECTED" />
              <button
                type="submit"
                disabled={pending}
                className="w-full cursor-pointer rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:border-rose-400 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Từ chối ứng viên
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Hồ sơ đã ở bước cuối cùng hoặc đã bị đánh dấu từ chối. Không thể tiến thêm trạng thái nào khác.
        </div>
      )}

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
    </div>
  );
}
