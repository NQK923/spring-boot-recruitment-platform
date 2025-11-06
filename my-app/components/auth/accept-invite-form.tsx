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
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-semibold">Đã chấp nhận lời mời</p>
          <p className="mt-2">
            Tài khoản <span className="font-medium">{email}</span> đã sẵn sàng. Đăng nhập để bắt đầu phối hợp cùng đội ngũ.
          </p>
        </div>
        <Button
          className="w-full"
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
      <div className="rounded-2xl border border-border bg-surface/60 px-4 py-4 text-sm text-muted">
        <p>
          Bạn sẽ tham gia Talentflow với vai trò{" "}
          <span className="font-semibold text-text">{roleLabel}</span> bằng email{" "}
          <span className="font-semibold text-text">{email}</span>.
        </p>
        {formattedExpiry ? (
          <p className="mt-2 text-muted">Lời mời sẽ hết hạn vào {formattedExpiry}.</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-text" htmlFor="password">
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
        <label className="text-sm font-semibold text-text" htmlFor="confirmPassword">
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
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button className="w-full" disabled={pending} size="lg" type="submit">
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
