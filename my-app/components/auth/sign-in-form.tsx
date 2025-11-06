"use client";

import { useActionState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInAction, type AuthFormState } from "@/app/(auth)/auth/sign-in/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";

const initialState: AuthFormState = {};

type SignInFormProps = {
  defaultNext?: string;
};

function isSafePath(path: string | undefined) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

export function SignInForm({ defaultNext }: SignInFormProps) {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  const resolvedNext = useMemo(() => {
    const fromQuery = searchParams?.get("next") ?? undefined;
    if (isSafePath(fromQuery)) {
      return fromQuery!;
    }
    if (isSafePath(defaultNext)) {
      return defaultNext!;
    }
    return ROUTES.recruiterDashboard;
  }, [defaultNext, searchParams]);

  useEffect(() => {
    if (state?.error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state?.error]);

  return (
    <form className="space-y-5" action={formAction}>
      <input type="hidden" name="next" value={resolvedNext} />
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
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900" htmlFor="password">
            Mật khẩu
          </label>
          <Link
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            href={ROUTES.forgotPassword}
          >
            Quên mật khẩu?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="********"
          autoComplete="current-password"
          required
        />
      </div>
      {state?.error ? (
        <div className="rounded-xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-red-50 px-4 py-3 text-sm font-semibold text-rose-700">
          ❌ {state.error}
        </div>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={pending}>
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
      <div className="text-center text-sm font-medium text-slate-600">
        Chưa có tài khoản?{" "}
        <Link className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline" href={ROUTES.register}>
          Tạo ngay
        </Link>
      </div>
    </form>
  );
}
