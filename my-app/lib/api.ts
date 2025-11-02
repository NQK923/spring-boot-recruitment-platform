import { getAccessTokenFromCookies } from "@/lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ApiFetchOptions = RequestInit & {
  skipAuthHeaders?: boolean;
};

/**
 * Wrapper around fetch that targets the gateway-service base URL and forwards credentials.
 */
export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  if (!API_BASE_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Define it in your .env.local to point at the gateway-service."
    );
  }

  const { skipAuthHeaders, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);
  const requestInit: RequestInit = { ...rest };

  const method = (requestInit.method ?? "GET").toUpperCase();
  requestInit.method = method;

  if (method === "GET" && requestInit.cache == null) {
    requestInit.cache = "no-store";
  }

  const body = requestInit.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const isBlob = typeof Blob !== "undefined" && body instanceof Blob;
  const isArrayBuffer = typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer;
  const isUrlEncoded =
    typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;
  const shouldSetJsonContentType =
    !requestHeaders.has("Content-Type") &&
    body !== undefined &&
    !isFormData &&
    !isBlob &&
    !isArrayBuffer &&
    !isUrlEncoded;

  if (shouldSetJsonContentType) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuthHeaders && !requestHeaders.has("Authorization")) {
    const token = await getAccessTokenFromCookies();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    headers: requestHeaders,
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody = await safeJson(response);
    const message =
      (errorBody && typeof errorBody === "object" && "message" in errorBody
        ? String((errorBody as Record<string, unknown>).message)
        : `Request failed with status ${response.status}`) || "Unknown error";
    throw new Error(message);
  }

  return response;
}

async function safeJson(response: Response) {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
}
