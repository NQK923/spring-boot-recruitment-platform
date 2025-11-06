"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type SVGProps } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import type { OAuthConfig } from "@/lib/types";

type Provider = "google" | "github";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_STATE_COOKIE = "google_oauth_state";
const GOOGLE_STATE_MAX_AGE_SECONDS = 60 * 5;

type IconProps = SVGProps<SVGSVGElement>;

function GoogleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="#EA4335"
        d="M12 4.75c1.97 0 3.74.68 5.14 2.02l3.84-3.84C18.56 1.08 15.52 0 12 0 7.3 0 3.26 2.47 1.3 6.57l4.1 3.2C6.23 6.83 8.85 4.75 12 4.75z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.8-2.91c-1.07.74-2.45 1.17-4.14 1.17-3.15 0-5.82-2.07-6.77-4.94H1.19v3.12C3.17 21.53 7.2 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.23 14.42a7.15 7.15 0 010-4.84V6.46H1.19C.43 8.01 0 9.65 0 11.58c0 1.9.42 3.72 1.19 5.3l4.04-3z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.78-.07-1.36-.21-1.95H12v3.59h6.51c-.13 1.05-.79 2.63-2.27 3.62l3.52 2.68c2.05-1.9 3.24-4.7 3.24-7.94z"
      />
    </svg>
  );
}

function GitHubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.66.5 12.04c0 5.1 3.29 9.43 7.86 10.96.58.11.8-.25.8-.56 0-.28-.01-1.03-.02-2.03-3.2.7-3.87-1.55-3.87-1.55-.53-1.36-1.29-1.72-1.29-1.72-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.22 1.78 1.22 1.03 1.77 2.7 1.26 3.36.96.1-.77.4-1.27.73-1.56-2.55-.29-5.24-1.3-5.24-5.81 0-1.28.45-2.33 1.19-3.15-.12-.29-.52-1.46.11-3.04 0 0 .98-.31 3.2 1.2a11.08 11.08 0 015.83 0c2.22-1.51 3.2-1.2 3.2-1.2.63 1.58.23 2.75.11 3.04.74.82 1.19 1.87 1.19 3.15 0 4.53-2.7 5.52-5.27 5.8.41.35.77 1.04.77 2.1 0 1.52-.02 2.74-.02 3.11 0 .31.21.68.81.56A10.55 10.55 0 0023.5 12c0-6.38-5.16-11.5-11.5-11.5z"
      />
    </svg>
  );
}

function isSafeRelativePath(path: string | null | undefined) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

function encodeCookiePayload(value: unknown) {
  try {
    return encodeURIComponent(JSON.stringify(value));
  } catch {
    return "";
  }
}

