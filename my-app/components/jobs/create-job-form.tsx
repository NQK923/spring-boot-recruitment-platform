"use client";

import { useActionState } from "react";
import { createJobAction, type JobFormState } from "@/app/dashboard/jobs/actions";
import { Button } from "@/components/ui/button";
import type { JobPosition } from "@/lib/types";

type Props = {
  positions: JobPosition[];
};

const initialState: JobFormState = {};

const WORK_TYPES = ["REMOTE", "HYBRID", "ONSITE"];

const WORK_TYPE_LABELS: Record<string, string> = {
  REMOTE: "Làm việc từ xa",
  HYBRID: "Hybrid",
  ONSITE: "Tại văn phòng",
};

export function CreateJobForm({ positions }: Props) {
  const [state, formAction, pending] = useActionState(createJobAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-bg/80 p-6 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-text">Tạo việc làm mới</h3>
        <p className="text-sm text-muted">
          Bài đăng sẽ hiển thị cho nhà tuyển dụng ngay lập tức và xuất bản lên bảng việc làm công khai khi bạn đăng.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm text-text/80">
        Chức danh
        <input
          name="title"
          placeholder="Senior Backend Engineer"
          required
          disabled={pending}
          className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-text/80">
          Hình thức làm việc
          <select
            name="workType"
            defaultValue="REMOTE"
            disabled={pending}
            className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition focus:border-foreground/40 focus:ring-0"
          >
            {WORK_TYPES.map((option) => (
              <option key={option} value={option}>
                {WORK_TYPE_LABELS[option] ?? option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-text/80">
          Địa điểm
          <input
            name="location"
            placeholder="Ho Chi Minh City (Hybrid)"
            disabled={pending}
            className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition focus:border-foreground/40 focus:ring-0"
          />
        </label>
      </div>

        <label className="flex flex-col gap-1 text-sm text-text/80">
          Vị trí chuẩn hóa
        <select
          name="positionId"
          defaultValue=""
          disabled={pending}
          className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition focus:border-foreground/40 focus:ring-0"
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

      <label className="flex flex-col gap-1 text-sm text-text/80">
        Mô tả công việc
        <textarea
          name="description"
          placeholder="Mô tả cơ hội, trách nhiệm và kỳ vọng."
          rows={4}
          disabled={pending}
          className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-text/80">
        Yêu cầu
        <textarea
          name="requirements"
          placeholder="Liệt kê các yêu cầu chính về kỹ năng/kinh nghiệm."
          rows={4}
          disabled={pending}
          className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-text/80">
        Khoảng lương
        <input
          name="salaryRange"
          placeholder="e.g. 40,000,000 - 60,000,000 VND / month"
          disabled={pending}
          className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-text/80">
        Phúc lợi
        <textarea
          name="benefits"
          placeholder="Tóm tắt phúc lợi, trợ cấp hoặc điểm hấp dẫn khác."
          rows={3}
          disabled={pending}
          className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Đang tạo..." : "Tạo việc làm"}
      </Button>
    </form>
  );
}


