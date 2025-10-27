import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getAccessTokenFromCookies } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import { ApplyForm } from "@/components/jobs/apply-form";
import type { CompanyPublicProfile, JobPostingPublic, MeResponse } from "@/lib/types";

async function getJob(jobId: string): Promise<JobPostingPublic | null> {
  try {
    const response = await apiFetch(`/api/jobs/public/${jobId}`, {
      method: "GET",
      skipAuthHeaders: true,
      cache: "no-store",
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

async function getCompanyProfile(companyId: number): Promise<CompanyPublicProfile | null> {
  try {
    const response = await apiFetch(`/api/companies/public/${companyId}`, {
      method: "GET",
      skipAuthHeaders: true,
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data as CompanyPublicProfile;
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
  const companyProfile = job.companyId ? await getCompanyProfile(job.companyId) : null;

  let canApply = false;
  const token = await getAccessTokenFromCookies();
  if (token) {
    const me = await getCurrentUser();
    canApply = me?.roles?.includes("CANDIDATE") ?? false;
  }

  const companyWebsiteRaw = companyProfile?.website ?? null;
  const companyWebsite =
    companyWebsiteRaw && companyWebsiteRaw.trim().length > 0
      ? companyWebsiteRaw.startsWith("http")
        ? companyWebsiteRaw
        : `https://${companyWebsiteRaw}`
      : null;

  return (
    <Container className="max-w-5xl space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-muted">
          <span>Job #{job.id}</span>
          <span className="h-1 w-1 rounded-full bg-muted/50" />
          <span>Public posting</span>
        </div>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{job.title}</h1>
        <p className="max-w-3xl text-sm text-foreground/70">
          Role details come straight from the hiring team. Apply to join the pipeline, or sign in to your
          candidate workspace to keep track of interviews and feedback afterwards.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel variant="surface" padding="lg" className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Role overview</h2>
              <p className="whitespace-pre-wrap text-sm text-foreground/70">
                {job.description ??
                  "The hiring team is finalising this description. Check back soon or follow the role to stay updated."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Requirements</h2>
              <p className="whitespace-pre-wrap text-sm text-foreground/70">
                {job.requirements ??
                  "Recruiters will list required skills, experience, and tools here as soon as they are confirmed."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Benefits</h2>
              <p className="whitespace-pre-wrap text-sm text-foreground/70">
                {job.benefits ??
                  "Compensation and benefits will be provided once this role is fully published by the hiring team."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Compensation range</h2>
              <p className="whitespace-pre-wrap text-sm text-foreground/70">
                {job.salaryRange ??
                  "Salary details will appear here after the hiring team finalizes the range for this opening."}
              </p>
            </div>
          </Panel>

          <Panel variant="surface" padding="lg" className="text-sm text-foreground/70">
            <p className="font-semibold text-foreground">How this team hires</p>
            <p className="mt-2">
              Applications are routed directly to the recruiter assigned to this role. Expect timely updates,
              collaborative notes, and interview invites as you move forward through the pipeline.
            </p>
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel variant="glass" padding="lg" className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">About the company</p>
              <h2 className="text-xl font-semibold text-foreground">
                {companyProfile?.name ?? "Recruiting company"}
              </h2>
            </div>
            <p className="text-sm text-foreground/70">
              {companyProfile?.description ??
                "The hiring team will share more about company culture, values, and mission as the posting is updated."}
            </p>
            <dl className="space-y-3 text-sm text-foreground/70">
              <div>
                <dt className="font-semibold text-foreground">Headcount</dt>
                <dd>{companyProfile?.companySize ?? "Awaiting confirmed headcount from the recruiter."}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Primary office</dt>
                <dd>{companyProfile?.companyAddress ?? "Office location will be published soon."}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Role location</dt>
                <dd>{job.location ?? "Location details will appear once confirmed."}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Work style</dt>
                <dd>{job.workType ?? "The team will confirm on-site, hybrid, or remote expectations shortly."}</dd>
              </div>
            </dl>
            {companyWebsite && (
              <Link
                href={companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-border/70 px-4 py-2 text-xs font-semibold text-foreground transition hover:border-foreground"
              >
                Visit company site
              </Link>
            )}
          </Panel>
        </aside>
      </div>

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
