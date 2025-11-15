import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

type Params = {
  applicationId: string;
};
type ParamsOrPromise = Params | Promise<Params>;

export async function GET(
  _request: NextRequest,
  context: { params: ParamsOrPromise }
) {
  const params = await context.params;
  try {
    const response = await apiFetch(`/api/applications/${params.applicationId}/notes`, {
      method: "GET",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch application notes.";
    return NextResponse.json({ message }, { status: 502 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: ParamsOrPromise }
) {
  const params = await context.params;
  try {
    const payload = await request.json();
    const response = await apiFetch(`/api/applications/${params.applicationId}/notes`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create application note.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
