import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, AUTH_COOKIE_MAX_AGE_SECONDS } from "@/lib/constants";

export function setAccessToken(token: string) {
  const cookieStore = cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearAccessToken() {
  cookies().delete(ACCESS_TOKEN_COOKIE);
}

export function getAccessTokenFromCookies(): string | null {
  try {
    return cookies().get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}
