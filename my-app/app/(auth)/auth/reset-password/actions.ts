'use server';

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

export type ResetPasswordFormState = {
  error?: string;
};

export async function resetPasswordAction(
  _prevState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!email || !otp || !newPassword) {
    return { error: "Vui lòng nhập email, mã đặt lại và mật khẩu mới." };
  }

  try {
    const response = await apiFetch("/api/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ email, otp, newPassword }),
    });
    await response.text();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Hiện không thể đặt lại mật khẩu.";
    return { error: message };
  }

  redirect(`${ROUTES.signIn}?reset=1`);
}
