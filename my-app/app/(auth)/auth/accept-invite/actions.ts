"use server";

import { apiFetch } from "@/lib/api";

export type AcceptInviteFormState = {
  error?: string;
  success?: boolean;
};

export async function acceptInviteAction(
  _prevState: AcceptInviteFormState,
  formData: FormData
): Promise<AcceptInviteFormState> {
  const token = formData.get("token");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof token !== "string" || token.trim().length === 0) {
    return { error: "Thiếu mã lời mời. Hãy tải lại trang và thử lại." };
  }

  if (typeof password !== "string" || typeof confirmPassword !== "string") {
    return { error: "Bạn cần nhập mật khẩu và xác nhận mật khẩu." };
  }

  if (password !== confirmPassword) {
    return { error: "Hai mật khẩu không trùng khớp. Vui lòng nhập lại." };
  }

  if (password.length < 8) {
    return { error: "Mật khẩu phải có ít nhất 8 ký tự." };
  }

  try {
    await apiFetch("/api/auth/invites/accept", {
      method: "POST",
      body: JSON.stringify({ token: token.trim(), password }),
      skipAuthHeaders: true,
    });
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Hiện không thể chấp nhận lời mời.",
    };
  }
}
