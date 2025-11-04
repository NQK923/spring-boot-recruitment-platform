import type { NextRequest } from "next/server";
import { getAccessTokenFromCookies } from "@/lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function copyDownloadHeaders(source: Headers) {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") {
      return;
    }
    headers.set(key, value);
  });
  headers.set("Cache-Control", "no-store");
  return headers;
}

type ParamsPromise = { fileId: string } | Promise<{ fileId: string }>;

export async function GET(
  _request: NextRequest,
  context: { params: ParamsPromise }
) {
  if (!API_BASE_URL) {
    return new Response("Gateway base URL is not configured.", { status: 500 });
  }

  const params = await context.params;
  const fileId = params?.fileId;
  if (!fileId) {
    return new Response("Missing file id.", { status: 400 });
  }

  const token = await getAccessTokenFromCookies();
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const upstreamResponse = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!upstreamResponse.ok) {
    const body = await upstreamResponse.text();
    return new Response(body, {
      status: upstreamResponse.status,
      headers: copyDownloadHeaders(upstreamResponse.headers),
    });
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: copyDownloadHeaders(upstreamResponse.headers),
  });
}
