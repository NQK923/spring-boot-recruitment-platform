import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { CreateCompanyForm } from "@/components/super-admin/create-company-form";
import { InviteCompanyUserForm } from "@/components/super-admin/invite-company-user-form";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import type { JobPosting } from "@/lib/types";


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

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

async function getSuperAdminDashboard(): Promise<SuperAdminDashboard | null> {
  try {
    const response = await apiFetch("/api/companies/dashboard/super-admin", { method: "GET" });
    const data = await response.json();
    return data as SuperAdminDashboard;
  } catch {
    return null;
  }
}

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

async function getCompanies(): Promise<CompanySummary[]> {
  try {
    const response = await apiFetch("/api/companies", { method: "GET" });
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    const rawCompanies = data as CompanyApiResponse[];
    return rawCompanies.map((company, index) => ({
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

type JobApiResponse = Partial<JobPosting> & {
  company_id?: number | null;
  companyId?: number | null;
};

async function getAllJobs(): Promise<JobPosting[]> {
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

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

type SuperAdminSearchParams = {
  company?: string;
  job?: string;
  account?: string;
};

export default async function SuperAdminDashboardPage({
  searchParams,
}: {
  searchParams?: SuperAdminSearchParams;
}) {
  const [dashboard, companies, jobs] = await Promise.all([
    getSuperAdminDashboard(),
    getCompanies(),
    getAllJobs(),
  ]);

  const companyQuery =
    typeof searchParams?.company === "string" ? searchParams.company.trim() : "";
  const jobQuery = typeof searchParams?.job === "string" ? searchParams.job.trim() : "";
  const accountQuery =
    typeof searchParams?.account === "string" ? searchParams.account.trim() : "";

  const companyLookup = new Map(companies.map((company) => [company.id, company.name]));

  const filteredCompanies =
    companyQuery.length === 0
      ? companies
      : companies.filter((company) =>
          company.name.toLowerCase().includes(companyQuery.toLowerCase())
        );

  const jobsWithCompany = jobs.map((job) => ({
    ...job,
    companyName: companyLookup.get(job.companyId) ?? "Unknown company",
  }));

  const filteredJobs =
    jobQuery.length === 0
      ? jobsWithCompany
      : jobsWithCompany.filter(
          (job) =>
            job.title.toLowerCase().includes(jobQuery.toLowerCase()) ||
            job.companyName.toLowerCase().includes(jobQuery.toLowerCase())
        );

  const accountsByCompany = companies.map((company) => ({
    id: company.id,
    name: company.name,
    adminCount: company.adminCount ?? 0,
    status: company.status ?? null,
  }));

  const filteredAccounts =
    accountQuery.length === 0
      ? accountsByCompany
      : accountsByCompany.filter((account) =>
          account.name.toLowerCase().includes(accountQuery.toLowerCase())
        );

  const metrics = [
    {
      label: "Companies onboarded",
      value: dashboard?.totalCompanies ?? companies.length,
      helper: "Total tenants running on Talentflow.",
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
      helper: "Company, admin, or recruiter invites awaiting acceptance.",
    },
  ];

  const pendingInvites =
    dashboard?.pendingInvitations?.map((invite) => ({
      email: String(invite.email ?? "unknown@email.com"),
      companyName: invite.companyName ?? "Unassigned",
      role: invite.role ?? "Pending role",
      invitedAt: invite.invitedAt ?? null,
    })) ?? [];

  const companyOptions = companies.map((company) => ({
    id: company.id,
    name: company.name,
  }));

  return (
    <Container className="max-w-6xl space-y-10">
      <Panel id="overview" variant="glass" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
              Super admin console
            </span>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Orchestrate every tenant from a single view.
            </h1>
            <p className="max-w-2xl text-sm text-foreground/70">
              Review company health, spin up new workspaces, and keep onboarding flowing smoothly. Use the quick
              actions to create organisations and invite company leaders in minutes.
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

      <Panel id="operations" variant="surface" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
            <p className="text-sm text-foreground/60">
              Launch new tenants, invite administrators, and share onboarding resources without leaving this view.
            </p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Create company</h3>
              <p className="text-xs text-foreground/60">
                Capture the essentials and spin up a new workspace instantly.
              </p>
            </div>
            <CreateCompanyForm />
          </div>
          <div className="space-y-4 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Invite company admin or recruiter</h3>
              <p className="text-xs text-foreground/60">
                Send activation links so leaders can configure their teams and start hiring.
              </p>
            </div>
            <InviteCompanyUserForm companies={companyOptions} />
          </div>
        </div>
      </Panel>

      <Panel id="companies" variant="surface" padding="lg" className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Company management</h2>
          <p className="text-sm text-foreground/60">
            Search and jump into any tenant to review onboarding progress, job activity, and admin coverage.
          </p>
        </div>
        <form
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3"
          action={ROUTES.superAdminDashboard}
        >
          <input
            type="search"
            name="company"
            defaultValue={companyQuery}
            placeholder="Search companies by name"
            className="flex-1 min-w-[220px] rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground/40"
          />
          {jobQuery ? <input type="hidden" name="job" value={jobQuery} /> : null}
          {accountQuery ? <input type="hidden" name="account" value={accountQuery} /> : null}
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
          {companyQuery ? (
            <Link
              href={ROUTES.superAdminDashboard}
              className="text-sm font-semibold text-foreground hover:text-accent"
            >
              Clear
            </Link>
          ) : null}
        </form>
        {filteredCompanies.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
            No companies matched your search. Try a different name or reset the filters.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 text-sm text-foreground/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{company.name}</p>
                    <p className="text-xs text-foreground/60">
                      Created {formatDate(company.createdAt)} · Status {(company.status ?? "pending").toLowerCase()}
                    </p>
                  </div>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                    Admins {company.adminCount ?? 0}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                  {company.industry ? <span>{company.industry}</span> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`${ROUTES.companyAdminDashboard}?companyId=${company.id}`}
                    className="text-xs font-semibold text-accent transition hover:text-foreground"
                  >
                    Manage company →
                  </Link>
                  <Link
                    href={`${ROUTES.superAdminDashboard}?company=${encodeURIComponent(company.name)}&job=${jobQuery}&account=${accountQuery}`}
                    className="text-xs text-foreground/60 hover:text-foreground"
                  >
                    Filter jobs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel id="jobs" variant="surface" padding="lg" className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Job management</h2>
          <p className="text-sm text-foreground/60">
            Track every open role across tenants. Search by job title or company to jump straight into a posting.
          </p>
        </div>
        <form
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3"
          action={ROUTES.superAdminDashboard}
        >
          {companyQuery ? <input type="hidden" name="company" value={companyQuery} /> : null}
          <input
            type="search"
            name="job"
            defaultValue={jobQuery}
            placeholder="Search jobs by title or company"
            className="flex-1 min-w-[220px] rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground/40"
          />
          {accountQuery ? <input type="hidden" name="account" value={accountQuery} /> : null}
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
          {jobQuery ? (
            <Link
              href={`${ROUTES.superAdminDashboard}?company=${encodeURIComponent(
                companyQuery
              )}&account=${encodeURIComponent(accountQuery)}`}
              className="text-sm font-semibold text-foreground hover:text-accent"
            >
              Clear
            </Link>
          ) : null}
        </form>
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
            No jobs matched your search. Adjust the filters or ask company admins to publish roles.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-foreground/10 bg-surface/95 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            <table className="min-w-full divide-y divide-foreground/10 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.28em] text-foreground/50">
                <tr>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-4 py-3 text-sm text-foreground">{job.title}</td>
                    <td className="px-4 py-3 text-sm text-foreground/70">{job.companyName}</td>
                    <td className="px-4 py-3 text-sm text-foreground/60">{job.status.toLowerCase()}</td>
                    <td className="px-4 py-3 text-right text-xs">
                      <Link
                        href={`${ROUTES.jobs}/${job.id}`}
                        className="font-semibold text-accent transition hover:text-foreground"
                      >
                        Preview →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel id="accounts" variant="surface" padding="lg" className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Account management</h2>
          <p className="text-sm text-foreground/60">
            See which tenants have adequate coverage. Filter by company to review admin counts and plan follow-up.
          </p>
        </div>
        <form
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3"
          action={ROUTES.superAdminDashboard}
        >
          {companyQuery ? <input type="hidden" name="company" value={companyQuery} /> : null}
          {jobQuery ? <input type="hidden" name="job" value={jobQuery} /> : null}
          <input
            type="search"
            name="account"
            defaultValue={accountQuery}
            placeholder="Search accounts by company"
            className="flex-1 min-w-[220px] rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground/40"
          />
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
          {accountQuery ? (
            <Link
              href={`${ROUTES.superAdminDashboard}?company=${encodeURIComponent(
                companyQuery
              )}&job=${encodeURIComponent(jobQuery)}`}
              className="text-sm font-semibold text-foreground hover:text-accent"
            >
              Clear
            </Link>
          ) : null}
        </form>
        {filteredAccounts.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
            No companies matched your filter. Reset the search to see the complete list.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredAccounts.map((account) => (
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
                <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                  <Link
                    href={`${ROUTES.companyAdminDashboard}?companyId=${account.id}`}
                    className="font-semibold text-accent transition hover:text-foreground"
                  >
                    Manage accounts
                  </Link>
                  <span>•</span>
                  <Link
                    href={`${ROUTES.superAdminDashboard}?company=${encodeURIComponent(
                      account.name
                    )}&job=${jobQuery}&account=${accountQuery}`}
                    className="font-semibold text-accent transition hover:text-foreground"
                  >
                    Filter jobs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel id="invitations" variant="surface" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Invitations awaiting acceptance</h2>
            <p className="text-sm text-foreground/60">
              Follow up with company owners or recruiters who haven&#39;t activated their accounts yet.
            </p>
          </div>
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





