import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import type { AuthTokenResponse } from "@/lib/types";

const STATE_COOKIE_NAME = "google_oauth_state";

type GoogleAuthState = {
  state: string;
  nextPath: string | null;
};

function withTrailingSlash(base: string) {
  return base.endsWith("/") ? base : `${base}/`;
}

function getSiteOrigin(url: URL) {
  return (
    process.env.SITE_BASE_URL ??
    process.env.FRONTEND_BASE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    url.origin
  );
}

function isSafeRelativePath(value: string | null | undefined): value is string {
  return !!value && value.startsWith("/") && !value.startsWith("//");
}

function parseStateCookie(request: NextRequest): GoogleAuthState | null {
  const rawValue = request.cookies.get(STATE_COOKIE_NAME)?.value;
  if (!rawValue) {
    return null;
  }

  try {
    const decoded = JSON.parse(decodeURIComponent(rawValue)) as {
      state?: unknown;
      nextPath?: unknown;
    };
    const state = typeof decoded.state === "string" ? decoded.state : null;
    const nextPath = typeof decoded.nextPath === "string" ? decoded.nextPath : null;
    if (!state) {
      return null;
    }
    return { state, nextPath };
  } catch {
    return null;
  }
}

function clearStateCookie(response: NextResponse) {
  response.cookies.set({
    name: STATE_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
}

function buildFailureRedirect(
  url: URL,
  errorCode: "google_sign_in_failed" | "google_missing_credential",
  nextHint?: string | null
) {
  const redirectUrl = new URL(ROUTES.signIn, withTrailingSlash(getSiteOrigin(url)));
  redirectUrl.searchParams.set("error", errorCode);

  const nextParam = isSafeRelativePath(nextHint) ? nextHint : url.searchParams.get("next");
  if (isSafeRelativePath(nextParam)) {
    redirectUrl.searchParams.set("next", nextParam);
  }

  const response = NextResponse.redirect(redirectUrl);
  clearStateCookie(response);
  return response;
}

function buildSuccessRedirect(url: URL, nextPath: string | null) {
  const redirectPath = isSafeRelativePath(nextPath) ? nextPath : ROUTES.candidatePortal;
  const redirectUrl = new URL(redirectPath, withTrailingSlash(getSiteOrigin(url)));
  const response = NextResponse.redirect(redirectUrl);
  clearStateCookie(response);
  return response;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const stateContext = parseStateCookie(request);
  const nextHint = stateContext?.nextPath ?? url.searchParams.get("next");

  const errorParam = url.searchParams.get("error");
  if (errorParam) {
    return buildFailureRedirect(url, "google_sign_in_failed", nextHint);
  }

  const code = url.searchParams.get("code");
  if (!code) {
    return buildFailureRedirect(url, "google_missing_credential", nextHint);
  }

  const stateParam = url.searchParams.get("state");
  if (!stateParam || !stateContext || stateParam !== stateContext.state) {
    return buildFailureRedirect(url, "google_sign_in_failed", nextHint);
  }

  try {
    const response = await apiFetch("/api/auth/oauth/google", {
      method: "POST",
      skipAuthHeaders: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        redirectUri: `${withTrailingSlash(getSiteOrigin(url))}api/auth/oauth/google/redirect`,
      }),
    });

    const data = (await response.json()) as Partial<AuthTokenResponse>;
    if (!data?.accessToken) {
      throw new Error("Invalid response from authentication service.");
    }

    await setAccessToken(data.accessToken);
  } catch {
    return buildFailureRedirect(url, "google_sign_in_failed", nextHint);
  }

  return buildSuccessRedirect(url, stateContext?.nextPath ?? null);
}

export async function POST(request: NextRequest) {
  const url = request.nextUrl;
  const stateContext = parseStateCookie(request);
  const nextHint = stateContext?.nextPath ?? url.searchParams.get("next");

  let credential: string | null = null;
  try {
    const formData = await request.formData();
    const rawCredential = formData.get("credential");
    if (typeof rawCredential === "string" && rawCredential.trim() !== "") {
      credential = rawCredential;
    }
  } catch {
    credential = null;
  }

  if (!credential) {
    return buildFailureRedirect(url, "google_missing_credential", nextHint);
  }

  try {
    const response = await apiFetch("/api/auth/oauth/google", {
      method: "POST",
      skipAuthHeaders: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: credential }),
    });

    const data = (await response.json()) as Partial<AuthTokenResponse>;
    if (!data?.accessToken) {
      throw new Error("Invalid response from authentication service.");
    }

    await setAccessToken(data.accessToken);
  } catch {
    return buildFailureRedirect(url, "google_sign_in_failed", nextHint);
  }

  return buildSuccessRedirect(url, nextHint ?? null);
}
