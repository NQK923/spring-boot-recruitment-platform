"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { UpdateJobForm } from "@/components/jobs/update-job-form";
import type { JobPosting, JobPosition } from "@/lib/types";

const JOB_STATUS_PILLS: Record<JobPosting["status"], string> = {
  DRAFT: "border border-foreground/15 bg-surface/80 text-foreground/65",
  PUBLISHED: "border border-accent/25 bg-accent/10 text-accent",
  PAUSED: "border border-foreground/15 bg-foreground/10 text-foreground/70",
  CLOSED: "border border-foreground/20 bg-foreground/5 text-foreground/60",
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
    <div className="space-y-4 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 shadow-[0_12px_26px_rgba(15,23,42,0.08)] transition hover:border-accent/30 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground sm:text-base">{job.title}</p>
            <span className={["inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize", pillClass].join(" ")}>
              {formatStatusLabel(job.status ?? "DRAFT")}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
            {job.jobPosition?.department ? <span>{job.jobPosition.department}</span> : null}
            {job.location ? (
              <span className="flex items-center gap-1 before:block before:h-1 before:w-1 before:rounded-full before:bg-foreground/40">
                {job.location}
              </span>
            ) : null}
            {job.workType ? (
              <span className="flex items-center gap-1 before:block before:h-1 before:w-1 before:rounded-full before:bg-foreground/40">
                {WORK_TYPE_LABELS[job.workType.toUpperCase()] ?? job.workType}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-foreground/60">
            Tạo lúc {formatTimestamp(job.createdAt)} · Cập nhật {formatTimestamp(job.updatedAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-xs">
          <Link
            href={`${ROUTES.jobs}/${job.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition hover:text-foreground"
          >
            Xem bài tuyển dụng
            <span aria-hidden>↗</span>
          </Link>
          {job.recruiterId ? (
            <span className="rounded-full border border-foreground/10 bg-surface px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-foreground/60">
              Phụ trách #{job.recruiterId}
            </span>
          ) : (
            <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              Chưa có phụ trách
            </span>
          )}
        </div>
      </div>

      {job.description ? (
        <p className="text-xs text-foreground/65">{job.description}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground/50">
          {job.salaryRange ? <span>{job.salaryRange}</span> : null}
          {job.jobPosition?.title ? (
            <span className="flex items-center gap-1 before:block before:h-1 before:w-1 before:rounded-full before:bg-foreground/40">
              {job.jobPosition.title}
            </span>
          ) : null}
        </div>
        <Button
          type="button"
          variant={editing ? "ghost" : "secondary"}
          size="sm"
          onClick={() => setEditing((prev) => !prev)}
        >
          {editing ? "Đóng chỉnh sửa" : "Chỉnh sửa vị trí"}
        </Button>
      </div>

      {editing ? (
        <div className="border-t border-foreground/10 pt-4">
          <UpdateJobForm job={job} positions={positions} />
        </div>
      ) : null}
    </div>
  );
}

