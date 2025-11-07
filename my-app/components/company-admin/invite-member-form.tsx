"use client";

import { useActionState } from "react";
import { inviteCompanyMemberAction, type InviteMemberState } from "@/app/dashboard/company/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: InviteMemberState = {};

export function InviteMemberForm() {
  const [state, formAction, pending] = useActionState(inviteCompanyMemberAction, initialState);

  return (
    <form className="space-y-5 text-sm" action={formAction}>
      <div className="space-y-3">
        <label htmlFor="invite-email" className="block font-bold text-slate-900">
          Địa chỉ email
        </label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          placeholder="thanhvien@example.com"
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-3">
        <label htmlFor="invite-role" className="block font-bold text-slate-900">
          Vai trò
        </label>
        <select
          id="invite-role"
          name="role"
          defaultValue="RECRUITER"
          className="h-11 w-full rounded-2xl border-2 border-blue-100 bg-white px-4 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="COMPANY_ADMIN">Quản trị viên công ty</option>
          <option value="RECRUITER">Nhà tuyển dụng</option>
        </select>
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
      <Button type="submit" size="md" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Đang gửi..." : "Gửi lời mời"}
      </Button>
    </form>
  );
}
