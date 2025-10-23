import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser, resolveDefaultRoute } from "@/lib/current-user";

export default async function RegisterPage() {
  const viewer = await getCurrentUser();
  if (viewer) {
    redirect(resolveDefaultRoute(viewer.roles));
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Create an account</h1>
        <p className="text-sm text-foreground/65">
          Register as a candidate to manage your profile, CVs, and application updates.
        </p>
      </header>

      <RegisterForm />
    </div>
  );
}
