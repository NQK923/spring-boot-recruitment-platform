import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getAccessTokenFromCookies } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import { ApplyForm } from "@/components/jobs/apply-form";
import type { JobPostingPublic, MeResponse } from "@/lib/types";

async function getJob(jobId: string): Promise<JobPostingPublic | null> {
  try {
    const response = await apiFetch(`/api/jobs/public/${jobId}`, {
      method: "GET",
      skipAuthHeaders: true,
    });
    if (response.status === 404) {
      return null;
    }
    const data = await response.json();
    return (data && typeof data === "object") ? (data as JobPostingPublic) : null;
  } catch {
    return null;
  }
}

async function getCurrentUser(): Promise<MeResponse | null> {
  try {
    const response = await apiFetch("/api/auth/me", { method: "GET" });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data as MeResponse;
  } catch {
    return null;
  }
}

type JobDetailsPageProps = {
  params: Promise<{ jobId: string }> | { jobId: string };
};

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const job = await getJob(resolvedParams.jobId);
  if (!job) {
    notFound();
  }

  let canApply = false;
  const token = await getAccessTokenFromCookies();
  if (token) {
    const me = await getCurrentUser();
    canApply = me?.roles?.includes("CANDIDATE") ?? false;
  }

  return (
    <Container className="max-w-4xl space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-muted">
          <span>Job #{job.id}</span>
          <span className="h-1 w-1 rounded-full bg-muted/50" />
          <span>Public posting</span>
        </div>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{job.title}</h1>
        <p className="max-w-3xl text-sm text-foreground/70">
          Role details below sync directly from the Job Service. Apply to join the pipeline, or sign in to your
          candidate workspace to keep track of interviews and feedback afterwards.
        </p>
      </header>

      <Panel variant="surface" padding="lg" className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Role overview</h2>
          <p className="whitespace-pre-wrap text-sm text-foreground/70">
            {job.description ??
              "Detailed job description will appear here once the Job Service returns the full payload."}
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Requirements</h2>
          <p className="whitespace-pre-wrap text-sm text-foreground/70">
            Specific requirements will display here after integrating with the Job Service response.
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-surface/90 p-5 text-sm text-foreground/70">
          Applications travel through the gateway for authentication, role propagation, and enrichment before
          landing in the Application Service. Expect timely updates as you move forward.
        </div>
      </Panel>

      {canApply ? (
        <Panel variant="glass" padding="lg">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Submit your application</h2>
              <p className="text-sm text-foreground/70">
                Complete your submission with an up-to-date CV. You can manage documents and track status in the
                candidate portal.
              </p>
            </div>
            <ApplyForm jobPostingId={job.id} />
          </div>
        </Panel>
      ) : (
        <Panel variant="glass" padding="lg" className="space-y-4 text-sm text-foreground/70">
          <div>
            <p className="font-semibold text-foreground">Ready to apply?</p>
            <p>
              Sign in with your candidate account to submit an application and monitor stages from the dedicated
              portal.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`${ROUTES.signIn}?next=${ROUTES.jobs}/${job.id}`}>
              <Button size="md">Sign in to apply</Button>
            </Link>
            <Link href={ROUTES.register}>
              <Button size="md" variant="secondary">
                Create candidate account
              </Button>
            </Link>
          </div>
        </Panel>
      )}
    </Container>
  );
}
