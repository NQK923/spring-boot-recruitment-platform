'use server';

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import type { AuthTokenResponse } from "@/lib/types";

export type AuthFormState = {
  error?: string;
};

function resolveRedirectPath(value: string | null | undefined) {
  if (!value) {
    return ROUTES.recruiterDashboard;
  }
  return value.startsWith("/") && !value.startsWith("//") ? value : ROUTES.recruiterDashboard;
}

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextValue = formData.get("next");

  if (!email || !password) {
    return { error: "Email và mật khẩu là bắt buộc." };
  }

  try {
    const response = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json()) as Partial<AuthTokenResponse>;

    if (!data?.accessToken) {
      return { error: "Nhận được phản hồi không hợp lệ từ dịch vụ xác thực." };
    }

    await setAccessToken(data.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể đăng nhập.";
    return { error: message };
  }

  const redirectTarget = resolveRedirectPath(
    typeof nextValue === "string" ? nextValue : null
  );
  redirect(redirectTarget);
}
