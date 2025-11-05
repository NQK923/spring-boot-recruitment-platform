import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Đặt lại mật khẩu</h1>
        <p className="text-sm text-foreground/65">
          Nhập mã sáu chữ số trong email và tạo mật khẩu mới để hoàn tất quá trình đặt lại.
        </p>
      </header>

      <ResetPasswordForm />
    </div>
  );
}
