import { NextResponse } from "next/server";
import { clearAccessToken } from "@/lib/session";

export async function POST() {
  clearAccessToken();
  return NextResponse.json({ success: true });
}
