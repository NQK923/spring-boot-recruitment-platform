"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import type { OAuthConfig } from "@/lib/types";

type Provider = "google" | "github";

type GoogleCredentialResponse = {
  credential?: string;
};

type GooglePromptNotification = {
  isNotDisplayed?: () => boolean;
  getNotDisplayedReason?: () => string | undefined;
  isSkippedMoment?: () => boolean;
  getSkippedReason?: () => string | undefined;
  isDismissedMoment?: () => boolean;
  getDismissedReason?: () => string | undefined;
};

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: "popup" | "redirect";
  }) => void;
  prompt: (momentListener?: (notification: GooglePromptNotification) => void) => void;
  disableAutoSelect?: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";

function isSafeRelativePath(path: string | null | undefined) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
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
};

export function SocialSignIn({ nextPath }: SocialSignInProps) {
  const [config, setConfig] = useState<OAuthConfig | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const googleInitializedRef = useRef(false);
  const githubPopupRef = useRef<Window | null>(null);
  const githubIntervalRef = useRef<number | null>(null);

  const redirectTarget = useMemo(
    () => (isSafeRelativePath(nextPath) ? nextPath! : ROUTES.candidatePortal),
    [nextPath]
  );

  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const response = await fetch("/api/auth/oauth/config", { cache: "no-store" });
        if (!response.ok) {
          const message = await parseErrorFromResponse(
            response,
            "Unable to load social sign-in configuration."
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
            : "Social sign-in is temporarily unavailable. Please try again later.";
        setError(message);
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!config?.googleClientId) {
      return;
    }

    if (window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-google-identity="true"]'
    );
    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        setGoogleReady(true);
      } else {
        const handleLoad = () => {
          existingScript.dataset.loaded = "true";
          setGoogleReady(true);
        };
        const handleError = () => {
          setError("Unable to load Google sign-in. Please refresh and try again.");
        };
        existingScript.addEventListener("load", handleLoad);
        existingScript.addEventListener("error", handleError);
        return () => {
          existingScript.removeEventListener("load", handleLoad);
          existingScript.removeEventListener("error", handleError);
        };
      }
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";

    const handleLoad = () => {
      script.dataset.loaded = "true";
      setGoogleReady(true);
    };
    const handleError = () => {
      setError("Unable to load Google sign-in. Please refresh and try again.");
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [config?.googleClientId]);

  const handleGoogleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      const credential = response?.credential;
      if (!credential) {
        setLoadingProvider(null);
        setError("Google sign-in was cancelled. Please try again.");
        return;
      }

      try {
        const result = await fetch("/api/auth/oauth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken: credential }),
        });

        if (!result.ok) {
          const message = await parseErrorFromResponse(
            result,
            "Unable to complete Google sign-in."
          );
          throw new Error(message);
        }

        const body = (await result.json()) as { success?: boolean; error?: string };
        if (!body?.success) {
          throw new Error(body?.error ?? "Google sign-in failed. Please try again.");
        }

        setLoadingProvider(null);
        window.location.href = redirectTarget;
      } catch (err) {
        setLoadingProvider(null);
        const message =
          err instanceof Error ? err.message : "Unable to sign in with Google right now.";
        setError(message);
      }
    },
    [redirectTarget]
  );

  useEffect(() => {
    if (
      !config?.googleClientId ||
      !googleReady ||
      !window.google?.accounts?.id ||
      googleInitializedRef.current
    ) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: config.googleClientId,
      callback: handleGoogleCredential,
      ux_mode: "popup",
    });
    window.google.accounts.id.disableAutoSelect?.();
    googleInitializedRef.current = true;
  }, [config?.googleClientId, googleReady, handleGoogleCredential]);

  const handleGoogleLogin = useCallback(() => {
    if (!config?.googleClientId) {
      setError("Google sign-in is not configured for this environment.");
      return;
    }
    if (!window.google?.accounts?.id) {
      setError("Google sign-in is still loading. Please try again in a moment.");
      return;
    }

    setError(null);
    setLoadingProvider("google");

    window.google.accounts.id.prompt((notification) => {
      const notDisplayed = notification?.isNotDisplayed?.();
      const skipped = notification?.isSkippedMoment?.();
      const dismissed = notification?.isDismissedMoment?.();

      if (notDisplayed) {
        const reason = notification?.getNotDisplayedReason?.();
        setError(
          reason === "popup_closed_by_user"
            ? "Google sign-in window was closed."
            : "Google sign-in popup was blocked. Allow popups and try again."
        );
        setLoadingProvider(null);
      } else if (skipped || dismissed) {
        const reason =
          notification?.getSkippedReason?.() ?? notification?.getDismissedReason?.();
        setLoadingProvider(null);
        if (reason) {
          setError("Google sign-in was cancelled.");
        }
      }
    });
  }, [config?.googleClientId]);

  const handleGitHubLogin = useCallback(() => {
    if (!config?.githubClientId || !config.githubAuthorizeRedirectUri) {
      setError("GitHub sign-in is not configured for this environment.");
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
      setError("Unable to open the GitHub sign-in window. Please allow popups and try again.");
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
            : "GitHub sign-in was cancelled."
        );
        cleanup();
        return;
      }

      const codeValue = (data as { code?: unknown }).code;
      if (typeof codeValue !== "string" || codeValue.length === 0) {
        setError("GitHub sign-in did not return an authorization code.");
        cleanup();
        return;
      }

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
            "Unable to complete GitHub sign-in."
          );
          throw new Error(message);
        }

        const body = (await response.json()) as { success?: boolean; error?: string };
        if (!body?.success) {
          throw new Error(body?.error ?? "GitHub sign-in failed. Please try again.");
        }

        cleanup(true);
        setLoadingProvider(null);
        window.location.href = redirectTarget;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to sign in with GitHub right now.";
        setError(message);
        cleanup();
      }
    };

    window.addEventListener("message", onMessage);

    githubIntervalRef.current = window.setInterval(() => {
      if (!githubPopupRef.current || githubPopupRef.current.closed) {
        if (!handled) {
          setError("GitHub sign-in window was closed before completing authentication.");
          cleanup();
        } else {
          cleanup();
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
    loadingProvider === "github" ||
    !config?.googleClientId ||
    !googleReady ||
    loadingProvider === "google";

  const githubDisabled =
    loadingProvider === "google" || !config?.githubClientId || loadingProvider === "github";

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-sm text-foreground/70">
        <p>Sign in as a candidate using a social account.</p>
        <p className="text-foreground/50">
          We&apos;ll create a candidate profile if you&apos;re new here.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="w-full justify-center gap-2"
          onClick={handleGoogleLogin}
          disabled={googleDisabled}
        >
          {loadingProvider === "google" ? (
            "Connecting to Google..."
          ) : (
            <>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-black shadow">
                G
              </span>
              Continue with Google
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full justify-center gap-2"
          onClick={handleGitHubLogin}
          disabled={githubDisabled}
        >
          {loadingProvider === "github" ? (
            "Connecting to GitHub..."
          ) : (
            <>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                GH
              </span>
              Continue with GitHub
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
