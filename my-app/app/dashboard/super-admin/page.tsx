import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { DebouncedSearchInput } from "@/components/super-admin/debounced-search-input";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import type { JobPosting } from "@/lib/types";
import { updateCompanyStatusAction, updateJobStatusAction } from "@/app/dashboard/super-admin/actions";

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

async function getSuperAdminDashboard() {
  try {
    const response = await apiFetch("/api/companies/dashboard/super-admin", { method: "GET" });
    const data = await response.json();
    return data as SuperAdminDashboard;
  } catch {
    return null;
  }
}

async function getCompanies(): Promise<CompanySummary[]> {
  try {
    const response = await apiFetch("/api/companies", { method: "GET" });
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return (data as CompanyApiResponse[]).map((company, index) => ({
      id: Number(company.id ?? index),
      name: String(company.name ?? "Unnamed company"),
      status: company.status ?? null,
      createdAt: company.createdAt ?? company.created_at ?? null,
      industry: company.industry ?? company.sector ?? null,
      adminCount: company.adminCount ?? company.admin_count ?? null,
    }));
  } catch {
    return [];
  }
}

async function getJobs(): Promise<JobPosting[]> {
  try {
    const response = await apiFetch("/api/jobs", { method: "GET" });
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return (data as JobApiResponse[]).map((job, index) => ({
      id: Number(job.id ?? index),
      companyId: Number(job.companyId ?? job.company_id ?? 0),
      jobPosition: job.jobPosition ?? null,
      title: String(job.title ?? "Untitled job"),
      description: job.description ?? null,
      requirements: job.requirements ?? null,
      benefits: job.benefits ?? null,
      salaryRange: job.salaryRange ?? null,
      location: job.location ?? null,
      workType: job.workType ?? null,
      status: (job.status ?? "DRAFT") as JobPosting["status"],
      recruiterId: job.recruiterId ?? null,
      createdAt: job.createdAt ?? "",
      updatedAt: job.updatedAt ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function SuperAdminDashboardPage({
  searchParams,
}: {
  searchParams?: SuperAdminSearchParams | Promise<SuperAdminSearchParams>;
}) {
  const resolvedSearchParams = ((await Promise.resolve(searchParams)) ?? {}) as SuperAdminSearchParams;

  const [dashboard, companies, jobs] = await Promise.all([
    getSuperAdminDashboard(),
    getCompanies(),
    getJobs(),
  ]);

  const companyQuery =
    typeof resolvedSearchParams.company === "string" ? resolvedSearchParams.company.trim() : "";
  const jobQuery = typeof resolvedSearchParams.job === "string" ? resolvedSearchParams.job.trim() : "";
  const accountQuery =
    typeof resolvedSearchParams.account === "string" ? resolvedSearchParams.account.trim() : "";

  const companyLookup = new Map(companies.map((company) => [company.id, company.name]));

  const filteredCompanies = (companyQuery ? companies.filter((company) => company.name.toLowerCase().includes(companyQuery.toLowerCase())) : companies).sort((a, b) => a.name.localeCompare(b.name));

  const enrichedJobs = jobs.map((job) => ({
    ...job,
    companyName: companyLookup.get(job.companyId) ?? "Unknown company",
  }));

  const filteredJobs = jobQuery
    ? enrichedJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(jobQuery.toLowerCase()) ||
          job.companyName.toLowerCase().includes(jobQuery.toLowerCase())
      )
    : enrichedJobs;

  const accountsByCompany = companies.map((company) => ({
    id: company.id,
    name: company.name,
    adminCount: company.adminCount ?? 0,
    status: company.status ?? null,
  }));

  const filteredAccounts = accountQuery
    ? accountsByCompany.filter((account) => account.name.toLowerCase().includes(accountQuery.toLowerCase()))
    : accountsByCompany;

  const metrics = [
    {
      label: "Companies onboarded",
      value: dashboard?.totalCompanies ?? companies.length,
      helper: "Tenants currently hosted.",
    },
    {
      label: "Active companies",
      value:
        dashboard?.activeCompanies ??
        companies.filter((company) => (company.status ?? "").toLowerCase() === "active").length,
      helper: "Tenants with recent activity.",
    },
    {
      label: "Pending invitations",
      value: dashboard?.pendingInvites ?? 0,
      helper: "Outstanding super-admin or workspace invites.",
    },
  ];

  const pendingInvites =
    dashboard?.pendingInvitations?.map((invite) => ({
      email: String(invite.email ?? "unknown@email.com"),
      companyName: invite.companyName ?? "Unassigned",
      role: invite.role ?? "Pending role",
      invitedAt: invite.invitedAt ?? null,
    })) ?? [];

  const companyStatusOptions = Array.from(
    new Set(
      companies
        .map((company) => (company.status ?? "").toUpperCase())
        .filter((status) => status.length > 0)
        .concat(["ACTIVE", "INACTIVE", "PENDING"])
    )
  );

  const jobStatusOptions: JobPosting["status"][] = ["DRAFT", "PUBLISHED", "PAUSED", "CLOSED"];

  return (
    <Container className="max-w-6xl space-y-10">
      <Panel id="overview" variant="glass" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Super admin console</span>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Status-first platform control.</h1>
            <p className="max-w-2xl text-sm text-foreground/70">
              Keep the platform steady by monitoring tenant and job status. Workspace owners maintain their content you focus on visibility and readiness.
            </p>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent" aria-hidden />
                <span>Use the management panels to search, review, and adjust status without touching workspace configuration.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent" aria-hidden />
                <span>Status changes instantly revalidate this dashboard for accurate follow-up.</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 text-sm text-foreground/70">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Workflow tips</p>
            <p>
              1. Review metrics for anomalies. 2. Filter companies or jobs to locate the tenant in question. 3. Update status and leave messaging to local admins.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-foreground/10 bg-surface/95 p-5 text-sm text-foreground/70"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{metric.value}</p>
              <p className="mt-2 text-xs">{metric.helper}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="operations" variant="surface" padding="lg" className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Platform operations</h2>
          <p className="text-sm text-foreground/60">
            Super admins focus on visibility and status alignment. Workspace owners own data, roles, and content.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Company status</p>
            <p className="text-sm text-foreground/70">
              Toggle companies between <span className="font-semibold text-foreground">active</span> and <span className="font-semibold text-foreground">inactive</span> to control access without altering data.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Job visibility</p>
            <p className="text-sm text-foreground/70">
              Promote, pause, or close roles to align hiring focus while recruiters maintain descriptions and requirements.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Coverage signals</p>
            <p className="text-sm text-foreground/70">
              Watch admin counts and status mismatches to know when to nudge a tenant or flag capacity issues.
            </p>
          </div>
        </div>
      </Panel>

      <CompanyManagementPanel
        companies={filteredCompanies}
        companyStatusOptions={companyStatusOptions}
        companyQuery={companyQuery}
        jobQuery={jobQuery}
        accountQuery={accountQuery}
      />

      <JobManagementPanel
        jobs={filteredJobs}
        jobStatusOptions={jobStatusOptions}
        companyQuery={companyQuery}
        jobQuery={jobQuery}
        accountQuery={accountQuery}
      />

      <AccountManagementPanel
        accounts={filteredAccounts}
        companyQuery={companyQuery}
        jobQuery={jobQuery}
        accountQuery={accountQuery}
      />

      <InvitationsPanel pendingInvites={pendingInvites} />
    </Container>
  );
}

function CompanyManagementPanel({
  companies,
  companyStatusOptions,
  companyQuery,
  jobQuery,
  accountQuery,
}: {
  companies: CompanySummary[];
  companyStatusOptions: string[];
  companyQuery: string;
  jobQuery: string;
  accountQuery: string;
}) {
  return (
    <Panel id="companies" variant="surface" padding="lg" className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Company management</h2>
        <p className="text-sm text-foreground/60">
          Search tenants and update their status. Workspace owners manage all other company settings.
        </p>
      </div>
      <DebouncedSearchInput
        param="company"
        placeholder="Search companies by name"
        initialValue={companyQuery}
      />
      {companies.length === 0 ? (
        <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
          No companies matched your search.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {companies.map((company) => {
            const statusValue = (company.status ?? "PENDING").toUpperCase();
            return (
              <div
                key={company.id}
                className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 text-sm text-foreground/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{company.name}</p>
                    <p className="text-xs text-foreground/60">
                      Created {formatDate(company.createdAt)} | Status {statusValue.toLowerCase()}
                    </p>
                  </div>
                  <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground/70">
                    Admins {company.adminCount ?? 0}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                  {company.industry ? <span>{company.industry}</span> : <span>Industry unknown</span>}
                </div>
                <form action={updateCompanyStatusAction} className="flex flex-wrap items-center gap-2 text-xs">
                  <input type="hidden" name="companyId" value={company.id} />
                  <select
                    name="status"
                    defaultValue={statusValue}
                    className="rounded-lg border border-foreground/20 bg-background px-2 py-1 text-xs uppercase tracking-[0.2em] outline-none transition focus:border-foreground/40"
                  >
                    {companyStatusOptions.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption.charAt(0) + statusOption.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" variant="secondary">
                    Update status
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function JobManagementPanel({
  jobs,
  jobStatusOptions,
  companyQuery,
  jobQuery,
  accountQuery,
}: {
  jobs: Array<JobPosting & { companyName: string }>;
  jobStatusOptions: JobPosting["status"][];
  companyQuery: string;
  jobQuery: string;
  accountQuery: string;
}) {
  return (
    <Panel id="jobs" variant="surface" padding="lg" className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Job management</h2>
        <p className="text-sm text-foreground/60">
          Search roles across tenants and adjust their visibility. Recruiting teams remain owners of job content.
        </p>
      </div>
      <DebouncedSearchInput
        param="job"
        placeholder="Search jobs by title or company"
        initialValue={jobQuery}
      />
      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
          No jobs matched your search.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-foreground/10 bg-surface/95 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          <table className="min-w-full divide-y divide-foreground/10 text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.28em] text-foreground/50">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-4 py-3 text-sm text-foreground">{job.title}</td>
                  <td className="px-4 py-3 text-sm text-foreground/70">{job.companyName}</td>
                  <td className="px-4 py-3 text-sm text-foreground/60">
                    <form action={updateJobStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="jobId" value={job.id} />
                      <select
                        name="status"
                        defaultValue={job.status}
                        className="rounded-lg border border-foreground/20 bg-background px-2 py-1 text-xs uppercase tracking-[0.2em] outline-none transition focus:border-foreground/40"
                      >
                        {jobStatusOptions.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption.charAt(0) + statusOption.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" size="sm" variant="secondary">
                        Update
                      </Button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    <Link
                      href={`${ROUTES.jobs}/${job.id}`}
                      className="font-semibold text-accent transition hover:text-foreground"
                    >
                      Preview ?
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function AccountManagementPanel({
  accounts,
  companyQuery,
  jobQuery,
  accountQuery,
}: {
  accounts: Array<{ id: number; name: string; adminCount: number; status: string | null }>;
  companyQuery: string;
  jobQuery: string;
  accountQuery: string;
}) {
  return (
    <Panel id="accounts" variant="surface" padding="lg" className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Account coverage</h2>
        <p className="text-sm text-foreground/60">
          Ensure every tenant has enough administrators to stay responsive. Use the search to focus on a specific company.
        </p>
      </div>
      <DebouncedSearchInput
        param="account"
        placeholder="Search accounts by company"
        initialValue={accountQuery}
      />
      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
          No companies matched your filter.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 text-sm text-foreground/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{account.name}</p>
                  <p className="text-xs text-foreground/60">
                    Status {(account.status ?? "pending").toLowerCase()}
                  </p>
                </div>
                <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground/70">
                  Admins {account.adminCount}
                </span>
              </div>
              <p className="text-xs text-foreground/60">
                Need more context? Filter the jobs panel for this tenant to see what they are hiring for.
              </p>
              <Link
                href={`${ROUTES.superAdminDashboard}?company=${encodeURIComponent(account.name)}&job=${jobQuery}&account=${accountQuery}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition hover:text-foreground"
              >
                Filter jobs
                <span aria-hidden>?</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function InvitationsPanel({ pendingInvites }: { pendingInvites: PendingInvite[] }) {
  return (
    <Panel id="invitations" variant="surface" padding="lg" className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Invitations awaiting acceptance</h2>
        <p className="text-sm text-foreground/60">
          Follow up with company owners or recruiters who haven&apos;t activated their accounts yet.
        </p>
      </div>
      {pendingInvites.length === 0 ? (
        <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
          No pending invitations. Great job keeping onboarding tidy!
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          {pendingInvites.map((invite, index) => (
            <div
              key={`${invite.email}-${index}`}
              className="flex flex-col gap-2 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-foreground">{invite.email}</p>
                <p className="text-xs text-foreground/60">
                  {invite.companyName ?? "Unassigned company"} - {invite.role ?? "Role pending"}
                </p>
              </div>
              <p className="text-xs text-foreground/50">Sent {invite.invitedAt ? formatDate(invite.invitedAt) : "recently"}</p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// Types -----------------------------------------------------------------------------

type SuperAdminDashboard = {
  totalCompanies?: number;
  activeCompanies?: number;
  pendingInvites?: number;
  totalCompanyAdmins?: number;
  recentCompanies?: Array<{
    id?: number;
    name?: string;
    status?: string;
    createdAt?: string;
    adminCount?: number;
  }>;
  pendingInvitations?: Array<{
    email?: string;
    companyName?: string;
    role?: string;
    invitedAt?: string;
  }>;
};

type CompanySummary = {
  id: number;
  name: string;
  status?: string | null;
  createdAt?: string | null;
  industry?: string | null;
  adminCount?: number | null;
};

type CompanyApiResponse = Partial<CompanySummary> & {
  created_at?: string | null;
  sector?: string | null;
  admin_count?: number | null;
};

type JobApiResponse = Partial<JobPosting> & {
  company_id?: number | null;
  companyId?: number | null;
};

type PendingInvite = {
  email: string;
  companyName?: string | null;
  role?: string | null;
  invitedAt?: string | null;
};

type SuperAdminSearchParams = {
  company?: string;
  job?: string;
  account?: string;
};
