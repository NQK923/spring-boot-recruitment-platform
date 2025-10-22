import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { registered?: string };
}) {
  const justRegistered = searchParams?.registered === "1";

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="text-sm text-foreground/70">
          Access your recruiter or candidate workspace with your existing account.
        </p>
      </div>
      {justRegistered ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Account created successfully. Sign in with your new credentials.
        </p>
      ) : null}
      <SignInForm />
    </div>
  );
}
