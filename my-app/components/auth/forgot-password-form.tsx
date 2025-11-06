"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type ForgotPasswordFormState } from "@/app/(auth)/auth/forgot-password/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ForgotPasswordFormState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

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
        <p className="text-xs text-slate-500 font-medium">
          Chúng tôi sẽ gửi mã gồm sáu chữ số tới email này nếu tài khoản được xác minh.
        </p>
      </div>
      {state?.error ? (
        <div className="rounded-xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-red-50 px-4 py-3 text-sm font-semibold text-rose-700">
          ❌ {state.error}
        </div>
      ) : null}
      {state?.success ? (
        <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          ✓ {state.success}
        </div>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={pending}>
        {pending ? "Đang gửi mã đặt lại..." : "Gửi mã đặt lại"}
      </Button>
    </form>
  );
}
