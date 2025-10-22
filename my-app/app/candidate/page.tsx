import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

type Application = {
  id: number;
  jobPostingId: number;
  status: string;
  appliedAt?: string;
  updatedAt?: string;
};

type Interview = {
  id: number;
  applicationId: number;
  scheduleTime?: string;
  timezone?: string;
  format?: string;
  locationOrLink?: string;
};

type JobSummary = {
  id: number;
  title?: string;
  location?: string;
  workType?: string;
};

type EnrichedApplication = Application & {
  jobTitle: string;
  jobLocation?: string;
  jobWorkType?: string;
};

async function getApplications(): Promise<Application[]> {
  try {
    const response = await apiFetch("/api/applications/my", { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as Application[]) : [];
  } catch {
    return [];
  }
}

async function getJobSummary(jobId: number): Promise<JobSummary | null> {
  try {
    const response = await apiFetch(`/api/jobs/public/${jobId}`, {
      method: "GET",
      skipAuthHeaders: true,
    });
    if (response.status === 404) {
      return null;
    }
    const data = await response.json();
    return (data && typeof data === "object") ? (data as JobSummary) : null;
  } catch {
    return null;
  }
}

async function enrichApplications(applications: Application[]): Promise<EnrichedApplication[]> {
  const jobIds = Array.from(new Set(applications.map((app) => app.jobPostingId)));
  const jobMap = new Map<number, JobSummary>();

  await Promise.all(
    jobIds.map(async (jobId) => {
      const summary = await getJobSummary(jobId);
      if (summary) {
        jobMap.set(jobId, summary);
      }
    })
  );

  return applications.map((app) => {
    const job = jobMap.get(app.jobPostingId);
    return {
      ...app,
      jobTitle: job?.title ?? `Job #${app.jobPostingId}`,
      jobLocation: job?.location,
      jobWorkType: job?.workType,
    };
  });
}

async function getInterviews(): Promise<Interview[]> {
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

function formatDate(value?: string) {
  if (!value) {
    return "recently";
  }
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function formatDateTime(value?: string, timezone?: string) {
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

export default async function CandidatePortalPage() {
  const [applications, interviews] = await Promise.all([
    getApplications().then(enrichApplications),
    getInterviews(),
  ]);

  const upcomingInterviews = interviews
    .slice()
    .sort((a, b) => {
      const aTime = a.scheduleTime ? new Date(a.scheduleTime).getTime() : Infinity;
      const bTime = b.scheduleTime ? new Date(b.scheduleTime).getTime() : Infinity;
      return aTime - bTime;
    })
    .slice(0, 5);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Candidate portal</h1>
        <p className="text-sm text-foreground/70">
          Track your applications, manage CV versions, and stay informed about interviews. Data loads
          directly from the Application, Job, and Interview services through the gateway.
        </p>
      </header>

      <section className="rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent applications</h2>
            <p className="text-sm text-foreground/60">
              Applications returned from `/api/applications/my`, enriched with public job data.
            </p>
          </div>
          <Link href={ROUTES.jobs} className="text-sm font-semibold text-foreground hover:underline">
            Browse jobs
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="mt-6 rounded-xl border border-foreground/10 bg-background/60 px-4 py-6 text-sm text-foreground/60">
            You haven&apos;t applied to any jobs yet. Explore open roles and submit your first application.
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            {applications.map((application) => (
              <Link
                key={application.id}
                href={`${ROUTES.candidateApplications}/${application.id}`}
                className="flex items-center justify-between rounded-xl border border-foreground/10 px-4 py-3 transition hover:border-foreground/30 hover:bg-background/80"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{application.jobTitle}</p>
                  <p className="text-xs text-foreground/50">
                    {application.jobLocation ?? "Location flexible"} -{" "}
                    {application.jobWorkType ?? "Work type flexible"}
                  </p>
                  <p className="text-xs text-foreground/50">
                    Applied {formatDate(application.appliedAt)}
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
        <h2 className="text-lg font-semibold text-foreground">Upcoming interviews</h2>
        <p className="text-sm text-foreground/60">
          Pulled from `/api/interviews/my`. Once connected to Notification Service, this section reflects
          scheduling changes automatically.
        </p>

        {upcomingInterviews.length === 0 ? (
          <div className="mt-6 rounded-xl border border-foreground/10 bg-background/60 px-4 py-6 text-sm text-foreground/60">
            No upcoming interviews yet. You&apos;ll see confirmed sessions here after recruiters schedule
            them.
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            {upcomingInterviews.map((interview) => (
              <div key={interview.id} className="rounded-xl border border-foreground/10 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
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
      </section>
    </div>
  );
}
