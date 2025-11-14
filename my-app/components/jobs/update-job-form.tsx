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
    <form action={formAction} className="space-y-5 rounded-2xl border-2 border-blue-100 bg-white p-5">
      <div className="flex flex-col gap-2 text-sm">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Chức danh</span>
          <input
            name="title"
            defaultValue={job.title}
            required
            disabled={pending}
            className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
        </label>
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Cập nhật gần nhất {job.updatedAt ? new Date(job.updatedAt).toLocaleString() : "gần đây"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Trạng thái</span>
          <select
            name="status"
            defaultValue={job.status ?? "DRAFT"}
            disabled={pending}
            className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status] ?? status}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Hình thức làm việc</span>
          <select
            name="workType"
            defaultValue={job.workType ?? "REMOTE"}
            disabled={pending}
            className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          >
            {WORK_TYPES.map((type) => (
              <option key={type} value={type}>
                {WORK_TYPE_LABELS[type] ?? type}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Số lượng tuyển</span>
          <input
            name="hiringQuantity"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            defaultValue={String(Math.max(job.hiringQuantity ?? 1, 1))}
            required
            disabled={pending}
            className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Địa điểm</span>
        <input
          name="location"
          defaultValue={job.location ?? ""}
          disabled={pending}
          className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Vị trí chuẩn hóa</span>
        <select
          name="positionId"
          defaultValue={job.jobPosition?.id ? String(job.jobPosition.id) : ""}
          disabled={pending}
          className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
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

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Khoảng lương</span>
        <input
          name="salaryRange"
          defaultValue={job.salaryRange ?? ""}
          disabled={pending}
          className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Mô tả</span>
        <textarea
          name="description"
          defaultValue={job.description ?? ""}
          rows={3}
          disabled={pending}
          className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Yêu cầu</span>
        <textarea
          name="requirements"
          defaultValue={job.requirements ?? ""}
          rows={3}
          disabled={pending}
          className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Phúc lợi</span>
        <textarea
          name="benefits"
          defaultValue={job.benefits ?? ""}
          rows={3}
          disabled={pending}
          className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      {state?.error ? (
        <p className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu việc làm"}
      </Button>
    </form>
  );
}


