import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
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
    .slice(0, 5);

  const summaryMetrics = [
    { label: "Open jobs", value: openJobs.length, helper: `${jobs.length} total` },
    {
      label: "Active candidates",
      value: activeCandidateIds.size,
      helper: `${allApplications.length} total applications`,
    },
    {
      label: "Upcoming interviews",
      value: upcomingInterviews.length,
      helper: `${interviews.length} scheduled`,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Recruiter workspace</h1>
        <p className="text-sm text-foreground/70">
          Overview of company hiring activity powered by Job, Application, and Interview services through
          the gateway.
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm md:grid-cols-3">
        {summaryMetrics.map((metric) => (
          <div key={metric.label} className="flex flex-col gap-1">
            <span className="text-sm text-foreground/60">{metric.label}</span>
            <span className="text-3xl font-semibold text-foreground">{metric.value}</span>
            <span className="text-xs text-foreground/50">{metric.helper}</span>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <CreateJobForm positions={positions} />
        <article className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-background/70 p-6 shadow-sm">
          <header>
            <h2 className="text-lg font-semibold text-foreground">Manage existing jobs</h2>
            <p className="text-sm text-foreground/60">
              Update status, work patterns, or position assignments. Requests flow through the gateway to
              the Job Service.
            </p>
          </header>
          {jobs.length === 0 ? (
            <p className="rounded-xl border border-foreground/10 bg-background/60 px-4 py-4 text-sm text-foreground/60">
              No postings yet. Create your first job to start building the pipeline.
            </p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <UpdateJobForm key={job.id} job={job} positions={positions} />
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
          <header>
            <h2 className="text-lg font-semibold text-foreground">Pipeline snapshot</h2>
            <p className="text-sm text-foreground/60">
              Aggregated from company applications. Update statuses in the Application Service and they
              will reflect here automatically.
            </p>
          </header>
          {allApplications.length === 0 ? (
            <div className="rounded-xl border border-foreground/10 bg-background/60 px-4 py-6 text-sm text-foreground/60">
              No applications yet. Invite candidates or post new jobs to start building your pipeline.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(pipelineCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">{formatStatus(status)}</span>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
          <header>
            <h2 className="text-lg font-semibold text-foreground">Upcoming interviews</h2>
            <p className="text-sm text-foreground/60">
              Data returned from `/api/interviews/my`. Reschedule or add feedback from the Interview Service.
            </p>
          </header>

          {upcomingInterviews.length === 0 ? (
            <div className="rounded-xl border border-foreground/10 bg-background/60 px-4 py-6 text-sm text-foreground/60">
              No interviews scheduled. Coordinate with candidates to move them forward.
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="rounded-xl border border-foreground/10 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Application #{interview.applicationId}
                    </span>
                    <span className="text-xs text-foreground/60">
                      {formatDateTime(interview.scheduleTime, interview.timezone)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/50">
                    {interview.format ?? "Format TBD"} -{" "}
                    {interview.locationOrLink ? interview.locationOrLink : "Location to be shared"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Recent applications</h2>
        <p className="text-sm text-foreground/60">
          Latest activity across your pipeline. Click through to view notes, update status, or add feedback.
        </p>

        {recentApplications.length === 0 ? (
          <div className="mt-6 rounded-xl border border-foreground/10 bg-background/60 px-4 py-6 text-sm text-foreground/60">
            Nothing to show yet. Applications will appear here as soon as candidates submit them.
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            {recentApplications.map((application) => (
              <Link
                key={application.id}
                href={`${ROUTES.recruiterDashboard}/applications/${application.id}`}
                className="flex items-center justify-between rounded-xl border border-foreground/10 px-4 py-3 transition hover:border-foreground/30 hover:bg-background/80"
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
                <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground">
                  {formatStatus(application.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Job health</h2>
        <p className="text-sm text-foreground/60">
          Track application volume per job. Calls{" "}
          <code className="rounded bg-foreground/10 px-1 py-0.5 text-xs text-foreground">
            /api/jobs/{"{jobId}"}/applications
          </code>{" "}
          for each posting.
        </p>

        {jobs.length === 0 ? (
          <div className="mt-6 rounded-xl border border-foreground/10 bg-background/60 px-4 py-6 text-sm text-foreground/60">
            No jobs found for your company. Create a job posting in the Job Service to populate this table.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-foreground/10 text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-foreground/50">
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
      </section>
    </div>
  );
}
