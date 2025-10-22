import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Create candidate account</h1>
        <p className="text-sm text-foreground/70">
          Register as a candidate to build your profile, manage CVs, and track applications.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
