import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Quên mật khẩu</h1>
        <p className="text-sm text-slate-600 font-medium">
          Nhập email gắn với tài khoản và chúng tôi sẽ gửi mã đặt lại gồm sáu chữ số.
        </p>
      </header>

      <ForgotPasswordForm />
    </div>
  );
}
