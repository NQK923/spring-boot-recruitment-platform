import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { UpdateCompanyForm } from "@/components/company-admin/update-company-form";
import { InviteMemberForm } from "@/components/company-admin/invite-member-form";
import { CompanyMembersPanel } from "@/components/company-admin/company-members-panel";
import { CreateJobForm } from "@/components/jobs/create-job-form";
import { UpdateJobForm } from "@/components/jobs/update-job-form";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import type { JobPosting, JobPosition } from "@/lib/types";

type CompanyDashboard = {
  activeJobs?: number;
  pausedJobs?: number;
  pendingInvites?: number;
  recentInvites?: Array<{
    email?: string;
    role?: string;
    invitedAt?: string;
  }>;
};

type CompanyProfile = {
  id: number;
  name: string;
  website?: string | null;
  createdAt?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  companySize?: string | null;
  companyAddress?: string | null;
};

type CompanyUser = {
  id: number;
  email: string;
  role: string;
  joinedAt?: string | null;
  locked: boolean;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

async function getCompanyDashboard(): Promise<CompanyDashboard | null> {
  try {
    const response = await apiFetch("/api/companies/dashboard/me", { method: "GET" });
    const data = await response.json();
    return data as CompanyDashboard;
  } catch {
    return null;
  }
}

async function getCompanyProfile(): Promise<CompanyProfile | null> {
  try {
    const response = await apiFetch("/api/companies/me", { method: "GET" });
    const data = await response.json();
    if (!data || typeof data !== "object") {
      return null;
    }
    const company = data as Partial<CompanyProfile> & {
      created_at?: string | null;
      logo_url?: string | null;
      company_size?: string | null;
      company_address?: string | null;
    };
    return {
      id: Number(company.id ?? 0),
      name: String(company.name ?? "Unnamed company"),
      website: company.website ?? null,
      createdAt: company.createdAt ?? company.created_at ?? null,
      description: company.description ?? null,
      logoUrl: company.logoUrl ?? company.logo_url ?? null,
      companySize: company.companySize ?? company.company_size ?? null,
      companyAddress: company.companyAddress ?? company.company_address ?? null,
    };
  } catch {
    return null;
  }
}

async function getCompanyUsers(): Promise<CompanyUser[]> {
  try {
    const response = await apiFetch("/api/companies/me/users", { method: "GET" });
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    type CompanyUserApi = Partial<CompanyUser> & {
      roleName?: string | null;
      joinedAt?: string | null;
      createdAt?: string | null;
      created_at?: string | null;
      locked?: boolean | null;
    };
    return (data as CompanyUserApi[]).map((user, index) => ({
      id: Number(user.id ?? index),
      email: String(user.email ?? "unknown@talentflow.app"),
      role: String(user.role ?? user.roleName ?? "Unknown"),
      joinedAt: user.joinedAt ?? user.createdAt ?? user.created_at ?? null,
      locked: Boolean(user.locked),
    }));
  } catch {
    return [];
  }
}

async function getCompanyJobs(): Promise<JobPosting[]> {
  try {
    const response = await apiFetch("/api/jobs", { method: "GET" });
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    type JobPostingApi = Partial<JobPosting> & {
      company_id?: number | null;
      companyId?: number | null;
      job_position?: JobPosition | null;
      jobPosition?: JobPosition | null;
      created_at?: string | null;
      updated_at?: string | null;
      salary_range?: string | null;
      work_type?: string | null;
    };
    return (data as JobPostingApi[]).map((job, index) => ({
      id: Number(job.id ?? index),
      companyId: Number(job.companyId ?? job.company_id ?? 0),
      title: String(job.title ?? "Untitled role"),
      description: job.description ?? null,
      requirements: job.requirements ?? null,
      salaryRange: job.salaryRange ?? job.salary_range ?? null,
      benefits: job.benefits ?? null,
      location: job.location ?? null,
      workType: job.workType ?? job.work_type ?? null,
      status: normalizeJobStatus(job.status),
      recruiterId: job.recruiterId ?? null,
      jobPosition: job.jobPosition ?? job.job_position ?? null,
      createdAt: job.createdAt ?? job.created_at ?? null,
      updatedAt: job.updatedAt ?? job.updated_at ?? null,
    }));
  } catch {
    return [];
  }
}

async function getJobPositions(): Promise<JobPosition[]> {
  try {
    const response = await apiFetch("/api/jobs/positions", { method: "GET" });
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return (data as Array<Partial<JobPosition>>).map((position, index) => ({
      id: Number(position.id ?? index),
      companyId: Number(position.companyId ?? 0),
      title: String(position.title ?? "Untitled position"),
      department: position.department ?? null,
      level: position.level ?? null,
    }));
  } catch {
    return [];
  }
}

const JOB_STATUS_VALUES = new Set(["DRAFT", "PUBLISHED", "PAUSED", "CLOSED"]);

function normalizeJobStatus(value?: string | null): JobPosting["status"] {
  if (!value) {
    return "DRAFT";
  }
  const upper = value.toUpperCase();
  return (JOB_STATUS_VALUES.has(upper) ? upper : "DRAFT") as JobPosting["status"];
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

export default async function CompanyAdminDashboardPage() {
  const [dashboard, profile, users, jobs, positions] = await Promise.all([
    getCompanyDashboard(),
    getCompanyProfile(),
    getCompanyUsers(),
    getCompanyJobs(),
    getJobPositions(),
  ]);

  const publishedJobs = jobs.filter((job) => (job.status ?? "").toUpperCase() === "PUBLISHED");

  const metrics = [
    {
      label: "Team members",
      value: users.length,
      helper: "Admins, recruiters, and collaborators with access.",
    },
    {
      label: "Active jobs",
      value: dashboard?.activeJobs ?? publishedJobs.length,
      helper: "Roles currently visible to candidates.",
    },
    {
      label: "Pending invitations",
      value: dashboard?.pendingInvites ?? 0,
      helper: "Invites sent but not yet accepted.",
    },
  ];

  const recentInvites = dashboard?.recentInvites ?? [];

  const profileForForm = {
    name: profile?.name ?? "",
    description: profile?.description ?? "",
    website: profile?.website ?? "",
    logoUrl: profile?.logoUrl ?? "",
    companySize: profile?.companySize ?? "",
    companyAddress: profile?.companyAddress ?? "",
  };

  return (
    <Container className="max-w-5xl space-y-10">
      <Panel variant="glass" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
              Company admin console
            </span>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Configure your company space and keep hiring moving.
            </h1>
            <p className="max-w-2xl text-sm text-foreground/70">
              Invite teammates, update company details, and monitor roles in flight. Use these quick insights to
              stay ahead of hiring demands.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-foreground/10 bg-surface/95 p-5 text-sm text-foreground/70"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{metric.value}</p>
              <p className="mt-2 text-xs">{metric.helper}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel variant="surface" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Company snapshot</h2>
            <p className="text-sm text-foreground/60">
              Double-check branding details, hiring locations, and go-live timelines before inviting more users.
            </p>
          </div>
          <Link href={ROUTES.docs} className="text-sm font-semibold text-foreground hover:underline">
            Update guidelines
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] text-sm text-foreground/70">
          <div className="space-y-4 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Company</p>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{profile?.name ?? "Pending setup"}</p>
              {profile?.website ? (
                <a
                  href={profile.website}
                  className="text-xs font-semibold text-accent hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.website}
                </a>
              ) : (
                <p className="text-xs text-foreground/50">Add your public website so candidates can learn more.</p>
              )}
            </div>
            <p className="text-xs text-foreground/60">
              {profile?.description ?? "Add a description so recruiters have the right context."}
            </p>
            <p className="text-xs text-foreground/60">
              <span className="font-semibold text-foreground">Company size:</span>{" "}
              {profile?.companySize ?? "Share your headcount range to set expectations with candidates."}
            </p>
          </div>
          <div className="space-y-4 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Headquarters</p>
            <p className="font-semibold text-foreground">
              {profile?.companyAddress ?? "Add your primary office or headquarters address."}
            </p>
            <p className="text-xs text-foreground/60">Onboarded {formatDate(profile?.createdAt)}</p>
            <div>
              <h3 className="text-xs uppercase tracking-[0.28em] text-muted">Update details</h3>
              <p className="text-xs text-foreground/60">
                Keep branding and messaging fresh. Changes reflect instantly across job postings.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-surface/95 p-5">
          <UpdateCompanyForm profile={profileForForm} />
        </div>
      </Panel>

      <Panel variant="surface" padding="lg" className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Team roster</h2>
          <p className="text-sm text-foreground/60">
            Company admins oversee permissions, while recruiters manage individual jobs and pipelines.
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-surface/95 p-5">
          <InviteMemberForm />
        </div>
        <CompanyMembersPanel users={users} />
      </Panel>

      <Panel variant="surface" padding="lg" className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Job portfolio</h2>
          <p className="text-sm text-foreground/60">
            Draft, publish, or pause roles directly from this workspace. Changes sync with the public job board
            immediately.
          </p>
        </div>

        <CreateJobForm positions={positions} />

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
            No jobs created yet. Draft a role to kick off your hiring pipeline.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{job.title}</p>
                    <p className="text-xs text-foreground/60">
                      Status {(job.status ?? "DRAFT").toLowerCase()} - Created {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`${ROUTES.jobs}/${job.id}`}
                    className="text-xs font-semibold text-accent hover:text-foreground"
                  >
                    Preview
                  </Link>
                </div>
                <UpdateJobForm job={job} positions={positions} />
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel variant="surface" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Invitations in progress</h2>
            <p className="text-sm text-foreground/60">
              Keep an eye on pending invitations so teammates do not miss their welcome email.
            </p>
          </div>
          <Link href="/docs/admin#reminders" className="text-sm font-semibold text-foreground hover:underline">
            Reminder templates
          </Link>
        </div>
        {recentInvites.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
            No outstanding invitations. Great job keeping your roster current!
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {recentInvites.map((invite, index) => (
              <div
                key={`${invite.email}-${index}`}
                className="flex flex-col gap-2 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{invite.email ?? "pending@email.com"}</p>
                  <p className="text-xs text-foreground/60">{invite.role ?? "Role pending"}</p>
                </div>
                <p className="text-xs text-foreground/50">
                  Sent {invite.invitedAt ? formatDate(invite.invitedAt) : "recently"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </Container>
  );
}


