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
    <div className="flex h-full flex-col rounded-2xl border-2 border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-300">
      <div className="space-y-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <h3 className="min-h-[3.5rem] text-lg font-bold text-slate-900 leading-tight">{job.title}</h3>
            <span className={["inline-flex items-center rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm", pillClass].join(" ")}>
              {formatStatusLabel(job.status ?? "DRAFT")}
            </span>
          </div>
          {job.status === "PUBLISHED" ? (
            <Link
              href={`${ROUTES.jobs}/${job.id}`}
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              Xem
              <span aria-hidden>↗</span>
            </Link>
          ) : null}
        </div>

        <div className="flex min-h-[2.5rem] flex-wrap items-center gap-3 text-sm text-slate-700">
          {job.jobPosition?.department ? <span className="font-semibold">{job.jobPosition.department}</span> : null}
          {job.location ? (
            <span className="flex items-center gap-2 before:block before:h-2 before:w-2 before:rounded-full before:bg-blue-400">
              {job.location}
            </span>
          ) : null}
          {job.workType ? (
            <span className="flex items-center gap-2 before:block before:h-2 before:w-2 before:rounded-full before:bg-sky-400">
              {WORK_TYPE_LABELS[job.workType.toUpperCase()] ?? job.workType}
            </span>
          ) : null}
        </div>

        {job.recruiterId ? (
          <span className="inline-flex items-center rounded-full border-2 border-blue-200 bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
            Phụ trách #{job.recruiterId}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border-2 border-amber-200 bg-gradient-to-r from-amber-500 to-orange-400 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
            Chưa có phụ trách
          </span>
        )}
      </div>

      <div className="flex-1 min-h-[5rem] py-4">
        {job.description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-700">{job.description}</p>
        ) : (
          <p className="text-sm italic text-slate-500">Chưa có mô tả công việc</p>
        )}
      </div>

      <div className="mt-auto space-y-4 border-t-2 border-blue-100 pt-4 flex-shrink-0">
        <div className="flex min-h-[2.5rem] flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
          {job.salaryRange ? (
            <span className="rounded-lg border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 px-4 py-2">
              {job.salaryRange}
            </span>
          ) : null}
          {job.jobPosition?.title ? (
            <span className="flex items-center gap-2 rounded-lg border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 px-4 py-2 before:block before:h-2 before:w-2 before:rounded-full before:bg-blue-500">
              {job.jobPosition.title}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            Cập nhật {formatTimestamp(job.updatedAt)}
          </p>
          <Button
            type="button"
            variant={editing ? "ghost" : "secondary"}
            size="sm"
            onClick={() => setEditing((prev) => !prev)}
          >
            {editing ? "Đóng" : "Chỉnh sửa"}
          </Button>
        </div>
      </div>

      {editing ? (
        <div className="border-t-2 border-blue-100 pt-5 mt-5">
          <UpdateJobForm job={job} positions={positions} />
        </div>
      ) : null}
    </div>
  );
}

