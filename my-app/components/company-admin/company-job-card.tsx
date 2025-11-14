"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { UpdateJobForm } from "@/components/jobs/update-job-form";
import type { JobPosting, JobPosition } from "@/lib/types";

const JOB_STATUS_PILLS: Record<JobPosting["status"], string> = {
  DRAFT: "border border-amber-200 bg-amber-50 text-amber-700",
  PUBLISHED: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  PAUSED: "border border-orange-200 bg-orange-50 text-orange-700",
  CLOSED: "border border-gray-200 bg-gray-50 text-gray-600",
};

const STATUS_LABELS: Record<JobPosting["status"], string> = {
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

type CompanyJobCardProps = {
  job: JobPosting;
  positions: JobPosition[];
};

function formatTimestamp(value?: string | null) {
  if (!value) return "Không rõ";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatStatusLabel(status: JobPosting["status"]) {
  return STATUS_LABELS[status] ?? status.charAt(0) + status.slice(1).toLowerCase();
}

export function CompanyJobCard({ job, positions }: CompanyJobCardProps) {
  const [editing, setEditing] = useState(false);
  const pillClass = JOB_STATUS_PILLS[job.status ?? "DRAFT"] ?? JOB_STATUS_PILLS.DRAFT;

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {job.jobPosition?.department || "Chưa phân phòng ban"}
          </p>
          <h3 className="mt-1 truncate text-base font-bold text-slate-900">{job.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className={["inline-flex items-center rounded-full px-3 py-1 font-semibold", pillClass].join(" ")}>
              {formatStatusLabel(job.status ?? "DRAFT")}
            </span>
            {job.location ? <span className="flex items-center gap-1">📍 {job.location}</span> : null}
            {job.workType ? (
              <span className="flex items-center gap-1">🧭 {WORK_TYPE_LABELS[job.workType.toUpperCase()] ?? job.workType}</span>
            ) : null}
            {job.jobPosition?.title ? <span className="flex items-center gap-1">🏷 {job.jobPosition.title}</span> : null}
            {job.salaryRange ? <span className="flex items-center gap-1">💰 {job.salaryRange}</span> : null}
          </div>
        </div>
        {job.status?.toUpperCase() === "PUBLISHED" ? (
          <Link
            href={`${ROUTES.jobs}/${job.id}`}
            className="inline-flex items-center rounded-full border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:border-blue-300 hover:text-blue-700"
          >
            Xem bài
          </Link>
        ) : null}
      </div>

      <div className="mt-3 flex-1">
        <p className="text-xs text-slate-500">Cập nhật {formatTimestamp(job.updatedAt)}</p>
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">
        <Button
          type="button"
          variant={editing ? "ghost" : "secondary"}
          size="sm"
          onClick={() => setEditing((prev) => !prev)}
        >
          {editing ? "Đóng" : "Chỉnh sửa"}
        </Button>
      </div>

      {editing ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <UpdateJobForm job={job} positions={positions} />
        </div>
      ) : null}
    </div>
  );
}

