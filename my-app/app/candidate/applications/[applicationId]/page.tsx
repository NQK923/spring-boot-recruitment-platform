import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { dateFormatter, dateTimeFormatter } from "@/lib/dates";
import type { ApplicationDetails, Interview, JobPostingPublic } from "@/lib/types";

async function getApplication(applicationId: string): Promise<ApplicationDetails | null> {
  try {
    const response = await apiFetch(`/api/applications/${applicationId}`, { method: "GET" });
    if (response.status === 404) {
      return null;
    }
    const data = await response.json();
    return data && typeof data === "object" ? (data as ApplicationDetails) : null;
  } catch {
    return null;
  }
}

async function getJobSummary(jobId: number): Promise<JobPostingPublic | null> {
  try {
    const response = await apiFetch(`/api/jobs/public/${jobId}`, {
      method: "GET",
      skipAuthHeaders: true,
    });
    if (response.status === 404) {
      return null;
    }
    const data = await response.json();
    return data && typeof data === "object" ? (data as JobPostingPublic) : null;
  } catch {
    return null;
  }
}

async function getInterviewsForApplication(applicationId: number): Promise<Interview[]> {
  try {
    const response = await apiFetch("/api/interviews/my", { method: "GET" });
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return (data as Interview[]).filter((interview) => interview.applicationId === applicationId);
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

function formatDate(value: string | null | undefined, includeTime = false) {
  if (!value) {
    return "Unknown";
  }
  try {
    const date = new Date(value);
    return includeTime ? dateTimeFormatter.format(date) : dateFormatter.format(date);
  } catch {
    return value;
  }
}

export default async function CandidateApplicationDetailsPage({
  params,
}: {
  params: { applicationId: string };
}) {
  const application = await getApplication(params.applicationId);
  if (!application) {
    notFound();
  }

  const [job, interviews] = await Promise.all([
    getJobSummary(application.jobPostingId),
    getInterviewsForApplication(application.id),
  ]);

  const nextInterview = interviews
    .slice()
    .sort((a, b) => {
      const aTime = a.scheduleTime ? new Date(a.scheduleTime).getTime() : Infinity;
      const bTime = b.scheduleTime ? new Date(b.scheduleTime).getTime() : Infinity;
      return aTime - bTime;
    })[0];

  const calendarHref = nextInterview ? `/api/interviews/${nextInterview.id}/calendar` : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <Link
        href={ROUTES.candidatePortal}
        className="text-sm font-semibold text-foreground/70 hover:text-foreground"
      >
        Back to applications
      </Link>

      <header className="space-y-2">
        <span className="inline-flex items-center rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground">
          {formatStatus(application.status)}
        </span>
        <h1 className="text-3xl font-semibold text-foreground">
          {job?.title ?? `Application #${application.id}`}
        </h1>
        <p className="text-sm text-foreground/60">
          Job #{application.jobPostingId} - Applied {formatDate(application.appliedAt, true)}
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Job overview</h2>
        <p className="whitespace-pre-wrap text-sm text-foreground/70">
          {job?.description ??
            "Detailed description will appear here once the Job Service provides it. This includes responsibilities, qualifications, and benefits."}
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Application info</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-foreground/60">Status</dt>
            <dd className="font-semibold text-foreground">{formatStatus(application.status)}</dd>
          </div>
          <div>
            <dt className="text-foreground/60">Applied on</dt>
            <dd className="font-semibold text-foreground">{formatDate(application.appliedAt, true)}</dd>
          </div>
          <div>
            <dt className="text-foreground/60">CV reference</dt>
            <dd className="font-semibold text-foreground">{application.cvId ?? "N/A"}</dd>
          </div>
          <div>
            <dt className="text-foreground/60">Source</dt>
            <dd className="font-semibold text-foreground">{application.source ?? "N/A"}</dd>
          </div>
          <div>
            <dt className="text-foreground/60">Owner</dt>
            <dd className="font-semibold text-foreground">{application.ownerUserId ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-foreground/60">Candidate name</dt>
            <dd className="font-semibold text-foreground">
              {application.candidateName ?? `Candidate #${application.candidateId}`}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Interviews</h2>
        {interviews.length === 0 ? (
          <p className="text-sm text-foreground/60">
            No interviews scheduled yet. You will receive an email when a recruiter sets one up.
          </p>
        ) : (
          <div className="space-y-3 text-sm">
            {interviews.map((interview) => (
              <div key={interview.id} className="rounded-xl border border-foreground/10 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {formatDate(interview.scheduleTime, true)}
                  </span>
                  <span className="text-xs text-foreground/60">{interview.format ?? "Format TBD"}</span>
                </div>
                <p className="text-xs text-foreground/50">
                  {interview.locationOrLink ? interview.locationOrLink : "Location or link will be shared"}
                </p>
                {interview.outcome ? (
                  <p className="mt-1 text-xs text-foreground/50">Outcome: {interview.outcome}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
        {calendarHref ? (
          <Link href={calendarHref} className="text-sm font-semibold text-foreground hover:underline">
            Download interview calendar (.ics)
          </Link>
        ) : null}
      </section>
    </div>
  );
}
