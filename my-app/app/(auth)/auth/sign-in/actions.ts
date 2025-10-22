'use server';

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/session";
import type { AuthTokenResponse } from "@/lib/types";

export type AuthFormState = {
  error?: string;
};

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const response = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json()) as Partial<AuthTokenResponse>;

    if (!data?.accessToken) {
      return { error: "Received an invalid response from the authentication service." };
    }

    setAccessToken(data.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    return { error: message };
  }

  redirect("/dashboard");
}
