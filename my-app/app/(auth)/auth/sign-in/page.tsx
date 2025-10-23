import { SignInForm } from "@/components/auth/sign-in-form";
import { SocialSignIn } from "@/components/auth/social-sign-in";
import { ROUTES } from "@/lib/routes";

type SignInSearchParams = {
  registered?: string;
  next?: string;
};

type SignInPageProps = {
  searchParams: Promise<SignInSearchParams> | SignInSearchParams;
};

function sanitizeNext(nextValue: string | undefined) {
  if (typeof nextValue !== "string") {
    return null;
  }
  return nextValue.startsWith("/") && !nextValue.startsWith("//") ? nextValue : null;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const justRegistered = resolvedSearchParams?.registered === "1";
  const safeNext = sanitizeNext(resolvedSearchParams?.next) ?? ROUTES.recruiterDashboard;

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
      <SocialSignIn nextPath={safeNext} />
      <div className="flex items-center gap-3 text-xs text-foreground/50">
        <span className="h-px flex-1 bg-foreground/10" />
        <span>Or continue with email</span>
        <span className="h-px flex-1 bg-foreground/10" />
      </div>
      <SignInForm defaultNext={safeNext} />
    </div>
  );
}
