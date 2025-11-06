"use client";

import { useActionState } from "react";
import { inviteCompanyMemberAction, type InviteMemberState } from "@/app/dashboard/company/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: InviteMemberState = {};

export function InviteMemberForm() {
  const [state, formAction, pending] = useActionState(inviteCompanyMemberAction, initialState);

  return (
    <form className="space-y-4 text-sm" action={formAction}>
      <div className="space-y-2">
        <label htmlFor="invite-email" className="font-semibold text-text">
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
      <div className="space-y-2">
        <label htmlFor="invite-role" className="font-semibold text-text">
          Vai trò
        </label>
        <select
          id="invite-role"
          name="role"
          defaultValue="RECRUITER"
          className="h-9 w-full rounded-2xl border border-border bg-surface px-3 text-sm text-text shadow-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
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
      <Button type="submit" size="md" disabled={pending}>
        {pending ? "Đang gửi..." : "Gửi lời mời"}
      </Button>
    </form>
  );
}
