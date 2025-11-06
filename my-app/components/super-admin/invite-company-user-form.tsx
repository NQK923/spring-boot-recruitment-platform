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
        <label htmlFor="invite-company" className="font-semibold text-foreground">
          Công ty
        </label>
        <select
          id="invite-company"
          name="companyId"
          defaultValue=""
          className="h-9 w-full rounded-2xl border border-border/70 bg-surface/98 px-3 text-sm text-foreground shadow-[0_6px_18px_rgba(var(--shadow-soft),0.22)] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
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
        <label htmlFor="invite-email" className="font-semibold text-foreground">
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
        <label htmlFor="invite-role" className="font-semibold text-foreground">
          Vai trò
        </label>
        <select
          id="invite-role"
          name="role"
          defaultValue="COMPANY_ADMIN"
          className="h-9 w-full rounded-2xl border border-border/70 bg-surface/98 px-3 text-sm text-foreground shadow-[0_6px_18px_rgba(var(--shadow-soft),0.22)] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="COMPANY_ADMIN">Quản trị viên công ty</option>
          <option value="RECRUITER">Nhà tuyển dụng</option>
        </select>
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
        {pending ? "Đang gửi..." : "Gửi lời mời"}
      </Button>
    </form>
  );
}
