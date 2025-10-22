import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.toString();

  try {
    const response = await apiFetch(`/api/jobs/public${search ? `?${search}` : ""}`, {
      method: "GET",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch jobs.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
