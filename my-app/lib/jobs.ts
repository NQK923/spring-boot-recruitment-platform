import { apiFetch } from "@/lib/api";
import type { JobPostingPublic, PaginatedResponse } from "@/lib/types";

type GetLatestJobsOptions = {
  limit?: number;
};

export async function getLatestJobs({ limit = 8 }: GetLatestJobsOptions = {}) {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    const response = await apiFetch(`/api/jobs/public?${params.toString()}`, {
      method: "GET",
      skipAuthHeaders: true,
      cache: "force-cache",
      next: { revalidate: 60 },
    });

    const payload = (await response.json()) as PaginatedResponse<JobPostingPublic>;
    return (payload.items ?? []).slice(0, limit);
  } catch {
    return [];
  }
}
