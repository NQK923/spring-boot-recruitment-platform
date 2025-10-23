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
  JobPosition,
} from "@/lib/types";
import { CreateJobForm } from "@/components/jobs/create-job-form";
import { UpdateJobForm } from "@/components/jobs/update-job-form";

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

async function getJobPositions(): Promise<JobPosition[]> {
  try {
    const response = await apiFetch("/api/jobs/positions", { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as JobPosition[]) : [];
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

  const jobs = await getCompanyJobs();
  const applicationsByJob = new Map<number, ApplicationDetails[]>();

  const [jobApplications, interviews, positions] = await Promise.all([
    Promise.all(
      jobs.map(async (job) => ({
        jobId: job.id,
        applications: await getApplicationsForJob(job.id),
      }))
    ),
    getRecruiterInterviews(),
    getJobPositions(),
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

  const summaryMetrics = [
    {
      label: "Open roles ready to hire",
      value: openJobs.length,
      helper: "Jobs currently published to candidates.",
    },
    {
      label: "Pipeline candidates",
      value: activeCandidateIds.size,
      helper: "Unique candidates across all applications.",
    },
    {
      label: "Upcoming interviews",
      value: upcomingInterviews.length,
      helper: "Next five scheduled conversations.",
    },
  ];

  return (
    <Container className="space-y-10">
      <Panel variant="glass" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
              Recruiter workspace
            </span>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Coordinate jobs, candidates, and interviews in one place.
            </h1>
            <p className="max-w-2xl text-sm text-foreground/70">
              Publish roles, manage applications, and keep interview schedules aligned with timely updates across
              the workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.jobs}>
              <Button size="sm" variant="secondary">
                View public board
              </Button>
            </Link>
            <Link href={ROUTES.docs}>
              <Button size="sm">Workflow playbook</Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {summaryMetrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-foreground/10 bg-surface/90 p-5">
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
        <h2 className="text-lg font-semibold text-foreground">Create and manage jobs</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <CreateJobForm positions={positions} />
          </div>
          <div className="space-y-4 rounded-2xl border border-foreground/10 bg-surface/95 p-6">
            <header className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Existing postings</p>
              <p className="text-sm text-foreground/60">
                Update status, work patterns, or position assignments and publish changes to your live postings
                instantly.
              </p>
            </header>
            {jobs.length === 0 ? (
              <p className="rounded-2xl border border-foreground/10 bg-surface px-4 py-4 text-sm text-foreground/60">
                No postings yet. Create your first job to start building the pipeline.
              </p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <UpdateJobForm key={job.id} job={job} positions={positions} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel variant="surface" padding="lg" className="space-y-4">
          <header>
            <h2 className="text-lg font-semibold text-foreground">Pipeline snapshot</h2>
            <p className="text-sm text-foreground/60">
              Aggregated from company applications. Adjust statuses from any candidate profile and the totals
              update automatically.
            </p>
          </header>
          {allApplications.length === 0 ? (
            <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-4 py-6 text-sm text-foreground/60">
              No applications yet. Invite candidates or post new jobs to start building your pipeline.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(pipelineCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-surface px-4 py-3 text-sm">
                  <span className="text-foreground/70">{formatStatus(status)}</span>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel variant="surface" padding="lg" className="space-y-4">
          <header>
            <h2 className="text-lg font-semibold text-foreground">Upcoming interviews</h2>
            <p className="text-sm text-foreground/60">
              View the next five conversations on your calendar. Reschedule or log feedback directly from the
              interviews area.
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
                  className="rounded-2xl border border-foreground/10 bg-surface px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Application #{interview.applicationId}
                    </span>
                    <span className="text-xs text-foreground/60">
                      {formatDateTime(interview.scheduleTime, interview.timezone)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/50">
                    {interview.format ?? "Format TBD"}
                    {" - "}
                    {interview.locationOrLink ? interview.locationOrLink : "Location to be shared"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel variant="surface" padding="lg" className="space-y-4">
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
                className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-surface px-5 py-4 transition hover:border-accent/30 hover:bg-surface/80"
              >
                <div>
                  <p className="font-semibold text-foreground">Application #{application.id}</p>
                  <p className="text-xs text-foreground/50">
                    Job #{application.jobPostingId} - Applied {formatDate(application.appliedAt)}
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

      <Panel variant="surface" padding="lg" className="space-y-4">
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
          <div className="overflow-x-auto rounded-2xl border border-foreground/10 bg-surface">
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
                      <td className="px-4 py-3 text-sm text-foreground/70">
                        {formatStatus(job.status)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                        {applications.length}
                      </td>
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
