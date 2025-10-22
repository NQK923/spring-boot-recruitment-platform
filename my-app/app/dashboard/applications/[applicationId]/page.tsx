import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { StatusUpdateForm } from "@/components/applications/status-update-form";
import { AddNoteForm } from "@/components/applications/add-note-form";
import { dateFormatter, dateTimeFormatter } from "@/lib/dates";

type ApplicationDetails = {
  id: number;
  jobPostingId: number;
  candidateId?: number;
  candidateName?: string;
  status: string;
  cvId?: number;
  appliedAt?: string;
  ownerUserId?: number;
};

type ApplicationNote = {
  id: number;
  content: string;
  authorUserId: number;
  createdAt?: string;
};

type JobSummary = {
  id: number;
  title?: string;
  description?: string;
};

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
    return data && typeof data === "object" ? (data as JobSummary) : null;
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

function formatDate(value?: string) {
  if (!value) {
    return "Unknown";
  }
  try {
    return dateTimeFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

export default async function ApplicationDetailsPage({
  params,
}: {
  params: { applicationId: string };
}) {
  const application = await getApplication(params.applicationId);
  if (!application) {
    notFound();
  }

  const [job, notes] = await Promise.all([
    getJobSummary(application.jobPostingId),
    getApplicationNotes(params.applicationId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
      <Link
        href={ROUTES.recruiterDashboard}
        className="text-sm font-semibold text-foreground/70 hover:text-foreground"
      >
        ← Back to dashboard
      </Link>

      <header className="space-y-2">
        <span className="inline-flex items-center rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground">
          {formatStatus(application.status)}
        </span>
        <h1 className="text-3xl font-semibold text-foreground">
          {job?.title ?? `Application #${application.id}`}
        </h1>
        <p className="text-sm text-foreground/60">
          Candidate: {application.candidateName ?? `#${application.candidateId ?? "unknown"}`} · Job #
          {application.jobPostingId}
        </p>
        <p className="text-xs text-foreground/50">
          Applied {formatDate(application.appliedAt)}
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2 space-y-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Job information</h2>
            <p className="whitespace-pre-wrap text-sm text-foreground/70">
              {job?.description ??
                "Job details are not available. The listing may have been archived or removed from the Job Service."}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Status</h3>
              <p className="text-sm text-foreground/70">
                Update the pipeline stage after reviewing candidate progress.
              </p>
              <div className="mt-3">
                <StatusUpdateForm
                  applicationId={application.id}
                  currentStatus={application.status}
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
                          Author #{note.authorUserId} ·{" "}
                          {note.createdAt ? dateTimeFormatter.format(new Date(note.createdAt)) : "Unknown"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="space-y-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Candidate metadata</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground/60">Candidate ID</dt>
              <dd className="font-semibold text-foreground">{application.candidateId ?? "N/A"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/60">CV reference</dt>
              <dd className="font-semibold text-foreground">{application.cvId ?? "N/A"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/60">Owner</dt>
              <dd className="font-semibold text-foreground">
                {application.ownerUserId ?? "Unassigned"}
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </div>
  );
}
