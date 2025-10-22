"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { signInAction, type AuthFormState } from "@/app/(auth)/auth/sign-in/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";

const initialState: AuthFormState = {};

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  useEffect(() => {
    if (state?.error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state?.error]);

  return (
    <form className="space-y-4" action={formAction}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
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
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Password
        </label>
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
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Continue"}
      </Button>
      <div className="text-center text-sm text-foreground/60">
        Don&apos;t have an account?{" "}
        <Link className="font-medium text-foreground hover:underline" href={ROUTES.register}>
          Create one
        </Link>
      </div>
    </form>
  );
}
