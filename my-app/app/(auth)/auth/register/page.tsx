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
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Tạo tài khoản mới</h1>
        <p className="text-sm text-slate-600 font-medium">
          Đăng ký tài khoản ứng viên để quản lý hồ sơ và theo dõi quá trình ứng tuyển.
        </p>
      </header>

      <RegisterForm />
    </div>
  );
}
