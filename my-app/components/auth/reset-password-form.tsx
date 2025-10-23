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
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="otp">
          Reset code
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
        <p className="text-xs text-foreground/55">
          Enter the six-digit code from your email. Reset codes expire 10 minutes after they are issued.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="newPassword">
          New password
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="At least 8 characters"
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
        {pending ? "Updating password..." : "Reset password"}
      </Button>
      <p className="text-center text-sm text-foreground/60">
        Remembered your password?{" "}
        <Link className="font-medium text-foreground hover:underline" href={ROUTES.signIn}>
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
