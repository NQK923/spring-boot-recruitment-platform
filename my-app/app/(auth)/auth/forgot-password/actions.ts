'use server';

import { apiFetch } from "@/lib/api";

export type ForgotPasswordFormState = {
  error?: string;
  success?: string;
};

export async function forgotPasswordAction(
  _prevState: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Vui lòng nhập email gắn với tài khoản của bạn." };
  }

  try {
    const response = await apiFetch("/api/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    await response.text();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể bắt đầu quy trình đặt lại mật khẩu.";
    return { error: message };
  }

  return {
    success:
      "Nếu email tồn tại và đã được xác minh, mã đặt lại gồm sáu chữ số đã được gửi. Mã sẽ hết hạn sau 10 phút.",
  };
}
