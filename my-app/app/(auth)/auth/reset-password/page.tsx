import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Reset password</h1>
        <p className="text-sm text-foreground/65">
          Use the six-digit code from your email and set a new password to finish the reset.
        </p>
      </header>

      <ResetPasswordForm />
    </div>
  );
}
