"use client";

import { useActionState } from "react";
import { applyToJobAction, type ApplyState } from "@/app/jobs/[jobId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  jobPostingId: number;
};

const initialState: ApplyState = {};

export function ApplyForm({ jobPostingId }: Props) {
  const [state, formAction, pending] = useActionState(
    applyToJobAction.bind(null, jobPostingId),
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-border bg-bg/70 p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-text">Ứng tuyển vị trí này</h2>
        <p className="text-sm text-muted">
          Gửi hồ sơ cùng CV mới nhất. Bạn có thể cập nhật lại trong portal ứng viên.
        </p>
      </div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted">
        Mã CV (không bắt buộc)
        <Input
          name="cvId"
          type="number"
          min={0}
          placeholder="Nhập mã nhận diện CV"
          disabled={pending}
          className="mt-1"
        />
      </label>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted">
        Nguồn (không bắt buộc)
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
