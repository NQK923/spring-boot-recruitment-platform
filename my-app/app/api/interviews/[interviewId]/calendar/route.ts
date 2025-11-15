import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

type Params = {
  interviewId: string;
};
type ParamsOrPromise = Params | Promise<Params>;

export async function GET(
  _request: NextRequest,
  context: { params: ParamsOrPromise }
) {
  const params = await context.params;
  try {
    const response = await apiFetch(`/api/interviews/${params.interviewId}/calendar.ics`, {
      method: "GET",
    });
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="interview-${params.interviewId}.ics"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to download interview calendar.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
