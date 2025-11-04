import Link from "next/link";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
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

type NextStep = {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
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

  const profileData: Profile =
    profile ?? {
      userId: 0,
      fullName: null,
      avatarUrl: null,
      phoneNumber: null,
      summary: null,
      experiences: [],
      education: [],
      skills: [],
      cvs: [],
    };

  const upcomingInterviews = interviews
    .slice()
    .sort((a, b) => {
      const aTime = a.scheduleTime ? new Date(a.scheduleTime).getTime() : Infinity;
      const bTime = b.scheduleTime ? new Date(b.scheduleTime).getTime() : Infinity;
      return aTime - bTime;
    })
    .slice(0, 5);

  const sortedExperiences = profileData.experiences
    .slice()
    .sort((a, b) => {
      const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bTime - aTime;
    });

  const sortedEducation = profileData.education
    .slice()
    .sort((a, b) => {
      const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bTime - aTime;
    });

  const displaySkills = profileData.skills
    .slice()
    .sort((a, b) => {
      const nameA = (a.skillName || "").toLowerCase();
      const nameB = (b.skillName || "").toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

  const sortedCvs = profileData.cvs
    .slice()
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  const sortedApplications = applications
    .slice()
    .sort((a, b) => {
      const aTime = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
      const bTime = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
      return bTime - aTime;
    });

  const recentApplications = sortedApplications.slice(0, 5);

  const activeApplications = sortedApplications.filter(
    (application) => !["REJECTED", "WITHDRAWN"].includes(application.status)
  );

  const nextInterview = upcomingInterviews[0] ?? null;

  const completionChecks = [
    Boolean(profileData.fullName),
    Boolean(profileData.summary),
    Boolean(profileData.phoneNumber),
    sortedExperiences.length > 0,
    sortedEducation.length > 0,
    displaySkills.length > 0,
    sortedCvs.length > 0,
  ];

  const profileCompletion = completionChecks.length
    ? Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100)
    : 0;

  const defaultCv = sortedCvs.find((cv) => cv.isDefault) ?? sortedCvs[0] ?? null;
  const lastAppliedAt = sortedApplications[0]?.appliedAt ?? null;

  const profileCompletionLabel =
    profileCompletion >= 100
      ? "Profile is ready to share with recruiters"
      : `You're ${Math.max(0, 100 - profileCompletion)}% away from a complete profile.`;

  const nextSteps: NextStep[] = [];
  const addNextStep = (step: NextStep) => {
    if (!nextSteps.some((existing) => existing.title === step.title)) {
      nextSteps.push(step);
    }
  };

  if (!profileData.summary) {
    addNextStep({
      title: "Add a short profile summary",
      description: "Summaries help recruiters understand your focus and open the conversation faster.",
      href: ROUTES.candidateProfile,
      actionLabel: "Update profile",
    });
  }

  if (!sortedCvs.length) {
    addNextStep({
      title: "Upload your first CV",
      description: "Keep a polished resume on file so you can attach it to applications with one click.",
      href: ROUTES.candidateProfile,
      actionLabel: "Open CV manager",
    });
  }

  if (!applications.length) {
    addNextStep({
      title: "Discover open roles",
      description: "Browse job listings tailored to your interests and submit your first application.",
      href: ROUTES.jobs,
      actionLabel: "Find jobs",
    });
  }

  if (profileCompletion < 80) {
    addNextStep({
      title: "Complete your profile",
      description: "Add experience, education, and skills to highlight your strengths to recruiters.",
      href: ROUTES.candidateProfile,
      actionLabel: "Fill in details",
    });
  }

  if (nextInterview) {
    addNextStep({
      title: "Prepare for your next interview",
      description: `Review the plan and join details for application #${nextInterview.applicationId}.`,
      href: `${ROUTES.candidateApplications}/${nextInterview.applicationId}`,
      actionLabel: "Review interview",
    });
  }

  const prioritizedNextSteps = nextSteps.slice(0, 4);

  return (
    <Container className="space-y-10 py-10">
      <Panel variant="surface" padding="lg" className="overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-accent/10 via-transparent to-transparent"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-foreground/50">Welcome back</p>
            <h1 className="text-3xl font-semibold text-foreground">
              {profileData.fullName
                ? `${profileData.fullName}, keep building your momentum`
                : "Ready for your next opportunity?"}
            </h1>
            <p className="text-sm text-foreground/70">
              {profileData.summary ??
                "Share a quick summary so hiring teams can understand your focus and experience at a glance."}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button asChild size="sm">
                <Link href={ROUTES.candidateProfile}>Update profile</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href={`${ROUTES.candidateProfile}#cvs`}>Manage CVs</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href={ROUTES.jobs}>Browse roles</Link>
              </Button>
            </div>
          </div>
          <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl border border-border/60 bg-surface/60 p-4 text-center backdrop-blur md:w-auto">
            <AvatarUploader avatarUrl={profileData.avatarUrl} fullName={profileData.fullName} />
            <p className="text-xs text-foreground/60">
              A refreshed photo gives hiring managers more confidence in your application.
            </p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-foreground/10 bg-surface/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-foreground/60">Active applications</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{activeApplications.length}</p>
          <p className="text-xs text-foreground/60">
            {lastAppliedAt
              ? `Last updated ${formatDate(lastAppliedAt)}`
              : "Submit your first application to get started."}
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-surface/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-foreground/60">Profile completion</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{profileCompletion}%</p>
          <p className="text-xs text-foreground/60">{profileCompletionLabel}</p>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-surface/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-foreground/60">CV library</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{sortedCvs.length}</p>
          <p className="text-xs text-foreground/60">
            {defaultCv ? `Default: ${defaultCv.versionName}` : "Upload a tailored CV to keep it handy."}
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-surface/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-foreground/60">Next interview</p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {nextInterview ? formatDateTime(nextInterview.scheduleTime, nextInterview.timezone) : "Not scheduled"}
          </p>
          <p className="text-xs text-foreground/60">
            {nextInterview
              ? `Application #${nextInterview.applicationId} - ${nextInterview.format ?? "Format TBD"}`
              : "You'll see upcoming interviews here as soon as they are confirmed."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel variant="surface" padding="lg" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent applications</h2>
              <p className="text-sm text-foreground/60">Stay on top of where you are in each process.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={ROUTES.candidateApplications}>View all</Link>
            </Button>
          </div>
          {recentApplications.length ? (
            <div className="space-y-3 text-sm">
              {recentApplications.map((application) => (
                <Link
                  key={application.id}
                  href={`${ROUTES.candidateApplications}/${application.id}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-surface/95 p-5 transition hover:border-foreground/30 hover:bg-surface"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-foreground group-hover:text-accent">
                        {application.jobTitle}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-foreground/60">
                        <span>Applied {formatDate(application.appliedAt)}</span>
                        {application.source ? <span>Source: {application.source}</span> : null}
                      </div>
                    </div>
                    <span className="self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                      {formatStatus(application.status)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60 line-clamp-2">
                    {application.jobDescription ??
                      "We’ll surface the job description as soon as the company publishes it."}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-foreground/20 bg-surface/80 px-6 py-10 text-sm text-foreground/60">
              You haven&apos;t applied to any roles yet. Explore open positions and submit your first application.
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel variant="surface" padding="lg" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Next steps</h2>
              <p className="text-sm text-foreground/60">
                Personalized suggestions to keep your search moving in the right direction.
              </p>
            </div>
            {prioritizedNextSteps.length ? (
              <ul className="space-y-4 text-sm">
                {prioritizedNextSteps.map((step) => (
                  <li
                    key={step.title}
                    className="rounded-2xl border border-dashed border-foreground/20 bg-surface/90 p-4"
                  >
                    <p className="font-semibold text-foreground">{step.title}</p>
                    <p className="mt-1 text-xs text-foreground/60">{step.description}</p>
                    {step.href ? (
                      <Link
                        href={step.href}
                        className="mt-3 inline-flex text-xs font-semibold text-accent hover:underline"
                      >
                        {step.actionLabel ?? "Open"}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-foreground/10 bg-surface/90 px-4 py-6 text-sm text-foreground/60">
                You&apos;re all set for now. We&apos;ll flag new suggestions here as soon as something changes.
              </div>
            )}
          </Panel>

          <Panel variant="surface" padding="lg" className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">CV library</h2>
                <p className="text-sm text-foreground/60">
                  Keep polished versions on file so you can attach the right resume to each application.
                </p>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href={`${ROUTES.candidateProfile}#cvs`}>Manage</Link>
              </Button>
            </div>
            {sortedCvs.length ? (
              <div className="space-y-3 text-sm">
                {sortedCvs.slice(0, 5).map((cv) => {
                  const downloadHref =
                    cv.downloadUrl ??
                    (cv.fileId
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/files/${cv.fileId}`
                      : null);
                  return (
                    <div
                      key={cv.id}
                      className="flex flex-col gap-2 rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {cv.versionName}
                          {cv.isDefault ? " - Default" : ""}
                        </p>
                        <p className="text-xs text-foreground/60">Added {formatDate(cv.createdAt)}</p>
                      </div>
                      {downloadHref ? (
                        <a
                          href={downloadHref}
                          className="text-xs font-semibold text-accent hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-foreground/50">
                          Generated placeholder — upload an updated version when ready.
                        </span>
                      )}
                    </div>
                  );
                })}
                {sortedCvs.length > 5 ? (
                  <p className="text-xs text-foreground/50">
                    Showing the five most recent versions. Visit the manager to view the rest.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-foreground/20 bg-surface/80 px-5 py-8 text-sm text-foreground/60">
                No CVs yet. Upload a tailored resume to pair with your applications.
              </div>
            )}
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel variant="surface" padding="lg" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Upcoming interviews</h2>
              <p className="text-sm text-foreground/60">
                Details sync instantly when recruiters schedule or reschedule sessions.
              </p>
            </div>
            {nextInterview ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`${ROUTES.candidateApplications}/${nextInterview.applicationId}`}>
                  View interview
                </Link>
              </Button>
            ) : null}
          </div>
          {upcomingInterviews.length ? (
            <ol className="space-y-4 text-sm">
              {upcomingInterviews.map((interview) => (
                <li
                  key={interview.id}
                  className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        {formatDateTime(interview.scheduleTime, interview.timezone)}
                      </p>
                      <p className="text-xs text-foreground/60">
                        Application #{interview.applicationId} - {interview.format ?? "Format TBD"}
                      </p>
                    </div>
                    <span className="text-xs text-foreground/50">
                      {interview.locationOrLink ?? "Location or link to be shared"}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded-2xl border border-dashed border-foreground/20 bg-surface/80 px-6 py-10 text-sm text-foreground/60">
              No interviews scheduled yet. We&apos;ll notify you here the moment a recruiter books time.
            </div>
          )}
        </Panel>

        <Panel variant="surface" padding="lg" className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Profile snapshot</h2>
              <p className="text-sm text-foreground/60">
                Quickly confirm the essentials recruiters see before diving into your full profile.
              </p>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href={ROUTES.candidateProfile}>Edit</Link>
            </Button>
          </div>

          <div className="space-y-6 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Full name</p>
                <p className="mt-1 font-semibold text-foreground">
                  {profileData.fullName || "Add your name"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Phone</p>
                <p className="mt-1 font-semibold text-foreground">
                  {profileData.phoneNumber || "Add a contact number"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Experience highlights</p>
              {sortedExperiences.length ? (
                <div className="mt-3 space-y-3">
                  {sortedExperiences.slice(0, 2).map((experience) => (
                    <div
                      key={experience.id}
                      className="rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3"
                    >
                      <p className="font-semibold text-foreground">
                        {experience.title || "Role to be confirmed"}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {experience.companyName || "Company to be confirmed"}
                      </p>
                      <p className="text-xs text-foreground/50">
                        {formatProfileDate(experience.startDate, "Unknown")}
                        {" - "}
                        {formatProfileDate(experience.endDate, "Present")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-foreground/50">Add your recent roles to highlight your impact.</p>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Education</p>
              {sortedEducation.length ? (
                <div className="mt-3 space-y-3">
                  {sortedEducation.slice(0, 2).map((education) => (
                    <div
                      key={education.id}
                      className="rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3"
                    >
                      <p className="font-semibold text-foreground">
                        {education.school || "Institution pending"}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {education.degree || "Program to be confirmed"}
                      </p>
                      <p className="text-xs text-foreground/50">
                        {formatProfileDate(education.startDate, "Start")}
                        {" - "}
                        {formatProfileDate(education.endDate, "Present")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-foreground/50">
                  Document your education to round out your profile.
                </p>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Skills</p>
              {displaySkills.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {displaySkills.slice(0, 8).map((skill) =>
                    skill.skillName ? (
                      <span
                        key={skill.id}
                        className="rounded-full border border-foreground/10 bg-surface/95 px-3 py-1 text-xs text-foreground/70"
                      >
                        {skill.skillName}
                      </span>
                    ) : null
                  )}
                  {displaySkills.length > 8 ? (
                    <span className="text-xs text-foreground/50">+{displaySkills.length - 8} more</span>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-xs text-foreground/50">
                  List your core skills so recruiters can match you faster.
                </p>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </Container>
  );
}
