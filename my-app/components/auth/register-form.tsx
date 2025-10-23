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
        <label className="text-sm font-semibold text-foreground" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          name="password"
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
        {pending ? "Creating account..." : "Create account"}
      </Button>
      <div className="text-center text-sm text-foreground/60">
        Already have an account?{" "}
        <Link className="font-medium text-foreground hover:underline" href={ROUTES.signIn}>
          Sign in
        </Link>
      </div>
    </form>
  );
}
