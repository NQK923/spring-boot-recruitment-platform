"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type RegisterFormState } from "@/app/(auth)/auth/register/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";

const initialState: RegisterFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

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
        <label className="text-sm font-bold text-slate-900" htmlFor="password">
          Mật khẩu
        </label>
        <Input
          id="password"
          name="password"
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
      <Button className="w-full" size="lg" type="submit" disabled={pending}>
        {pending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </Button>
      <div className="text-center text-sm font-medium text-slate-600">
        Đã có tài khoản?{" "}
        <Link className="cursor-pointer font-bold text-indigo-600 hover:text-indigo-700 hover:underline" href={ROUTES.signIn}>
          Đăng nhập
        </Link>
      </div>
    </form>
  );
}
