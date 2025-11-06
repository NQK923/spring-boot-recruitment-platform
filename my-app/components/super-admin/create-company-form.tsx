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
        <label htmlFor="company-name" className="font-semibold text-foreground">
          Tên công ty
        </label>
        <Input id="company-name" name="name" placeholder="Công ty Mặt Trời" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="company-website" className="font-semibold text-foreground">
          Website
        </label>
        <Input id="company-website" name="website" placeholder="https://congty.vn" />
      </div>
      <div className="space-y-2">
        <label htmlFor="company-description" className="font-semibold text-foreground">
          Mô tả
        </label>
        <textarea
          id="company-description"
          name="description"
          placeholder="Tóm tắt ngắn gọn để nhà tuyển dụng nắm thông tin..."
          className="min-h-[96px] w-full rounded-2xl border border-border/70 bg-surface/98 px-4 py-3 text-sm text-foreground shadow-[0_6px_18px_rgba(var(--shadow-soft),0.22)] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="company-logo" className="font-semibold text-foreground">
          URL logo
        </label>
        <Input id="company-logo" name="logoUrl" placeholder="https://cdn.congty.vn/logo.png" />
      </div>
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" size="md" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Đang tạo..." : "Tạo công ty"}
      </Button>
    </form>
  );
}
