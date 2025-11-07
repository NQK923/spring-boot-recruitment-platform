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
        <label className="text-sm font-bold text-slate-900" htmlFor="email">
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
        <label className="text-sm font-bold text-slate-900" htmlFor="otp">
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
        <p className="text-xs text-slate-500 font-medium">
          Nhập mã sáu chữ số từ email. Mỗi mã sẽ hết hạn sau 10 phút kể từ khi cấp.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900" htmlFor="newPassword">
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
        <div className="rounded-xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-red-50 px-4 py-3 text-sm font-semibold text-rose-700">
          ❌ {state.error}
        </div>
      ) : null}
      <Button className="w-full font-semibold" size="lg" type="submit" disabled={pending}>
        {pending ? "Đang cập nhật mật khẩu..." : "Đặt lại mật khẩu"}
      </Button>
      <p className="text-center text-sm font-medium text-slate-600">
        Đã nhớ mật khẩu?{" "}
        <Link className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline" href={ROUTES.signIn}>
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
