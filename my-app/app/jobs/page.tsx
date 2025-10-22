import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

type JobPosting = {
  id: number;
  title: string;
  description?: string;
  location?: string;
  workType?: string;
  status?: string;
};

async function getPublicJobs(): Promise<JobPosting[]> {
  try {
    const response = await apiFetch("/api/jobs/public", { method: "GET", skipAuthHeaders: true });
    const data = await response.json();
    if (Array.isArray(data)) {
      return data as JobPosting[];
    }
    return [];
  } catch {
    return [];
  }
}

export default async function JobsPage() {
  const jobs = await getPublicJobs();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Open roles</h1>
        <p className="text-sm text-foreground/70">
          Browse public job postings aggregated from the Job Service. Choose a role to view the complete
          description and apply through the candidate portal.
        </p>
      </header>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-foreground/10 bg-background/70 p-8 text-sm text-foreground/60">
          No jobs are available right now. Check back soon or sign in to see personalized recommendations.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="flex h-full flex-col gap-4 rounded-2xl border border-foreground/10 bg-background/70 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-foreground">{job.title}</h2>
                  <p className="text-xs uppercase tracking-wide text-foreground/50">
                    {job.location ?? "Location flexible"} · {job.workType ?? "Flexible"}
                  </p>
                </div>
                <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground">
                  {(job.status ?? "").toLowerCase() === "open" ? "Open" : job.status ?? "Active"}
                </span>
              </div>
              <p className="line-clamp-3 text-sm text-foreground/70">
                {job.description ?? "This role description will appear once the Job Service returns details."}
              </p>
              <div className="mt-auto">
                <Link
                  href={`${ROUTES.jobs}/${job.id}`}
                  className="text-sm font-semibold text-foreground hover:underline"
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
