import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Đặt lại mật khẩu</h1>
        <p className="text-sm text-slate-600 font-medium">
          Nhập mã sáu chữ số trong email và tạo mật khẩu mới để hoàn tất quá trình đặt lại.
        </p>
      </header>

      <ResetPasswordForm />
    </div>
  );
}
