import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromCookies } from "@/lib/session";

export type ChatRouteParams = {
  slug?: string[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function resolvePath(params: ChatRouteParams): string | null {
  const segments = Array.isArray(params.slug) ? params.slug.filter(Boolean) : [];
  if (segments.length === 0) {
    return null;
  }
  return segments.join("/");
}

async function buildHeaders(request: NextRequest) {
  const headers = new Headers();
  const token = await getAccessTokenFromCookies();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const contextHeader = request.headers.get("x-context");
  if (contextHeader) {
    headers.set("X-Context", contextHeader);
  }
  return headers;
}

function ensureBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Define it in your environment to target the gateway-service."
    );
  }
  return API_BASE_URL;
}

async function safeJson(response: Response) {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
}

export async function proxyChatPost(request: NextRequest, params: ChatRouteParams) {
  const path = resolvePath(params);
  if (!path) {
    return NextResponse.json({ message: "Missing chat action." }, { status: 400 });
  }
  const baseUrl = ensureBaseUrl();
  const payload = await request.json();

  const headers = await buildHeaders(request);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const response = await fetch(`${baseUrl}/api/chat/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = await safeJson(response);
  return NextResponse.json(body ?? {}, { status: response.status });
}

export async function proxyChatGet(request: NextRequest, params: ChatRouteParams) {
  const path = resolvePath(params);
  if (!path) {
    return NextResponse.json({ message: "Missing chat action." }, { status: 400 });
  }
  const baseUrl = ensureBaseUrl();
  const search = request.nextUrl.search || "";

  const headers = await buildHeaders(request);
  headers.set("Accept", request.headers.get("accept") ?? "text/event-stream");

  const response = await fetch(`${baseUrl}/api/chat/${path}${search}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const bodyText = await response.text();
    return new NextResponse(bodyText, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  }

  const passthroughHeaders = new Headers();
  const contentType = response.headers.get("Content-Type");
  if (contentType) {
    passthroughHeaders.set("Content-Type", contentType);
  } else {
    passthroughHeaders.set("Content-Type", "text/event-stream");
  }
  const cacheControl = response.headers.get("Cache-Control");
  if (cacheControl) {
    passthroughHeaders.set("Cache-Control", cacheControl);
  } else {
    passthroughHeaders.set("Cache-Control", "no-cache");
  }

  return new Response(response.body, {
    status: response.status,
    headers: passthroughHeaders,
  });
}
