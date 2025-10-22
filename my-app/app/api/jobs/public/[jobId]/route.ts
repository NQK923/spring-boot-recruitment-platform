import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

type Params = {
  jobId: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Params }
) {
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
