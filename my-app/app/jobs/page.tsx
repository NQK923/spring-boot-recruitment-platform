import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import type { JobPostingPublic } from "@/lib/types";
import { JobsSearchForm } from "./search-form";
import { JobsResults } from "./results";

export const dynamic = "force-dynamic";

async function getPublicJobs(search?: string): Promise<JobPostingPublic[]> {
  try {
    const params = new URLSearchParams();
    if (search && search.trim().length > 0) {
      params.set("search", search.trim());
    }
    const query = params.toString();
    const response = await apiFetch(`/api/jobs/public${query ? `?${query}` : ""}`, {
      method: "GET",
      skipAuthHeaders: true,
      cache: "no-store",
    });
    const data = await response.json();
    if (Array.isArray(data)) {
      return data as JobPostingPublic[];
    }
    return [];
  } catch {
    return [];
  }
}

type JobsPageProps = {
  searchParams?: {
    search?: string;
  };
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const rawSearch = typeof searchParams?.search === "string" ? searchParams.search : "";
  const normalizedSearch = rawSearch.trim();
  const jobs = await getPublicJobs(normalizedSearch);
  const hasQuery = normalizedSearch.length > 0;
  const resultsCopy = hasQuery
    ? `Showing ${jobs.length} result${jobs.length === 1 ? "" : "s"} for "${normalizedSearch}".`
    : `Showing ${jobs.length} open role${jobs.length === 1 ? "" : "s"}.`;

  return (
    <Container className="flex flex-col gap-10">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
              Discover opportunities
            </span>
            <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">Open roles</h1>
            <p className="mt-2 max-w-2xl text-sm text-foreground/70">
              Browse open opportunities from hiring teams using Talentflow. Listings refresh as recruiters update
              requirements, locations, or salary ranges so you always see the latest details.
            </p>
          </div>
          <Link href={ROUTES.register}>
            <Button variant="secondary" size="md">
              Create candidate profile
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-foreground/60">
          <span className="rounded-full border border-foreground/10 px-3 py-1">
            New roles added every week
          </span>
          <span className="rounded-full border border-foreground/10 px-3 py-1">
            Recruiter notes shared transparently
          </span>
          <span className="rounded-full border border-foreground/10 px-3 py-1">
            Track your application with status alerts
          </span>
        </div>
      </header>

      <Panel padding="lg" className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Search open roles</p>
          <p className="text-xs text-foreground/60">{resultsCopy}</p>
        </div>
        <JobsSearchForm initialQuery={rawSearch} />
      </Panel>

      <JobsResults jobs={jobs} hasQuery={hasQuery} />
    </Container>
  );
}
