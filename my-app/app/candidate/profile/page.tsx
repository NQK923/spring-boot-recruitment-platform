import { apiFetch } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { UpdateProfileForm } from "@/components/profile/update-profile-form";
import { UploadCvForm } from "@/components/profile/upload-cv-form";
import { GenerateCvForm } from "@/components/profile/generate-cv-form";
import { ExperiencesForm } from "@/components/profile/experience-form";
import { EducationForm } from "@/components/profile/education-form";
import { SkillsForm } from "@/components/profile/skills-form";

async function getProfile(): Promise<Profile | null> {
  try {
    const response = await apiFetch("/api/profiles/me", { method: "GET" });
    if (response.status === 404) {
      return null;
    }
    const data = await response.json();
    return data && typeof data === "object" ? (data as Profile) : null;
  } catch {
    return null;
  }
}

function formatDate(value: string | null | undefined, fallback: string) {
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

export default async function CandidateProfilePage() {
  const profile =
    (await getProfile()) ?? {
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

  const experiences = profile.experiences
    .slice()
    .sort((a, b) => {
      const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bTime - aTime;
    });

  const education = profile.education
    .slice()
    .sort((a, b) => {
      const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bTime - aTime;
    });

  const skills = profile.skills
    .slice()
    .sort((a, b) => {
      const nameA = (a.skillName || "").toLowerCase();
      const nameB = (b.skillName || "").toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

  const cvs = profile.cvs
    .slice()
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-text/50">Candidate</p>
        <h1 className="text-3xl font-semibold text-text">Profile settings</h1>
        <p className="text-sm text-muted">
          Information saved here powers recruiter dashboards, application cards, and interview briefs.
        </p>
      </header>

      <section className="space-y-6 rounded-2xl border border-border bg-bg/70 p-8 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-text">Personal details</h2>
          <p className="text-sm text-muted">
            Update your basic profile attributes. These values populate recruiter-facing summaries.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <AvatarUploader avatarUrl={profile.avatarUrl} fullName={profile.fullName} />
          <p className="text-xs text-text/50 md:max-w-sm">
            This photo appears on your candidate dashboard and any recruiter-facing application cards.
          </p>
        </div>
        <UpdateProfileForm
          fullName={profile.fullName}
          phoneNumber={profile.phoneNumber}
          summary={profile.summary}
        />
      </section>

      <section className="space-y-6 rounded-2xl border border-border bg-bg/70 p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-text">CV management</h2>
          <p className="text-sm text-muted">
            Upload polished CVs or generate lightweight placeholders to tailor submissions for each role.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <UploadCvForm />
          <GenerateCvForm />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text">Existing versions</h3>
          {cvs.length === 0 ? (
            <p className="rounded-xl border border-border bg-bg/60 px-4 py-4 text-sm text-muted">
              No CVs uploaded yet. Add one above to attach it to future applications.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              {cvs.map((cv) => {
                  const downloadHref =
                    cv.downloadUrl ?? (cv.fileId ? `/api/files/${cv.fileId}` : null);

                return (
                  <div
                    key={cv.id}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-bg/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-text">{cv.versionName}</p>
                      <p className="text-xs text-text/50">
                        Added {formatDate(cv.createdAt, "Unknown date")} {cv.isDefault ? "(default)" : ""}
                      </p>
                    </div>
                    {downloadHref ? (
                      <a
                        href={downloadHref}
                        className="text-xs font-semibold text-text hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-xs text-text/50">
                        Generated placeholder - upload an updated version when ready.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-border bg-bg/70 p-8 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-text">Experience</h2>
          <p className="text-sm text-muted">
            Chronicle the roles that shaped your journey. Add new entries or update existing ones whenever your
            story evolves.
          </p>
        </div>
        <ExperiencesForm experiences={experiences} />
      </section>

      <section className="space-y-6 rounded-2xl border border-border bg-bg/70 p-8 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-text">Education</h2>
          <p className="text-sm text-muted">
            Keep your academic background current so recruiters understand your foundation and specialties.
          </p>
        </div>
        <EducationForm education={education} />
      </section>

      <section className="space-y-6 rounded-2xl border border-border bg-bg/70 p-8 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-text">Skills</h2>
          <p className="text-sm text-muted">
            Spotlight the skills you rely on most. Add hard and soft skills to help recruiters match you quickly.
          </p>
        </div>
        <SkillsForm skills={skills} />
      </section>
    </div>
  );
}
