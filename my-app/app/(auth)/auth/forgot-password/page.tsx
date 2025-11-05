import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Quên mật khẩu</h1>
        <p className="text-sm text-foreground/65">
          Nhập email gắn với tài khoản và chúng tôi sẽ gửi mã đặt lại gồm sáu chữ số.
        </p>
      </header>

      <ForgotPasswordForm />
    </div>
  );
}
