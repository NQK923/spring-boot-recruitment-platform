import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Avatar image is required." }, { status: 400 });
  }

  const payload = new FormData();
  payload.set("file", file);

  try {
    const response = await apiFetch("/api/profiles/me/avatar", {
      method: "POST",
      body: payload,
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update avatar right now.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
