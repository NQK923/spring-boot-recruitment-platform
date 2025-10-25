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
  SUPER_ADMIN: "Super Admin",
  COMPANY_ADMIN: "Company Admin",
  RECRUITER: "Recruiter",
  CANDIDATE: "Candidate",
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
          <p className="font-semibold">Invitation accepted</p>
          <p className="mt-2">
            Your account for <span className="font-medium">{email}</span> is ready. Sign in to start
            collaborating with your team.
          </p>
        </div>
        <Button
          className="w-full"
          size="lg"
          type="button"
          onClick={() => router.push(ROUTES.signIn)}
        >
          Continue to sign in
        </Button>
      </div>
    );
  }

  const formattedExpiry = formatExpiry(expiresAt);
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <form className="space-y-6" action={formAction}>
      <input type="hidden" name="token" value={token} />
      <div className="rounded-2xl border border-border/70 bg-surface-muted/60 px-4 py-4 text-sm text-foreground/75">
        <p>
          You&apos;re joining Talentflow as{" "}
          <span className="font-semibold text-foreground">{roleLabel}</span> using{" "}
          <span className="font-semibold text-foreground">{email}</span>.
        </p>
        {formattedExpiry ? (
          <p className="mt-2 text-foreground/60">This invite expires on {formattedExpiry}.</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="password">
          Create password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="confirmPassword">
          Confirm password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
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
        {pending ? "Activating account..." : "Activate account"}
      </Button>

      <p className="text-center text-xs text-foreground/50">
        Need help? Contact{" "}
        <Link className="font-medium text-foreground hover:underline" href="mailto:support@talentflow.app">
          support@talentflow.app
        </Link>{" "}
        or your company admin.
      </p>
    </form>
  );
}
