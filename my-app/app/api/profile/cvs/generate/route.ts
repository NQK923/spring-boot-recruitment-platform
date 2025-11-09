import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown> = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  try {
    const response = await apiFetch("/api/profiles/me/cvs/generate", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        Accept: "application/pdf",
      },
    });

    const buffer = await response.arrayBuffer();
    const headers = new Headers();
    headers.set(
      "Content-Type",
      response.headers.get("Content-Type") ?? "application/pdf"
    );
    headers.set(
      "Content-Disposition",
      response.headers.get("Content-Disposition") ?? 'attachment; filename="CV.pdf"'
    );

    return new NextResponse(buffer, {
      status: response.status,
      headers,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể tạo CV tự động.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