function persistGoogleStateCookie(state: string, nextPath: string) {
  const payload = encodeCookiePayload({ state, nextPath });
  document.cookie = `${GOOGLE_STATE_COOKIE}=${payload}; path=/; max-age=${GOOGLE_STATE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function generateState() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `web-${crypto.randomUUID()}`;
  }
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `web-${randomPart}-${Date.now()}`;
}

function parseErrorFromResponse(response: Response, fallback: string) {
  return response
    .json()
    .then((body) => {
      if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
        return body.error;
      }
      return fallback;
    })
    .catch(() => fallback);
}

export type SocialSignInProps = {
  nextPath?: string | null;
  initialError?: string | null;
};

export function SocialSignIn({ nextPath, initialError }: SocialSignInProps) {
  const [config, setConfig] = useState<OAuthConfig | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const githubPopupRef = useRef<Window | null>(null);
  const githubIntervalRef = useRef<number | null>(null);

  const redirectTarget = useMemo(
    () => (isSafeRelativePath(nextPath) ? nextPath! : ROUTES.candidatePortal),
    [nextPath]
  );

  useEffect(() => {
    if (initialError && !error) {
      setError(initialError);
    }
  }, [initialError, error]);

  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const response = await fetch("/api/auth/oauth/config", { cache: "no-store" });
        if (!response.ok) {
          const message = await parseErrorFromResponse(
            response,
            "Không thể tải cấu hình đăng nhập mạng xã hội."
          );
          throw new Error(message);
        }
        const data = (await response.json()) as Partial<OAuthConfig>;
        if (!isMounted) return;
        setConfig({
          googleClientId: data.googleClientId ?? null,
          githubClientId: data.githubClientId ?? null,
          githubRedirectUri: data.githubRedirectUri ?? null,
          githubAuthorizeRedirectUri: data.githubAuthorizeRedirectUri ?? null,
        });
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error
            ? err.message
            : "Tính năng đăng nhập mạng xã hội tạm thời không khả dụng. Vui lòng thử lại sau.";
        setError(message);
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGoogleLogin = useCallback(() => {
    if (!config?.googleClientId) {
      setError("Đăng nhập Google chưa được cấu hình cho môi trường này.");
      return;
    }

    const state = generateState();
    persistGoogleStateCookie(state, redirectTarget);

    const authorizeUrl = new URL(GOOGLE_AUTH_URL);
    authorizeUrl.searchParams.set("client_id", config.googleClientId);
    authorizeUrl.searchParams.set(
      "redirect_uri",
      `${window.location.origin}/api/auth/oauth/google/redirect`
    );
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", "openid email profile");
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("prompt", "select_account");
    authorizeUrl.searchParams.set("access_type", "offline");

    setError(null);
    setLoadingProvider("google");
    window.location.href = authorizeUrl.toString();
  }, [config?.googleClientId, redirectTarget]);

  const handleGitHubLogin = useCallback(() => {
    if (!config?.githubClientId || !config.githubAuthorizeRedirectUri) {
      setError("Đăng nhập GitHub chưa được cấu hình cho môi trường này.");
      return;
    }

    setError(null);

    const state = generateState();
    const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
    authorizeUrl.searchParams.set("client_id", config.githubClientId);
    authorizeUrl.searchParams.set("redirect_uri", config.githubAuthorizeRedirectUri);
    authorizeUrl.searchParams.set("scope", "user:email");
    authorizeUrl.searchParams.set("state", state);

    const width = 600;
    const height = 700;
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);

    const popup = window.open(
      authorizeUrl.toString(),
      "github-oauth",
      `width=${width},height=${height},top=${top},left=${left},resizable=no,scrollbars=yes,status=no`
    );

    if (!popup) {
      setError("Không thể mở cửa sổ đăng nhập GitHub. Vui lòng cho phép cửa sổ bật lên và thử lại.");
      return;
    }

    setLoadingProvider("github");
    githubPopupRef.current = popup;

    let handled = false;

    const cleanup = (silent = false) => {
      handled = true;
      if (!silent) {
        setLoadingProvider(null);
      }
      window.removeEventListener("message", onMessage);
      if (githubIntervalRef.current !== null) {
        window.clearInterval(githubIntervalRef.current);
        githubIntervalRef.current = null;
      }
      if (githubPopupRef.current && !githubPopupRef.current.closed) {
        githubPopupRef.current.close();
      }
      githubPopupRef.current = null;
    };

    const onMessage = async (event: MessageEvent) => {
      const data = event?.data;
      if (!data || typeof data !== "object") {
        return;
      }
      const source = (data as { source?: unknown }).source;
      if (source !== "github-auth") {
        return;
      }
      const eventState = (data as { state?: unknown }).state;
      if (eventState !== state || handled) {
        return;
      }

      const errorValue = (data as { error?: unknown }).error;
      if (typeof errorValue === "string" && errorValue.length > 0) {
        const description = (data as { error_description?: unknown }).error_description;
        setError(
          typeof description === "string" && description.length > 0
            ? description
            : "Đăng nhập GitHub đã bị hủy."
        );
        cleanup();
        return;
      }

      const codeValue = (data as { code?: unknown }).code;
      if (typeof codeValue !== "string" || codeValue.length === 0) {
        setError("Đăng nhập GitHub không trả về mã xác thực.");
        cleanup();
        return;
      }

      handled = true;

      try {
        const response = await fetch("/api/auth/oauth/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code: codeValue }),
        });

        if (!response.ok) {
          const message = await parseErrorFromResponse(
            response,
            "Không thể hoàn tất đăng nhập GitHub."
          );
          throw new Error(message);
        }

        const body = (await response.json()) as { success?: boolean; error?: string };
        if (!body?.success) {
          throw new Error(body?.error ?? "Đăng nhập GitHub không thành công. Vui lòng thử lại.");
        }

        cleanup(true);
        setError(null);
        setLoadingProvider(null);
        window.location.href = redirectTarget;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Hiện không thể đăng nhập bằng GitHub.";
        setError(message);
        cleanup();
      }
    };

    window.addEventListener("message", onMessage);

    githubIntervalRef.current = window.setInterval(() => {
      if (!githubPopupRef.current || githubPopupRef.current.closed) {
        if (!handled) {
          setError("Cửa sổ đăng nhập GitHub đã bị đóng trước khi hoàn tất xác thực.");
          cleanup();
        } else {
          cleanup(true);
        }
      }
    }, 600);
  }, [config?.githubClientId, config?.githubAuthorizeRedirectUri, redirectTarget]);

  useEffect(
    () => () => {
      if (githubIntervalRef.current !== null) {
        window.clearInterval(githubIntervalRef.current);
      }
      if (githubPopupRef.current && !githubPopupRef.current.closed) {
        githubPopupRef.current.close();
      }
    },
    []
  );

  const googleDisabled =
    loadingProvider === "github" || !config?.googleClientId || loadingProvider === "google";

  const githubDisabled =
    loadingProvider === "google" || !config?.githubClientId || loadingProvider === "github";

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-sm">
        <p className="font-semibold text-slate-700">Đăng nhập với vai trò ứng viên bằng tài khoản mạng xã hội.</p>
        <p className="text-slate-500">
          Chúng tôi sẽ tạo hồ sơ ứng viên nếu bạn là người dùng mới.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-red-50 px-4 py-3 text-sm font-semibold text-rose-700">
          ❌ {error}
        </div>
      ) : null}

      <div className="grid gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="w-full justify-center gap-3 font-semibold"
          onClick={handleGoogleLogin}
          disabled={googleDisabled}
        >
          {loadingProvider === "google" ? (
            "Đang kết nối tới Google..."
          ) : (
            <>
              <GoogleIcon className="h-5 w-5" />
              Tiếp tục với Google
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full justify-center gap-3 font-semibold"
          onClick={handleGitHubLogin}
          disabled={githubDisabled}
        >
          {loadingProvider === "github" ? (
            "Đang kết nối tới GitHub..."
          ) : (
            <>
              <GitHubIcon className="h-5 w-5" />
              Tiếp tục với GitHub
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
