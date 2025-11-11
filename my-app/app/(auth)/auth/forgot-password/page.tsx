import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Quên mật khẩu</h1>
        <p className="text-sm text-slate-600 font-medium">
          Nhập email của tài khoản và chúng tôi sẽ gửi cho bạn một mã khôi phục gồm 6 chữ số.
        </p>
      </header>

      <ForgotPasswordForm />
    </div>
  );
}
