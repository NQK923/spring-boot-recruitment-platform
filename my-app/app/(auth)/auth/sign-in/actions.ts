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
    return { error: "Vui lòng nhập email và mật khẩu." };
  }

  try {
    const response = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json()) as Partial<AuthTokenResponse>;

    if (!data?.accessToken) {
      return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." };
    }

    await setAccessToken(data.accessToken);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Không thể đăng nhập. Vui lòng kiểm tra lại email và mật khẩu của bạn.";
    return { error: message };
  }

  const redirectTarget = resolveRedirectPath(
    typeof nextValue === "string" ? nextValue : null
  );
  redirect(redirectTarget);
}
