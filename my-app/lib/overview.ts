import { apiFetch } from "@/lib/api";
import type { PublicOverviewResponse } from "@/lib/types";

const OVERVIEW_REVALIDATE_SECONDS = 120;

export async function getPublicOverview(): Promise<PublicOverviewResponse> {
  const response = await apiFetch("/api/companies/public/overview", {
    skipAuthHeaders: true,
    next: { revalidate: OVERVIEW_REVALIDATE_SECONDS },
  });

  return (await response.json()) as PublicOverviewResponse;
}
