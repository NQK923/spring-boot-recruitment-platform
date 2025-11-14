"use client";

import { useActionState } from "react";
import {
  createJobPositionAction,
  type JobFormState,
} from "@/app/dashboard/jobs/actions";
import { Button } from "@/components/ui/button";

const initialState: JobFormState = {};

export function CreateJobPositionForm() {
  const [state, formAction, pending] = useActionState(
    createJobPositionAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border-2 border-indigo-100 bg-white/90 p-6 shadow-sm backdrop-blur"
    >
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          <span className="h-2 w-2 rounded-full bg-indigo-600" aria-hidden />
          Thư viện vị trí chuẩn hóa
        </p>
        <h3 className="text-lg font-bold text-slate-900">
          Thêm vị trí chuẩn hóa mới
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          Gán trước chức danh, phòng ban, cấp bậc để các bài đăng mới chỉ cần chọn từ danh
          sách có sẵn và báo cáo được thống nhất.
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm text-slate-900">
        <span className="font-bold">Chức danh chuẩn</span>
        <input
          name="positionTitle"
          placeholder="Ví dụ: Backend Engineer"
          required
          disabled={pending}
          className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-900">
          <span className="font-bold">Phòng ban (tuỳ chọn)</span>
          <input
            name="positionDepartment"
            placeholder="Engineering, Product..."
            disabled={pending}
            className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-900">
          <span className="font-bold">Cấp bậc (tuỳ chọn)</span>
          <input
            name="positionLevel"
            placeholder="Junior, Senior, Lead..."
            disabled={pending}
            className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

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
        {pending ? "Đang thêm..." : "Lưu vị trí"}
      </Button>
    </form>
  );
}
