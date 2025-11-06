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
        <h1 className="text-2xl font-semibold text-text">Tạo tài khoản mới</h1>
        <p className="text-sm text-text/65">
          Đăng ký với vai trò ứng viên để quản lý hồ sơ, CV và theo dõi trạng thái ứng tuyển.
        </p>
      </header>

      <RegisterForm />
    </div>
  );
}
