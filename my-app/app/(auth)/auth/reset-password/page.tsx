import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Đặt lại mật khẩu</h1>
        <p className="text-sm text-slate-600 font-medium">
          Nhập mã 6 chữ số được gửi đến email của bạn và tạo mật khẩu mới để hoàn tất.
        </p>
      </header>

      <ResetPasswordForm />
    </div>
  );
}
