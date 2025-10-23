import { apiFetch } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { UpdateProfileForm } from "@/components/profile/update-profile-form";
import { UploadCvForm } from "@/components/profile/upload-cv-form";
import { GenerateCvForm } from "@/components/profile/generate-cv-form";

async function getProfile(): Promise<Profile | null> {
  try {
    const response = await apiFetch("/api/profiles/me", { method: "GET" });
    if (response.status === 404) {
      return null;
    }
    const data = await response.json();
    return (data && typeof data === "object") ? (data as Profile) : null;
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
        <p className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Candidate</p>
        <h1 className="text-3xl font-semibold text-foreground">Profile settings</h1>
        <p className="text-sm text-foreground/60">
          Information saved here syncs with the User Profile Service and feeds recruiter dashboards,
          application cards, and interview briefs.
        </p>
      </header>

      <section className="space-y-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Personal details</h2>
          <p className="text-sm text-foreground/60">
            Update your basic profile attributes. These values populate recruiter-facing summaries.
          </p>
        </div>
        <UpdateProfileForm
          fullName={profile.fullName}
          phoneNumber={profile.phoneNumber}
          summary={profile.summary}
        />
      </section>

      <section className="space-y-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">CV management</h2>
          <p className="text-sm text-foreground/60">
            Upload polished CVs or generate lightweight placeholders directly through the User Profile Service.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <UploadCvForm />
          <GenerateCvForm />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Existing versions</h3>
          {cvs.length === 0 ? (
            <p className="rounded-xl border border-foreground/10 bg-background/60 px-4 py-4 text-sm text-foreground/60">
              No CVs uploaded yet. Add one above to attach it to future applications.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              {cvs.map((cv) => (
                <div
                  key={cv.id}
                  className="flex flex-col gap-2 rounded-xl border border-foreground/10 bg-background/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-foreground">{cv.versionName}</p>
                    <p className="text-xs text-foreground/50">
                      Added {formatDate(cv.createdAt, "Unknown date")}{" "}
                      {cv.isDefault ? "(default)" : ""}
                    </p>
                  </div>
                  {cv.fileId ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/files/${cv.fileId}`}
                      className="text-xs font-semibold text-foreground hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-foreground/50">
                      Generated placeholder - upload an updated version when ready.
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Experience</h2>
          <p className="text-sm text-foreground/60">
            Experiences currently sync from the Profile Service. Editing will be available in a future release.
          </p>
        </div>
        {experiences.length === 0 ? (
          <p className="rounded-xl border border-foreground/10 bg-background/60 px-4 py-4 text-sm text-foreground/60">
            No experiences stored yet. Share updates with your recruiter to keep records aligned.
          </p>
        ) : (
          <div className="space-y-3 text-sm">
            {experiences.map((experience) => (
              <div key={experience.id} className="rounded-xl border border-foreground/10 px-4 py-3">
                <p className="font-semibold text-foreground">{experience.title || "Role title"}</p>
                <p className="text-xs text-foreground/50">
                  {experience.companyName || "Company"} (
                  {formatDate(experience.startDate, "Unknown")} -{" "}
                  {formatDate(experience.endDate, "Present")})
                </p>
                {experience.description ? (
                  <p className="mt-2 text-foreground/70">{experience.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Education</h2>
          <p className="text-sm text-foreground/60">
            Education history mirrors the data in the Profile Service. Editing support is on the roadmap.
          </p>
        </div>
        {education.length === 0 ? (
          <p className="rounded-xl border border-foreground/10 bg-background/60 px-4 py-4 text-sm text-foreground/60">
            No education history yet. Add details via your recruiter to populate this section.
          </p>
        ) : (
          <div className="space-y-3 text-sm">
            {education.map((item) => (
              <div key={item.id} className="rounded-xl border border-foreground/10 px-4 py-3">
                <p className="font-semibold text-foreground">{item.school || "Institution"}</p>
                <p className="text-xs text-foreground/50">
                  {item.degree || "Degree"} (
                  {formatDate(item.startDate, "Unknown")} - {formatDate(item.endDate, "Present")})
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Skills</h2>
        {skills.length === 0 ? (
          <p className="rounded-xl border border-foreground/10 bg-background/60 px-4 py-4 text-sm text-foreground/60">
            No skills saved yet. Share an updated list with your recruiter to reflect them here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 text-sm">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-full border border-foreground/10 px-3 py-1 text-xs font-semibold text-foreground/70"
              >
                {skill.skillName || "Skill"}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
