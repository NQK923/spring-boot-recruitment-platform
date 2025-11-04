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

  const body = (payload && typeof payload === "object" ? payload : {}) as {
    idToken?: unknown;
    code?: unknown;
    redirectUri?: unknown;
  };

  const idToken =
    typeof body.idToken === "string" && body.idToken.trim() !== "" ? body.idToken.trim() : null;
  const code =
    typeof body.code === "string" && body.code.trim() !== "" ? body.code.trim() : null;
  const redirectUri =
    typeof body.redirectUri === "string" && body.redirectUri.trim() !== ""
      ? body.redirectUri.trim()
      : null;

  if (!idToken && !code) {
    return NextResponse.json({ error: "Google credential is required." }, { status: 400 });
  }

  if (code && !redirectUri) {
    return NextResponse.json(
      { error: "Missing redirect URI for Google authorization code." },
      { status: 400 }
    );
  }

  try {
    const requestPayload: Record<string, string> = {};
    if (idToken) {
      requestPayload.idToken = idToken;
    }
    if (code) {
      requestPayload.code = code;
      requestPayload.redirectUri = redirectUri!;
    }

    const response = await apiFetch("/api/auth/oauth/google", {
      method: "POST",
      skipAuthHeaders: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
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
