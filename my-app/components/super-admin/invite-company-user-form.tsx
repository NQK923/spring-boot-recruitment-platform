"use client";

import { useActionState } from "react";
import { inviteCompanyUserAction, type InviteCompanyUserState } from "@/app/dashboard/super-admin/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CompanyOption = {
  id: number;
  name: string;
};

type InviteCompanyUserFormProps = {
  companies: CompanyOption[];
};

const initialState: InviteCompanyUserState = {};

export function InviteCompanyUserForm({ companies }: InviteCompanyUserFormProps) {
  const [state, formAction, pending] = useActionState(inviteCompanyUserAction, initialState);

  return (
    <form className="space-y-4 text-sm" action={formAction}>
      <div className="space-y-2">
        <label htmlFor="invite-company" className="font-bold text-purple-900">
          Công ty
        </label>
        <select
          id="invite-company"
          name="companyId"
          defaultValue=""
          className="h-10 w-full rounded-2xl border-2 border-purple-300 bg-white px-3 text-sm text-slate-900 font-medium shadow-md focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          required
        >
          <option value="" disabled>
            Chọn công ty
          </option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="invite-email" className="font-bold text-purple-900">
          Địa chỉ email
        </label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          placeholder="quantri@congty.vn"
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="invite-role" className="font-bold text-purple-900">
          Vai trò
        </label>
        <select
          id="invite-role"
          name="role"
          defaultValue="COMPANY_ADMIN"
          className="h-10 w-full rounded-2xl border-2 border-purple-300 bg-white px-3 text-sm text-slate-900 font-medium shadow-md focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
        >
          <option value="COMPANY_ADMIN">Quản trị viên công ty</option>
          <option value="RECRUITER">Nhà tuyển dụng</option>
        </select>
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
        {pending ? "Đang gửi..." : "📧 Gửi lời mời"}
      </Button>
    </form>
  );
}
