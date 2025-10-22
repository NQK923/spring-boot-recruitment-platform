import Link from "next/link";
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
    return (data && typeof data === "object") ? (data as JobPostingPublic) : null;
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
    return (data && typeof data === "object") ? (data as Profile) : null;
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
            <h2 className="text-lg font-semibold text-foreground">Profile snapshot</h2>
            <p className="text-sm text-foreground/60">
              Pulled from `/api/profiles/me`. Keep this data current so recruiters have the latest context.
            </p>
          </div>
        </div>

        {profile ? (
          <div className="mt-6 space-y-6 text-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <span className="text-xs uppercase tracking-wide text-foreground/60">Full name</span>
                <p className="mt-1 font-semibold text-foreground">
                  {profile.fullName || "Add your name"}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wide text-foreground/60">Phone number</span>
                <p className="mt-1 font-semibold text-foreground">
                  {profile.phoneNumber || "Add a contact number"}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wide text-foreground/60">Summary</span>
                <p className="mt-1 text-foreground/70">
                  {profile.summary || "Write a short summary so recruiters can understand your goals."}
                </p>
              </div>
            </div>

            {sortedExperiences.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground">Experience</h3>
                <ul className="mt-2 space-y-2">
                  {sortedExperiences.slice(0, 3).map((experience) => (
                    <li key={experience.id} className="rounded-xl border border-foreground/10 px-4 py-3">
                      <p className="font-medium text-foreground">{experience.title || "Role title"}</p>
                      <p className="text-xs text-foreground/50">
                    {experience.companyName || "Company"}{" "}
                    {formatProfileDate(experience.startDate, "Unknown")} -{" "}
                    {formatProfileDate(experience.endDate, "Present")}
                      </p>
                      {experience.description ? (
                        <p className="mt-1 text-xs text-foreground/60">{experience.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {sortedEducation.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground">Education</h3>
                <ul className="mt-2 space-y-2">
                  {sortedEducation.slice(0, 2).map((education) => (
                    <li key={education.id} className="rounded-xl border border-foreground/10 px-4 py-3">
                      <p className="font-medium text-foreground">{education.school || "Institution"}</p>
                      <p className="text-xs text-foreground/50">
                        {education.degree || "Degree"}{" "}
                        {formatProfileDate(education.startDate, "Unknown")} -{" "}
                        {formatProfileDate(education.endDate, "Present")}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {displaySkills.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground">Skills</h3>
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
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-foreground/10 bg-background/60 px-4 py-6 text-sm text-foreground/60">
            Profile not available yet. Complete your details to help recruiters learn more about you.
          </div>
        )}
      </section>

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
                  <p className="text-xs text-foreground/50 line-clamp-2">
                    {application.jobDescription ?? "Job description will appear once provided by the company."}
                  </p>
                  <p className="text-xs text-foreground/50">
                    Applied {formatDate(application.appliedAt)}
                  </p>
                  {application.source ? (
                    <p className="text-xs text-foreground/50">Source: {application.source}</p>
                  ) : null}
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
        <h2 className="text-lg font-semibold text-foreground">CV versions</h2>
        <p className="text-sm text-foreground/60">
          The list below is returned from the profile service. Upload or generate new versions to tailor your
          applications.
        </p>

        {profile?.cvs && profile.cvs.length > 0 ? (
          <div className="mt-4 space-y-3 text-sm">
            {profile.cvs
              .slice()
              .sort((a, b) => {
                const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bDate - aDate;
              })
              .map((cv) => (
                <div
                  key={cv.id}
                  className="rounded-xl border border-foreground/10 px-4 py-3"
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
          <div className="mt-6 rounded-xl border border-foreground/10 bg-background/60 px-4 py-6 text-sm text-foreground/60">
            No CV versions yet. Upload your first version to attach it to applications.
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
