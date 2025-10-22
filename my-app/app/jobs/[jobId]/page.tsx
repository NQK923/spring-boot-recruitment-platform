import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAccessTokenFromCookies } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import { ApplyForm } from "@/components/jobs/apply-form";

type JobPosting = {
  id: number;
  title: string;
  description?: string;
  requirements?: string;
  location?: string;
  workType?: string;
  status?: string;
  department?: string;
};

type CurrentUser = {
  roles?: string[];
};

async function getJob(jobId: string): Promise<JobPosting | null> {
  try {
    const response = await apiFetch(`/api/jobs/public/${jobId}`, {
      method: "GET",
      skipAuthHeaders: true,
    });
    if (response.status === 404) {
      return null;
    }
    const data = await response.json();
    return (data && typeof data === "object") ? (data as JobPosting) : null;
  } catch {
    return null;
  }
}

async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const response = await apiFetch("/api/auth/me", { method: "GET" });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data as CurrentUser;
  } catch {
    return null;
  }
}

export default async function JobDetailsPage({
  params,
}: {
  params: { jobId: string };
}) {
  const job = await getJob(params.jobId);
  if (!job) {
    notFound();
  }

  let canApply = false;
  const token = getAccessTokenFromCookies();
  if (token) {
    const me = await getCurrentUser();
    canApply = me?.roles?.includes("CANDIDATE") ?? false;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <span className="inline-flex items-center rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground">
          {(job.status ?? "").toLowerCase() === "open" ? "Open" : job.status ?? "Active"}
        </span>
        <h1 className="text-3xl font-semibold text-foreground">{job.title}</h1>
        <p className="text-sm text-foreground/60">
          {job.location ?? "Location flexible"} - {job.workType ?? "Flexible"}{" "}
          {job.department ? `- ${job.department}` : ""}
        </p>
      </header>

      <section className="space-y-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Role overview</h2>
          <p className="whitespace-pre-wrap text-sm text-foreground/70">
            {job.description ??
              "Detailed job description will appear here once the Job Service returns the full payload."}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Requirements</h2>
          <p className="whitespace-pre-wrap text-sm text-foreground/70">
            {job.requirements ??
              "Specific requirements will display here after integrating with the Job Service response."}
          </p>
        </div>
      </section>

      {canApply ? (
        <ApplyForm jobPostingId={job.id} />
      ) : (
        <div className="rounded-2xl border border-foreground/10 bg-background/60 p-6 text-sm text-foreground/70">
          <p className="font-semibold text-foreground">Ready to apply?</p>
          <p>
            Sign in with your candidate account to submit an application and track progress in the portal.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href={`${ROUTES.signIn}?next=${ROUTES.jobs}/${job.id}`}
              className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-background"
            >
              Sign in to apply
            </Link>
            <Link
              href={ROUTES.register}
              className="inline-flex h-10 items-center justify-center rounded-full border border-foreground/20 px-5 text-sm font-semibold text-foreground"
            >
              Create candidate account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
