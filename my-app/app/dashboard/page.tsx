import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser } from "@/lib/current-user";
import type {
  ApplicationDetails,
  Interview,
  JobPosting,
} from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

async function getCompanyJobs(): Promise<JobPosting[]> {
  try {
    const response = await apiFetch("/api/jobs", { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as JobPosting[]) : [];
  } catch {
    return [];
  }
}

async function getApplicationsForJob(jobId: number): Promise<ApplicationDetails[]> {
  try {
    const response = await apiFetch(`/api/jobs/${jobId}/applications`, { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as ApplicationDetails[]) : [];
  } catch {
    return [];
  }
}

async function getRecruiterInterviews(): Promise<Interview[]> {
  try {
    const response = await apiFetch("/api/interviews/my", { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as Interview[]) : [];
  } catch {
    return [];
  }
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Unknown";
  }
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function formatDateTime(value?: string | null, timezone?: string | null) {
  if (!value) {
    return "Scheduled soon";
  }
  try {
    const date = new Date(value);
    const formatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      ...(timezone ? { timeZone: timezone } : {}),
    });
    return formatter.format(date);
  } catch {
    return value;
  }
}

export default async function DashboardPage() {
  const viewer = await getCurrentUser();
  if (viewer?.roles.includes("SUPER_ADMIN")) {
    redirect(ROUTES.superAdminDashboard);
  }
  if (viewer?.roles.includes("COMPANY_ADMIN") && !viewer.roles.includes("RECRUITER")) {
    redirect(ROUTES.companyAdminDashboard);
  }

  const canAdminJobs = Boolean(viewer?.roles.includes("COMPANY_ADMIN"));
  const jobs = await getCompanyJobs();
  const applicationsByJob = new Map<number, ApplicationDetails[]>();

  const [jobApplications, interviews] = await Promise.all([
    Promise.all(
      jobs.map(async (job) => ({
        jobId: job.id,
        applications: await getApplicationsForJob(job.id),
      }))
    ),
    getRecruiterInterviews(),
  ]);

  for (const entry of jobApplications) {
    applicationsByJob.set(entry.jobId, entry.applications);
  }

  const allApplications = jobApplications.flatMap((entry) => entry.applications);
  const openJobs = jobs.filter((job) => job.status === "PUBLISHED");
  const activeCandidateIds = new Set(allApplications.map((app) => app.candidateId));

  const pipelineCounts = allApplications.reduce<Record<string, number>>((acc, app) => {
    const key = app.status;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const upcomingInterviews = interviews
    .slice()
    .sort((a, b) => {
      const aTime = a.scheduleTime ? new Date(a.scheduleTime).getTime() : Infinity;
      const bTime = b.scheduleTime ? new Date(b.scheduleTime).getTime() : Infinity;
      return aTime - bTime;
    })
    .slice(0, 5);

  const recentApplications = allApplications
    .slice()
    .sort((a, b) => {
      const aTime = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
      const bTime = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 8);

  const awaitingReview = allApplications.filter((application) =>
    ["APPLIED", "SCREENING"].includes(application.status)
  ).length;

  const summaryMetrics = [
    {
      label: "Active openings",
      value: openJobs.length,
      helper: "Roles currently visible to candidates.",
    },
    {
      label: "Pipeline candidates",
      value: activeCandidateIds.size,
      helper: "Applications you are actively tracking.",
    },
    {
      label: "Awaiting review",
      value: awaitingReview,
      helper: "Applicants waiting for the next touchpoint.",
    },
    {
      label: "Upcoming interviews",
      value: upcomingInterviews.length,
      helper: "Scheduled conversations in the next few days.",
    },
  ];

  const quickActions = [
    {
      label: "Review new applicants",
      href: "#applications",
      description: "Skim the latest submissions and leave notes for hiring managers.",
    },
    {
      label: "Diagnose pipeline stalls",
      href: "#pipeline",
      description: "Spot bottlenecks across stages and rebalance workloads quickly.",
    },
    {
      label: "Prepare for interviews",
      href: "#interviews",
      description: "Confirm schedules, share agendas, and ensure follow-up owners are ready.",
    },
    {
      label: "Track job performance",
      href: "#job-health",
      description: "See which openings need fresh sourcing or faster feedback loops.",
    },
  ];

  const heroHighlights = [
    `${allApplications.length} application${allApplications.length === 1 ? "" : "s"} in your pipeline.`,
    `${awaitingReview} candidate${awaitingReview === 1 ? "" : "s"} waiting for a response.`,
    `${upcomingInterviews.length} upcoming interview${upcomingInterviews.length === 1 ? "" : "s"} to prepare.`,
  ];

  return (
    <Container className="space-y-10">
      <Panel variant="glass" padding="lg" className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
              Recruiter workspace
            </span>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Coordinate jobs, candidates, and interviews in one place.
            </h1>
            <p className="max-w-2xl text-sm text-foreground/70">
              Stay on top of the hiring pipeline with clear priorities, context from recent activity, and the quickest path to action.
            </p>
            <ul className="space-y-2 text-sm text-foreground/70">
              {heroHighlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-accent" aria-hidden />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 rounded-3xl border border-foreground/10 bg-surface/90 p-6 shadow-[0_18px_32px_rgba(15,23,42,0.14)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
              Today&apos;s focus
            </p>
            <p className="text-sm text-foreground/70">
              Start with candidates awaiting outreach, then review interviews to confirm prep and follow-up owners.
            </p>
            <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-xs text-accent">
              Keep your response times tight: aim to acknowledge every new applicant within 24 hours.
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-foreground/10 bg-surface/95 p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] transition hover:border-accent/30 hover:shadow-[0_20px_36px_rgba(15,23,42,0.12)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{metric.value}</p>
              <p className="mt-1 text-xs text-foreground/60">{metric.helper}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel variant="surface" padding="lg" className="space-y-6">
        <header className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
          <p className="text-sm text-foreground/60">
            Jump straight into the areas that keep the pipeline healthy and candidates moving forward.
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 text-sm text-foreground/70 transition hover:border-accent/40 hover:text-foreground hover:shadow-[0_22px_40px_rgba(15,23,42,0.12)]"
            >
              <span className="text-sm font-semibold text-foreground">{action.label}</span>
              <span className="text-xs">{action.description}</span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent transition group-hover:translate-x-0.5">
                Go now
                <span aria-hidden>&gt;</span>
              </span>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel id="jobs" variant="surface" padding="lg" className="space-y-6">
        <header className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Job catalog</h2>
          <p className="text-sm text-foreground/60">
            Review the roles you are helping to staff. {canAdminJobs
              ? "Switch to the company admin workspace whenever you need to publish, pause, or edit postings."
              : "Only company admins can create or edit postings. Reach out to your admin when changes are needed."}
          </p>
          {canAdminJobs ? (
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`${ROUTES.companyAdminDashboard}#jobs`}>
                <Button size="sm" variant="secondary">
                  Open company admin jobs
                </Button>
              </Link>
              <Link href={`${ROUTES.companyAdminDashboard}#team`}>
                <Button size="sm" variant="ghost">
                  Manage team access
                </Button>
              </Link>
            </div>
          ) : null}
        </header>
        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
            No postings yet. Contact your company admin to launch the first role.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 shadow-[0_12px_22px_rgba(15,23,42,0.08)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{job.title}</p>
                    <p className="text-xs text-foreground/60">
                      Status {formatStatus(job.status)} � Updated {formatDate(job.updatedAt)}
                    </p>
                  </div>
                  <Link
                    href={`${ROUTES.jobs}/${job.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition hover:text-foreground"
                  >
                    Preview posting
                    <span aria-hidden>&gt;</span>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/55">
                  {job.location ? <span>{job.location}</span> : null}
                  {job.workType ? (
                    <span className="flex items-center gap-1 before:block before:h-1 before:w-1 before:rounded-full before:bg-foreground/40">
                      {job.workType.toLowerCase()}
                    </span>
                  ) : null}
                  {job.salaryRange ? (
                    <span className="flex items-center gap-1 before:block before:h-1 before:w-1 before:rounded-full before:bg-foreground/40">
                      {job.salaryRange}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-foreground/50">
                  {canAdminJobs
                    ? "Need to make changes? Head to the company admin workspace to edit this posting."
                    : "Need an update? Ask your company admin to adjust the posting."}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel id="pipeline" variant="surface" padding="lg" className="space-y-4">
          <header>
            <h2 className="text-lg font-semibold text-foreground">Pipeline snapshot</h2>
            <p className="text-sm text-foreground/60">
              Aggregated from company applications. Adjust statuses from any candidate profile and the totals update automatically.
            </p>
          </header>
          {allApplications.length === 0 ? (
            <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-4 py-6 text-sm text-foreground/60">
              No applications yet. Invite candidates or post new jobs to start building your pipeline.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(pipelineCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3 text-sm shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
                >
                  <span className="text-foreground/70">{formatStatus(status)}</span>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel id="interviews" variant="surface" padding="lg" className="space-y-4">
          <header>
            <h2 className="text-lg font-semibold text-foreground">Upcoming interviews</h2>
            <p className="text-sm text-foreground/60">
              View the next five conversations on your calendar. Reschedule or log feedback directly from the interviews area.
            </p>
          </header>

          {upcomingInterviews.length === 0 ? (
            <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-4 py-6 text-sm text-foreground/60">
              No interviews scheduled. Coordinate with candidates to move them forward.
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3 shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Application #{interview.applicationId}</span>
                    <span className="text-xs text-foreground/60">
                      {formatDateTime(interview.scheduleTime, interview.timezone)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/55">
                    {interview.format ?? "Format TBD"}
                     - 
                    {interview.locationOrLink ? interview.locationOrLink : "Location to be shared"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel id="applications" variant="surface" padding="lg" className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-foreground">Recent applications</h2>
          <p className="text-sm text-foreground/60">
            Latest activity across your pipeline. Click through to view notes, update status, or add feedback.
          </p>
        </header>

        {recentApplications.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-4 py-6 text-sm text-foreground/60">
            Nothing to show yet. Applications will appear here as soon as candidates submit them.
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {recentApplications.map((application) => (
              <Link
                key={application.id}
                href={`${ROUTES.recruiterDashboard}/applications/${application.id}`}
                className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 transition hover:border-accent/30 hover:bg-surface/80"
              >
                <div>
                  <p className="font-semibold text-foreground">Application #{application.id}</p>
                  <p className="text-xs text-foreground/50">
                    Job #{application.jobPostingId} Applied {formatDate(application.appliedAt)}
                  </p>
                  <p className="text-xs text-foreground/50">
                    Candidate {application.candidateName ?? `#${application.candidateId}`}
                  </p>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  {formatStatus(application.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Panel>

      <Panel id="job-health" variant="surface" padding="lg" className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-foreground">Job health</h2>
          <p className="text-sm text-foreground/60">
            Track application volume per job and spot roles that need more sourcing or faster follow-up.
          </p>
        </header>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-4 py-6 text-sm text-foreground/60">
            No jobs found for your company. Create a job posting to populate this table.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-foreground/10 bg-surface/95 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
            <table className="min-w-full divide-y divide-foreground/10 text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.28em] text-foreground/50">
                <tr>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Applications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {jobs.map((job) => {
                  const applications = applicationsByJob.get(job.id) ?? [];
                  return (
                    <tr key={job.id}>
                      <td className="px-4 py-3 text-sm text-foreground">{job.title}</td>
                      <td className="px-4 py-3 text-sm text-foreground/70">{formatStatus(job.status)}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">{applications.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </Container>
  );
}

