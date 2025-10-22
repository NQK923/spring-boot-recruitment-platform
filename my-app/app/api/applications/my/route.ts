import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET() {
  try {
    const response = await apiFetch("/api/applications/my", { method: "GET" });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load your applications.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
