import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Forgot password</h1>
        <p className="text-sm text-foreground/65">
          Enter the email tied to your account and we&apos;ll send a six-digit reset code.
        </p>
      </header>

      <ForgotPasswordForm />
    </div>
  );
}
