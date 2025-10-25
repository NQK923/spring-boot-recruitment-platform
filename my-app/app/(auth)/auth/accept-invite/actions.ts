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
    return { error: "Invitation token is missing. Refresh the page and try again." };
  }

  if (typeof password !== "string" || typeof confirmPassword !== "string") {
    return { error: "Password and confirmation are required." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match. Please re-enter them." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
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
      error: error instanceof Error ? error.message : "Unable to accept invitation right now.",
    };
  }
}
