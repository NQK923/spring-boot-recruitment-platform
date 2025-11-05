"use client";

import { useActionState } from "react";
import { updateJobAction, type JobFormState } from "@/app/dashboard/jobs/actions";
import { Button } from "@/components/ui/button";
import type { JobPosting, JobPosition, JobStatus } from "@/lib/types";

type Props = {
  job: JobPosting;
  positions: JobPosition[];
};

const initialState: JobFormState = {};

const STATUSES: JobStatus[] = ["DRAFT", "PUBLISHED", "PAUSED", "CLOSED"];
const WORK_TYPES = ["REMOTE", "HYBRID", "ONSITE"];

const STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đang hiển thị",
  PAUSED: "Tạm dừng",
  CLOSED: "Đã đóng",
};

const WORK_TYPE_LABELS: Record<string, string> = {
  REMOTE: "Làm việc từ xa",
  HYBRID: "Hybrid",
  ONSITE: "Tại văn phòng",
};

export function UpdateJobForm({ job, positions }: Props) {
  const [state, formAction, pending] = useActionState(
    updateJobAction.bind(null, job.id),
    initialState
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-foreground/10 bg-background/80 p-4">
      <div className="flex flex-col gap-1 text-sm">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
          Chức danh
          <input
            name="title"
            defaultValue={job.title}
            required
            disabled={pending}
            className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
          />
        </label>
        <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/40">
          Cập nhật gần nhất {job.updatedAt ? new Date(job.updatedAt).toLocaleString() : "gần đây"}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
          Trạng thái
          <select
            name="status"
            defaultValue={job.status ?? "DRAFT"}
            disabled={pending}
            className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status] ?? status}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
          Hình thức làm việc
          <select
            name="workType"
            defaultValue={job.workType ?? "REMOTE"}
            disabled={pending}
            className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
          >
            {WORK_TYPES.map((type) => (
              <option key={type} value={type}>
                {WORK_TYPE_LABELS[type] ?? type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
        Địa điểm
        <input
          name="location"
          defaultValue={job.location ?? ""}
          disabled={pending}
          className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
        Vị trí chuẩn hóa
        <select
          name="positionId"
          defaultValue={job.jobPosition?.id ? String(job.jobPosition.id) : ""}
          disabled={pending}
          className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
        >
          <option value="">Chưa gán</option>
          {positions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.title}
              {position.level ? ` - ${position.level}` : ""}{" "}
              {position.department ? ` (${position.department})` : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
        Khoảng lương
        <input
          name="salaryRange"
          defaultValue={job.salaryRange ?? ""}
          disabled={pending}
          className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
        Mô tả
        <textarea
          name="description"
          defaultValue={job.description ?? ""}
          rows={3}
          disabled={pending}
          className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
        Yêu cầu
        <textarea
          name="requirements"
          defaultValue={job.requirements ?? ""}
          rows={3}
          disabled={pending}
          className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
        Phúc lợi
        <textarea
          name="benefits"
          defaultValue={job.benefits ?? ""}
          rows={3}
          disabled={pending}
          className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu việc làm"}
      </Button>
    </form>
  );
}


