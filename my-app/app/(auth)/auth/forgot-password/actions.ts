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
    return { error: "Enter the email associated with your account." };
  }

  try {
    const response = await apiFetch("/api/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    await response.text();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start the password reset flow.";
    return { error: message };
  }

  return {
    success:
      "If the email exists and is verified, we sent a six-digit reset code. It expires in 10 minutes.",
  };
}
