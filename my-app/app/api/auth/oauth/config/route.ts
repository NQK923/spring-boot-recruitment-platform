import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET() {
  try {
    const response = await apiFetch("/api/auth/oauth/config", {
      method: "GET",
      skipAuthHeaders: true,
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load OAuth configuration.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
