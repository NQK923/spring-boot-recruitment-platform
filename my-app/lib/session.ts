import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, AUTH_COOKIE_MAX_AGE_SECONDS } from "@/lib/constants";

export async function setAccessToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearAccessToken() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}
