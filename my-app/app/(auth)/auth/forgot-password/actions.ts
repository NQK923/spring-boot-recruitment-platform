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
    return { error: "Vui lòng nhập email của tài khoản." };
  }

  try {
    const response = await apiFetch("/api/auth/password/forgot", {
      method: "POST",
      skipAuthHeaders: true,
      body: JSON.stringify({ email }),
    });

    await response.text();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
    return { error: message };
  }

  return {
    success:
      "Nếu email tồn tại và đã được xác minh, một mã khôi phục gồm 6 chữ số đã được gửi đến bạn. Mã sẽ hết hạn sau 10 phút.",
  };
}
