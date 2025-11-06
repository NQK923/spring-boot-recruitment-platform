"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type ResetPasswordFormState } from "@/app/(auth)/auth/reset-password/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";

const initialState: ResetPasswordFormState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form className="space-y-5" action={formAction}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-text" htmlFor="email">
          Địa chỉ email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="ban@example.com"
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-text" htmlFor="otp">
          Mã đặt lại
        </label>
        <Input
          id="otp"
          name="otp"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          placeholder="123456"
          autoComplete="one-time-code"
          required
        />
        <p className="text-xs text-text/55">
          Nhập mã sáu chữ số từ email. Mỗi mã sẽ hết hạn sau 10 phút kể từ khi cấp.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-text" htmlFor="newPassword">
          Mật khẩu mới
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="Tối thiểu 8 ký tự"
          autoComplete="new-password"
          required
        />
      </div>
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={pending}>
        {pending ? "Đang cập nhật mật khẩu..." : "Đặt lại mật khẩu"}
      </Button>
      <p className="text-center text-sm text-muted">
        Đã nhớ mật khẩu?{" "}
        <Link className="font-medium text-text hover:underline" href={ROUTES.signIn}>
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
