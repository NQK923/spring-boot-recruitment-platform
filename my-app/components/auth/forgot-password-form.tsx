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
        <label className="text-sm font-semibold text-foreground" htmlFor="email">
          Email address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <p className="text-xs text-foreground/55">
          We&apos;ll send a six-digit code to this email if it&apos;s associated with a verified account.
        </p>
      </div>
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {state.success}
        </p>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={pending}>
        {pending ? "Sending reset code..." : "Send reset code"}
      </Button>
    </form>
  );
}
