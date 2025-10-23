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

  const code =
    payload && typeof payload === "object" && "code" in payload
      ? (payload as { code?: unknown }).code
      : undefined;

  if (typeof code !== "string" || code.trim() === "") {
    return NextResponse.json({ error: "GitHub authorization code is required." }, { status: 400 });
  }

  try {
    const response = await apiFetch("/api/auth/oauth/github", {
      method: "POST",
      skipAuthHeaders: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
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
    const message = error instanceof Error ? error.message : "GitHub sign-in failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
