import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

type Params = {
  jobId: string;
};
type ParamsOrPromise = Params | Promise<Params>;

export async function GET(
  _request: NextRequest,
  context: { params: ParamsOrPromise }
) {
  const params = await context.params;
  try {
    const response = await apiFetch(`/api/jobs/public/${params.jobId}`, {
      method: "GET",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch job details.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
