import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { dateFormatter, dateTimeFormatter } from "@/lib/dates";
import type { Application, Interview, JobPostingPublic, Profile } from "@/lib/types";

type EnrichedApplication = Application & {
  jobTitle: string;
  jobDescription: string | null;
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

async function enrichApplications(applications: Application[]): Promise<EnrichedApplication[]> {
  const jobIds = Array.from(new Set(applications.map((app) => app.jobPostingId)));
  const jobMap = new Map<number, JobPostingPublic>();

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
      jobDescription: job?.description ?? null,
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

async function getProfile(): Promise<Profile | null> {
  try {
    const response = await apiFetch("/api/profiles/me", { method: "GET" });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data && typeof data === "object" ? (data as Profile) : null;
  } catch {
    return null;
  }
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "recently";
  }
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function formatDateTime(value: string | null | undefined, timezone?: string | null) {
  if (!value) {
    return "Scheduled soon";
  }
  try {
    const date = new Date(value);
    if (timezone) {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: timezone,
      }).format(date);
    }
    return dateTimeFormatter.format(date);
  } catch {
    return value;
  }
}

function formatProfileDate(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function CandidatePortalPage() {
  const [applications, interviews, profile] = await Promise.all([
    getApplications().then(enrichApplications),
    getInterviews(),
    getProfile(),
  ]);

  const upcomingInterviews = interviews
    .slice()
    .sort((a, b) => {
      const aTime = a.scheduleTime ? new Date(a.scheduleTime).getTime() : Infinity;
      const bTime = b.scheduleTime ? new Date(b.scheduleTime).getTime() : Infinity;
      return aTime - bTime;
    })
    .slice(0, 5);

  const sortedExperiences = profile?.experiences
    ? profile.experiences
        .slice()
        .sort((a, b) => {
          const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
          const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
          return bTime - aTime;
        })
    : [];

  const sortedEducation = profile?.education
    ? profile.education
        .slice()
        .sort((a, b) => {
          const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
          const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
          return bTime - aTime;
        })
    : [];

  const displaySkills = profile?.skills
    ? profile.skills.slice().sort((a, b) => {
        const nameA = (a.skillName || "").toLowerCase();
        const nameB = (b.skillName || "").toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      })
    : [];

  const nextInterview = upcomingInterviews[0] ?? null;
  const cvs = profile?.cvs ?? [];
  const sortedCvs = cvs
    .slice()
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });

  return (
    <Container className="max-w-5xl space-y-10">
      <Panel variant="glass" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
              Candidate workspace
            </span>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Keep your applications and interviews on track.
            </h1>
            <p className="max-w-2xl text-sm text-foreground/70">
              Track your applications, manage CV versions, and stay informed about interviews—all from one
              streamlined workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.jobs}>
              <Button size="sm" variant="secondary">
                Browse roles
              </Button>
            </Link>
            <Link href={ROUTES.candidateProfile}>
              <Button size="sm">Manage profile</Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-foreground/10 bg-surface/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
              Applications
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{applications.length}</p>
            <p className="text-xs text-foreground/60">Active submissions across companies</p>
          </div>
          <div className="rounded-2xl border border-foreground/10 bg-surface/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">CV versions</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{cvs.length}</p>
            <p className="text-xs text-foreground/60">Tailored resumes ready to attach</p>
          </div>
          <div className="rounded-2xl border border-foreground/10 bg-surface/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Interviews</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{upcomingInterviews.length}</p>
            <p className="text-xs text-foreground/60">Scheduled conversations ahead</p>
          </div>
        </div>
        {nextInterview ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-accent/20 bg-accent/10 px-5 py-4 text-sm text-accent sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em]">Next interview</p>
              <p className="mt-1 font-semibold text-foreground">
                Application #{nextInterview.applicationId}
              </p>
              <p className="text-xs text-foreground/60">
                {formatDateTime(nextInterview.scheduleTime, nextInterview.timezone)}
                {" - "}
                {nextInterview.format ?? "Format TBD"}
              </p>
            </div>
            <p className="text-xs text-foreground/60">
              {nextInterview.locationOrLink
                ? nextInterview.locationOrLink
                : "We will share the location or link soon."}
            </p>
          </div>
        ) : null}
      </Panel>

      <Panel variant="surface" padding="lg" className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Profile snapshot</h2>
          <p className="text-sm text-foreground/60">
            Keep this information current so recruiters have the latest context when reviewing your application.
          </p>
        </div>

        {profile ? (
          <div className="space-y-6 text-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Full name</p>
                <p className="mt-1 font-semibold text-foreground">
                  {profile.fullName || "Add your name"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Candidate ID</p>
                <p className="mt-1 font-semibold text-foreground">
                  {profile.userId ? `Candidate #${profile.userId}` : "Provided at sign-in"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Phone</p>
                <p className="mt-1 font-semibold text-foreground">
                  {profile.phoneNumber || "Add a contact number"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Summary</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/70">
                {profile.summary || "Keep recruiters informed by summarizing your background and goals."}
              </p>
            </div>

            {displaySkills.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {displaySkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full border border-foreground/10 px-3 py-1 text-xs font-medium text-foreground/70"
                    >
                      {skill.skillName || "Skill"}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {sortedExperiences.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Experience</p>
                <div className="space-y-3">
                  {sortedExperiences.map((experience) => (
                    <div
                      key={experience.id}
                      className="rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">
                            {experience.title || "Role title"}
                          </p>
                          <p className="text-xs text-foreground/50">
                            {experience.companyName || "Company"}
                          </p>
                        </div>
                        <p className="text-xs text-foreground/50">
                          {formatProfileDate(experience.startDate, "Unknown")}
                          {" - "}
                          {formatProfileDate(experience.endDate, "Present")}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-foreground/60">
                        {experience.description || "Add responsibilities or notable achievements."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {sortedEducation.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Education</p>
                <div className="space-y-3">
                  {sortedEducation.map((education) => (
                    <div
                      key={education.id}
                      className="rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">
                            {education.school || "Institution"}
                          </p>
                          <p className="text-xs text-foreground/50">
                            {education.degree || "Degree"}
                          </p>
                        </div>
                        <p className="text-xs text-foreground/50">
                          {formatProfileDate(education.startDate, "Start")}
                          {" - "}
                          {formatProfileDate(education.endDate, "Present")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-5 py-6 text-sm text-foreground/60">
            Complete your profile to help recruiters understand your experience and preferences.
          </div>
        )}
      </Panel>

      <Panel variant="surface" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent applications</h2>
            <p className="text-sm text-foreground/60">
              A snapshot of your latest submissions with quick links to view details and next steps.
            </p>
          </div>
          <Link href={ROUTES.jobs} className="text-sm font-semibold text-foreground hover:underline">
            Browse jobs
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-5 py-6 text-sm text-foreground/60">
            You haven&apos;t applied to any jobs yet. Explore open roles and submit your first application.
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {applications.map((application) => (
              <Link
                key={application.id}
                href={`${ROUTES.candidateApplications}/${application.id}`}
                className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 transition hover:border-foreground/30 hover:bg-surface"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{application.jobTitle}</p>
                  <p className="text-xs text-foreground/50 line-clamp-2">
                    {application.jobDescription ??
                      "Job description will appear once provided by the company."}
                  </p>
                  <p className="text-xs text-foreground/50">Applied {formatDate(application.appliedAt)}</p>
                  {application.source ? (
                    <p className="text-xs text-foreground/50">Source: {application.source}</p>
                  ) : null}
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  {formatStatus(application.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Panel>

      <Panel variant="surface" padding="lg" className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">CV versions</h2>
          <p className="text-sm text-foreground/60">
            The list below is returned from the profile service. Upload or generate new versions to tailor your
            applications.
          </p>
        </div>

        {sortedCvs.length > 0 ? (
          <div className="space-y-3 text-sm">
            {sortedCvs.map((cv) => (
              <div
                key={cv.id}
                className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{cv.versionName}</p>
                    <p className="text-xs text-foreground/50">
                      Added {formatDate(cv.createdAt)}
                      {cv.isDefault ? " (Default)" : ""}
                    </p>
                  </div>
                  {cv.fileId ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/files/${cv.fileId}`}
                      className="text-xs font-semibold text-foreground hover:underline"
                    >
                      Download
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-5 py-6 text-sm text-foreground/60">
            No CV versions yet. Upload your first version to attach it to applications.
          </div>
        )}
      </Panel>

      <Panel variant="surface" padding="lg" className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Upcoming interviews</h2>
          <p className="text-sm text-foreground/60">
            This list updates automatically when recruiters confirm, reschedule, or cancel an interview slot.
          </p>
        </div>

        {upcomingInterviews.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-5 py-6 text-sm text-foreground/60">
            No upcoming interviews yet. You&apos;ll see confirmed sessions here after recruiters schedule them.
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {upcomingInterviews.map((interview) => (
              <div
                key={interview.id}
                className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
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
    </Container>
  );
}
