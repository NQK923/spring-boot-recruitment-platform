"use client";

import Link from "next/link";
import { useActionState } from "react";
import { applyToJobAction, type ApplyState } from "@/app/jobs/[jobId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";

type CandidateCvOption = {
  id: number;
  versionName: string;
  isDefault: boolean;
  createdAt: string | null;
};

type Props = {
  jobPostingId: number;
  candidateCvs: CandidateCvOption[];
};

const initialState: ApplyState = {};

function formatCvDate(value: string | null) {
  if (!value) {
    return "";
  }
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dt);
}

export function ApplyForm({ jobPostingId, candidateCvs }: Props) {
  const [state, formAction, pending] = useActionState(
    applyToJobAction.bind(null, jobPostingId),
    initialState
  );
  const hasCvs = candidateCvs.length > 0;

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-border bg-bg/70 p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-text">Ứng tuyển vị trí này</h2>
        <p className="text-sm text-muted">
          Gửi hồ sơ cùng CV mới nhất. Bạn có thể cập nhật lại trong portal ứng viên.
        </p>
      </div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted">
        CV đính kèm (tuỳ chọn)
        {hasCvs ? (
          <select
            name="cvId"
            defaultValue=""
            disabled={pending}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">— Chọn CV muốn gửi —</option>
            {candidateCvs.map((cv) => {
              const createdLabel = formatCvDate(cv.createdAt);
              return (
                <option key={cv.id} value={cv.id}>
                  {cv.versionName}
                  {cv.isDefault ? " · Mặc định" : ""}
                  {createdLabel ? ` · ${createdLabel}` : ""}
                </option>
              );
            })}
          </select>
        ) : (
          <p className="mt-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Bạn chưa lưu CV nào. Hãy vào{" "}
            <Link href={`${ROUTES.candidateProfile}#cvs`} className="font-semibold text-primary-600 underline underline-offset-4">
              Thư viện CV
            </Link>{" "}
            để tải lên trước khi ứng tuyển.
          </p>
        )}
      </label>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted">
        Nguồn (tuỳ chọn)
        <Input
          name="source"
          placeholder="Ví dụ: Career site, LinkedIn"
          disabled={pending}
          className="mt-1"
        />
      </label>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Đang gửi..." : "Gửi hồ sơ"}
      </Button>
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
    </form>
  );
}
