import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/session";
import type { AuthTokenResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Missing request body." }, { status: 400 });
  }

  const idToken =
    payload && typeof payload === "object" && "idToken" in payload
      ? (payload as { idToken?: unknown }).idToken
      : undefined;

  if (typeof idToken !== "string" || idToken.trim() === "") {
    return NextResponse.json({ error: "Google credential is required." }, { status: 400 });
  }

  try {
    const response = await apiFetch("/api/auth/oauth/google", {
      method: "POST",
      skipAuthHeaders: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = (await response.json()) as Partial<AuthTokenResponse>;
    if (!data?.accessToken) {
      return NextResponse.json(
        { error: "Invalid response from authentication service." },
        { status: 502 }
      );
    }

    await setAccessToken(data.accessToken);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google sign-in failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
