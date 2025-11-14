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
    <form action={formAction} className="space-y-5 rounded-2xl border-2 border-blue-100 bg-white p-7 shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Tạo việc làm mới</h3>
        <p className="mt-2 text-sm text-slate-600">
          Bài đăng sẽ hiển thị cho nhà tuyển dụng ngay lập tức và xuất bản lên bảng việc làm công khai khi bạn đăng.
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm text-slate-900">
        <span className="font-bold">Chức danh</span>
        <input
          name="title"
          placeholder="Senior Backend Engineer"
          required
          disabled={pending}
          className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-slate-900">
          <span className="font-bold">Hình thức làm việc</span>
          <select
            name="workType"
            defaultValue="REMOTE"
            disabled={pending}
            className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          >
            {WORK_TYPES.map((option) => (
              <option key={option} value={option}>
                {WORK_TYPE_LABELS[option] ?? option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-900">
          <span className="font-bold">Địa điểm</span>
          <input
            name="location"
            placeholder="Ho Chi Minh City (Hybrid)"
            disabled={pending}
            className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-900">
          <span className="font-bold">Số lượng tuyển</span>
          <input
            name="hiringQuantity"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            defaultValue={1}
            placeholder="Ví dụ: 3"
            required
            disabled={pending}
            className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm text-slate-900">
        <span className="font-bold">Vị trí chuẩn hóa</span>
        <select
          name="positionId"
          defaultValue=""
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

      <label className="flex flex-col gap-2 text-sm text-slate-900">
        <span className="font-bold">Mô tả công việc</span>
        <textarea
          name="description"
          placeholder="Mô tả cơ hội, trách nhiệm và kỳ vọng."
          rows={4}
          disabled={pending}
          className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-900">
        <span className="font-bold">Yêu cầu</span>
        <textarea
          name="requirements"
          placeholder="Liệt kê các yêu cầu chính về kỹ năng/kinh nghiệm."
          rows={4}
          disabled={pending}
          className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-900">
        <span className="font-bold">Khoảng lương</span>
        <input
          name="salaryRange"
          placeholder="e.g. 40,000,000 - 60,000,000 VND / month"
          disabled={pending}
          className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-900">
        <span className="font-bold">Phúc lợi</span>
        <textarea
          name="benefits"
          placeholder="Tóm tắt phúc lợi, trợ cấp hoặc điểm hấp dẫn khác."
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

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Đang tạo..." : "Tạo việc làm"}
      </Button>
    </form>
  );
}


