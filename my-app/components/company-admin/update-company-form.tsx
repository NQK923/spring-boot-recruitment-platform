"use client";

import { useActionState } from "react";
import { updateCompanyAction, type UpdateCompanyState } from "@/app/dashboard/company/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CompanyProfile = {
  name: string;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  companySize?: string | null;
  companyAddress?: string | null;
};

const initialState: UpdateCompanyState = {};

export function UpdateCompanyForm({ profile }: { profile: CompanyProfile }) {
  const [state, formAction, pending] = useActionState(updateCompanyAction, initialState);

  return (
    <form className="space-y-5 text-sm" action={formAction}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3">
          <label htmlFor="company-name" className="block font-bold text-slate-900">
            Tên công ty
          </label>
          <Input
            id="company-name"
            name="name"
            defaultValue={profile.name}
            placeholder="Tên công ty"
            required
          />
        </div>
        <div className="space-y-3">
          <label htmlFor="company-website" className="block font-bold text-slate-900">
            Website
          </label>
          <Input
            id="company-website"
            name="website"
            defaultValue={profile.website ?? ""}
            placeholder="https://example.com"
          />
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3">
          <label htmlFor="company-logo" className="block font-bold text-slate-900">
            URL logo
          </label>
          <Input
            id="company-logo"
            name="logoUrl"
            defaultValue={profile.logoUrl ?? ""}
            placeholder="https://cdn.example.com/logo.png"
          />
        </div>
        <div className="space-y-3">
          <label htmlFor="company-size" className="block font-bold text-slate-900">
            Quy mô công ty
          </label>
          <Input
            id="company-size"
            name="companySize"
            defaultValue={profile.companySize ?? ""}
            placeholder="Ví dụ: 51-200 nhân sự"
          />
        </div>
      </div>
      <div className="space-y-3">
        <label htmlFor="company-address" className="block font-bold text-slate-900">
          Trụ sở / địa chỉ chính
        </label>
        <textarea
          id="company-address"
          name="companyAddress"
          defaultValue={profile.companyAddress ?? ""}
          placeholder="123 Nguyen Trai, District 1, Ho Chi Minh City"
          className="min-h-[80px] w-full rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div className="space-y-3">
        <label htmlFor="company-description" className="block font-bold text-slate-900">
          Mô tả
        </label>
        <textarea
          id="company-description"
          name="description"
          defaultValue={profile.description ?? ""}
          placeholder="Chia sẻ phần giới thiệu ngắn để hiển thị trên bài tuyển dụng và dashboard nội bộ."
          className="min-h-[100px] w-full rounded-2xl border-2 border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
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
      <Button type="submit" size="md" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
