import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser, resolveDefaultRoute } from "@/lib/current-user";

export default async function RegisterPage() {
  const viewer = await getCurrentUser();
  if (viewer) {
    redirect(resolveDefaultRoute(viewer.roles));
  }

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
