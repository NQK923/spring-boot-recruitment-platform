import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { StatusUpdateForm } from "@/components/applications/status-update-form";
import { AddNoteForm } from "@/components/applications/add-note-form";
import { dateFormatter, dateTimeFormatter } from "@/lib/dates";
import type {
  ApplicationDetails,
  ApplicationNote,
  ApplicationStatus,
  JobPostingPublic,
  Profile,
} from "@/lib/types";

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

async function getApplicationNotes(applicationId: string): Promise<ApplicationNote[]> {
  try {
    const response = await apiFetch(`/api/applications/${applicationId}/notes`, { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as ApplicationNote[]) : [];
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

async function getCandidateProfile(candidateId: number | null | undefined): Promise<Profile | null> {
  if (!candidateId) {
    return null;
  }

  try {
    const response = await apiFetch(`/api/profiles/candidates/${candidateId}/profile`, {
      method: "GET",
    });
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

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Unknown";
  }
  try {
    return dateTimeFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function formatProfileDate(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

type ApplicationDetailsPageProps = {
  params: Promise<{ applicationId: string }> | { applicationId: string };
};

export default async function ApplicationDetailsPage({
  params,
}: ApplicationDetailsPageProps) {
  const { applicationId } = await Promise.resolve(params);
  const application = await getApplication(applicationId);
  if (!application) {
    notFound();
  }

  const [job, notes, profile] = await Promise.all([
    getJobSummary(application.jobPostingId),
    getApplicationNotes(applicationId),
    getCandidateProfile(application.candidateId),
  ]);

  const sortedExperiences = profile?.experiences
    ? profile.experiences
        .slice()
        .sort((a, b) => {
          const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
          const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
          return bTime - aTime;
        })
    : [];
  const latestExperience = sortedExperiences[0] ?? null;
  const primarySkills = profile?.skills?.slice(0, 5) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <Link
        href={ROUTES.recruiterDashboard}
        className="text-sm font-semibold text-foreground/70 hover:text-foreground"
      >
        Back to dashboard
      </Link>

      <header className="space-y-2">
        <span className="inline-flex items-center rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground">
          {formatStatus(application.status)}
        </span>
        <h1 className="text-3xl font-semibold text-foreground">
          {job?.title ?? `Application #${application.id}`}
        </h1>
        <p className="text-sm text-foreground/60">
          Candidate: {application.candidateName ?? `#${application.candidateId}`} - Job #
          {application.jobPostingId}
        </p>
        <p className="text-xs text-foreground/50">Applied {formatDateTime(application.appliedAt)}</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <article className="space-y-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Job information</h2>
            <p className="whitespace-pre-wrap text-sm text-foreground/70">
              {job?.description ??
                "Job details are not available. The listing may have been archived or the hiring team has not published the latest description."}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Status</h3>
            <p className="text-sm text-foreground/70">
              Update the pipeline stage after reviewing candidate progress.
            </p>
            <div className="mt-3">
              <StatusUpdateForm
                applicationId={application.id}
                currentStatus={application.status as ApplicationStatus}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Notes</h3>
            <p className="text-sm text-foreground/70">
              Notes are visible to recruiters and company admins to keep collaboration in sync.
            </p>
            <div className="mt-4 space-y-4">
              <AddNoteForm applicationId={application.id} />
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="rounded-xl border border-foreground/10 bg-background/60 px-4 py-4 text-sm text-foreground/60">
                    No notes yet. Capture interview feedback, context, or follow-up tasks here.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl border border-foreground/10 px-4 py-3 text-sm text-foreground"
                    >
                      <p className="text-foreground/80">{note.content}</p>
                      <p className="mt-2 text-xs text-foreground/50">
                        Author #{note.authorUserId} - {formatDateTime(note.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </article>

        <article className="space-y-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
          <div className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold text-foreground">Candidate metadata</h2>
            <div className="flex justify-between">
              <span className="text-foreground/60">Candidate ID</span>
              <span className="font-semibold text-foreground">
                {application.candidateId ?? "Unknown"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">CV reference</span>
              <span className="font-semibold text-foreground">{application.cvId ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Source</span>
              <span className="font-semibold text-foreground">{application.source ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Owner</span>
              <span className="font-semibold text-foreground">
                {application.ownerUserId ?? "Unassigned"}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="text-sm font-semibold text-foreground">Profile snapshot</h3>
            {profile ? (
              <div className="space-y-3">
                <div>
                  <span className="text-foreground/60">Full name</span>
                  <p className="font-semibold text-foreground">
                    {profile.fullName || `Candidate #${application.candidateId}`}
                  </p>
                </div>
                <div>
                  <span className="text-foreground/60">Phone</span>
                  <p className="font-semibold text-foreground">
                    {profile.phoneNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-foreground/60">Summary</span>
                  <p className="text-foreground/70">
                    {profile.summary || "No summary captured yet."}
                  </p>
                </div>
                {primarySkills.length > 0 ? (
                  <div>
                    <span className="text-foreground/60">Skills</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {primarySkills.map((skill) => (
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
                {latestExperience ? (
                  <div>
                    <span className="text-foreground/60">Latest experience</span>
                    <p className="font-semibold text-foreground">
                      {latestExperience.title || "Role title"}
                    </p>
                    <p className="text-xs text-foreground/50">
                      {latestExperience.companyName || "Company"} (
                      {formatProfileDate(latestExperience.startDate, "Unknown")} -{" "}
                      {formatProfileDate(latestExperience.endDate, "Present")})
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="rounded-xl border border-foreground/10 bg-background/60 px-4 py-4 text-sm text-foreground/60">
                Candidate profile is not available yet. Ask the candidate to complete their profile.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
