import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { CreateCompanyForm } from "@/components/super-admin/create-company-form";
import { InviteCompanyUserForm } from "@/components/super-admin/invite-company-user-form";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

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

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

export default async function SuperAdminDashboardPage() {
  const [dashboard, companies] = await Promise.all([getSuperAdminDashboard(), getCompanies()]);

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

  const recentCompanies =
    dashboard?.recentCompanies?.map((company) => ({
      id: Number(company.id ?? 0),
      name: String(company.name ?? "Unnamed company"),
      createdAt: company.createdAt ?? null,
      status: company.status ?? null,
      adminCount: company.adminCount ?? null,
    })) ?? companies.slice(0, 6);

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
      <Panel variant="glass" padding="lg" className="space-y-6">
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
          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.docs}>
              <Button size="sm" variant="secondary">
                View admin handbook
              </Button>
            </Link>
            <Link href="/docs/ops/support">
              <Button size="sm">Escalation matrix</Button>
            </Link>
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
            <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
            <p className="text-sm text-foreground/60">
              Launch new tenants, invite administrators, and share onboarding resources without leaving this view.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/docs/admin#workspace-preparation">
              <Button size="sm" variant="secondary">
                Workspace checklist
              </Button>
            </Link>
            <Link href="/docs/ops/templates">
              <Button size="sm">Communication templates</Button>
            </Link>
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

      <Panel variant="surface" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Company directory</h2>
            <p className="text-sm text-foreground/60">
              Snapshot of recently active tenants. Drill in to review admins, job activity, and onboarding status.
            </p>
          </div>
          <Link href={ROUTES.docs} className="text-sm font-semibold text-foreground hover:underline">
            Manage documentation
          </Link>
        </div>
        {recentCompanies.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
            No companies found yet. Create a tenant to populate this directory.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recentCompanies.map((company) => (
              <div
                key={company.id}
                className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 text-sm text-foreground/70"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{company.name}</p>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                    {company.status ? company.status.toLowerCase() : "pending"}
                  </span>
                </div>
                <p className="mt-2 text-xs">
                  Created {formatDate(company.createdAt)} - Admins {company.adminCount ?? "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel variant="surface" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Invitations awaiting acceptance</h2>
            <p className="text-sm text-foreground/60">
              Follow up with company owners or recruiters who haven’t activated their accounts yet.
            </p>
          </div>
          <Link href="/docs/ops/templates" className="text-sm font-semibold text-foreground hover:underline">
            Reminder templates
          </Link>
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
