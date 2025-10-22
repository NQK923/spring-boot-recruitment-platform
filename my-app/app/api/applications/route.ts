import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.toString();

  try {
    const response = await apiFetch(`/api/applications${search ? `?${search}` : ""}`, {
      method: "GET",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch applications.";
    return NextResponse.json({ message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const response = await apiFetch("/api/applications", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit application.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
