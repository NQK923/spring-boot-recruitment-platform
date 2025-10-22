'use server';

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";

export type RegisterFormState = {
  error?: string;
  success?: boolean;
};

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  try {
    await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create your account.";
    return { error: message };
  }

  redirect("/auth/sign-in?registered=1");
}
