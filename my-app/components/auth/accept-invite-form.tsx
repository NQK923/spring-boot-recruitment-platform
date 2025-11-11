"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Role } from "@/lib/types";
import { acceptInviteAction, type AcceptInviteFormState } from "@/app/(auth)/auth/accept-invite/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";

const initialState: AcceptInviteFormState = {};

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Quản trị cấp cao",
  COMPANY_ADMIN: "Quản trị viên công ty",
  RECRUITER: "Nhà tuyển dụng",
  CANDIDATE: "Ứng viên",
};

type AcceptInviteFormProps = {
  token: string;
  email: string;
  role: Role;
  expiresAt: string;
};

function formatExpiry(expiresAt: string) {
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function AcceptInviteForm({ token, email, role, expiresAt }: AcceptInviteFormProps) {
  const [state, formAction, pending] = useActionState(acceptInviteAction, initialState);
  const router = useRouter();

  if (state?.success) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-4 text-sm">
          <p className="font-bold text-emerald-800">✓ Đã chấp nhận lời mời</p>
          <p className="mt-2 font-semibold text-emerald-700">
            Tài khoản <span className="font-bold">{email}</span> đã sẵn sàng. Đăng nhập để bắt đầu làm việc cùng đội ngũ.
          </p>
        </div>
        <Button
          className="w-full font-semibold"
          size="lg"
          type="button"
          onClick={() => router.push(ROUTES.signIn)}
        >
          Tiếp tục đăng nhập
        </Button>
      </div>
    );
  }

  const formattedExpiry = formatExpiry(expiresAt);
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <form className="space-y-6" action={formAction}>
      <input type="hidden" name="token" value={token} />
      <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4 text-sm">
        <p className="font-semibold text-slate-700">
          Bạn sẽ tham gia TalentFlow với vai trò{" "}
          <span className="font-bold text-indigo-700">{roleLabel}</span> bằng email{" "}
          <span className="font-bold text-indigo-700">{email}</span>.
        </p>
        {formattedExpiry ? (
          <p className="mt-2 font-medium text-slate-600">⏰ Lời mời sẽ hết hạn vào {formattedExpiry}.</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900" htmlFor="password">
          Tạo mật khẩu
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Tối thiểu 8 ký tự"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900" htmlFor="confirmPassword">
          Xác nhận mật khẩu
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state?.error ? (
        <div className="rounded-xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-red-50 px-4 py-3 text-sm font-semibold text-rose-700">
          ❌ {state.error}
        </div>
      ) : null}

      <Button className="w-full font-semibold" disabled={pending} size="lg" type="submit">
        {pending ? "Đang kích hoạt tài khoản..." : "Kích hoạt tài khoản"}
      </Button>

      <p className="text-center text-xs text-text/50">
        Cần hỗ trợ? Liên hệ{" "}
        <Link className="font-medium text-text hover:underline" href="mailto:support@talentflow.app">
          support@talentflow.app
        </Link>{" "}
        hoặc quản trị viên công ty của bạn.
      </p>
    </form>
  );
}
