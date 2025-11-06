"use client";

import { useActionState, useEffect } from "react";
import { updateStatusAction, type ActionState } from "@/app/dashboard/applications/[applicationId]/actions";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => {
        const banner = document.getElementById("status-success-banner");
        banner?.remove();
      }, 3000);
    }
  }, [state?.success]);

  return (
    <form className="flex flex-col gap-3" action={formAction}>
      <select
        name="status"
        defaultValue={currentStatus}
        className="h-11 rounded-xl border border-border bg-bg px-4 text-sm"
        disabled={pending}
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status] ?? status}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Đang cập nhật..." : "Cập nhật trạng thái"}
      </Button>
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p
          id="status-success-banner"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700"
        >
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
