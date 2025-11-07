"use client";

import { useActionState } from "react";
import { createCompanyAction, type CreateCompanyState } from "@/app/dashboard/super-admin/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: CreateCompanyState = {};

export function CreateCompanyForm() {
  const [state, formAction, pending] = useActionState(createCompanyAction, initialState);

  return (
    <form className="space-y-4 text-sm" action={formAction}>
      <div className="space-y-2">
        <label htmlFor="company-name" className="font-bold text-blue-900">
          Tên công ty
        </label>
        <Input id="company-name" name="name" placeholder="Công ty Mặt Trời" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="company-website" className="font-bold text-blue-900">
          Website
        </label>
        <Input id="company-website" name="website" placeholder="https://congty.vn" />
      </div>
      <div className="space-y-2">
        <label htmlFor="company-description" className="font-bold text-blue-900">
          Mô tả
        </label>
        <textarea
          id="company-description"
          name="description"
          placeholder="Tóm tắt ngắn gọn để nhà tuyển dụng nắm thông tin..."
          className="min-h-[96px] w-full rounded-2xl border-2 border-blue-300 bg-white px-4 py-3 text-sm text-slate-900 font-medium shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="company-logo" className="font-bold text-blue-900">
          URL logo
        </label>
        <Input id="company-logo" name="logoUrl" placeholder="https://cdn.congty.vn/logo.png" />
      </div>
      {state?.error ? (
        <p className="rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-3 text-sm text-red-700 font-medium">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 text-sm text-emerald-800 font-medium">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" size="md" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Đang tạo..." : "✨ Tạo công ty"}
      </Button>
    </form>
  );
}
