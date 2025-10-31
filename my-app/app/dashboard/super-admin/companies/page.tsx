import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { DebouncedSearchInput } from "@/components/super-admin/debounced-search-input";
import { CreateCompanyForm } from "@/components/super-admin/create-company-form";
import { InviteCompanyUserForm } from "@/components/super-admin/invite-company-user-form";
import { fetchSuperAdminCompanies, fetchSuperAdminDashboard } from "@/app/dashboard/super-admin/data";
import { updateCompanyStatusAction } from "@/app/dashboard/super-admin/actions";
import { ROUTES } from "@/lib/routes";
import { cx } from "@/lib/cx";

const COMPANY_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "INACTIVE", label: "Inactive" },
];

const numberFormatter = new Intl.NumberFormat();
const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

function formatDate(value: string | null): string {
  if (!value) {
    return "Recently onboarded";
  }
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function statusClass(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";
    case "INACTIVE":
      return "bg-red-100 text-red-600";
    case "PENDING":
    default:
      return "bg-amber-100 text-amber-700";
  }
}

type SuperAdminCompaniesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SuperAdminCompaniesPage({ searchParams }: SuperAdminCompaniesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const searchTermRaw = resolvedSearchParams.query;
  const searchTerm = typeof searchTermRaw === "string" ? searchTermRaw.trim() : "";

  const [companies, dashboard] = await Promise.all([fetchSuperAdminCompanies(), fetchSuperAdminDashboard()]);
  const normalizedQuery = searchTerm.toLowerCase();
  const filteredCompanies = normalizedQuery
    ? companies.filter((company) => {
        const haystack = [company.name, company.description ?? "", company.website ?? ""]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : companies;
  const redirectPath = searchTerm
    ? `${ROUTES.superAdminCompanies}?query=${encodeURIComponent(searchTerm)}`
    : ROUTES.superAdminCompanies;

  const topCompanies = dashboard?.topCompaniesByOpenRoles ?? [];
  const companyOptions = companies.map((company) => ({ id: company.id, name: company.name }));

  return (
    <Container className="space-y-8 py-10">
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Panel className="space-y-6" padding="lg">
          <div>
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Super admin workspace</h1>
            <p className="mt-2 text-sm text-foreground/60">
              Monitor every tenant, keep onboarding flowing, and make sure each company has the right owner.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-foreground/50">Companies</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {numberFormatter.format(dashboard?.totalCompanies ?? companies.length)}
              </p>
              <p className="text-xs text-foreground/60">Tenants registered on the platform</p>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-foreground/50">Open roles</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {numberFormatter.format(dashboard?.totalJobPostings ?? 0)}
              </p>
              <p className="text-xs text-foreground/60">Active job postings across all tenants</p>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-foreground/50">Applications</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {numberFormatter.format(dashboard?.totalApplications ?? 0)}
              </p>
              <p className="text-xs text-foreground/60">Candidate submissions received</p>
            </div>
          </div>
          {topCompanies.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-foreground/50">Top hiring companies</p>
              <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                {topCompanies.slice(0, 4).map((company) => (
                  <li key={company.companyId} className="flex items-center justify-between rounded-xl border border-foreground/10 bg-surface/95 px-4 py-2">
                    <span className="font-medium text-foreground">{company.companyName}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/50">
                      {numberFormatter.format(company.openRoles)} open
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4" padding="lg">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Create new company</h2>
              <p className="text-sm text-foreground/60">Provision a dedicated workspace and assign an owner later.</p>
            </div>
            <CreateCompanyForm />
          </Panel>

          <Panel className="space-y-4" padding="lg">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Invite company admin</h2>
              <p className="text-sm text-foreground/60">
                Send an invitation so the company owner can configure their tenant and add teammates.
              </p>
            </div>
            {companyOptions.length > 0 ? (
              <InviteCompanyUserForm companies={companyOptions} />
            ) : (
              <p className="rounded-xl border border-dashed border-foreground/20 bg-surface-muted px-4 py-3 text-sm text-foreground/60">
                Create a company before sending invitations.
              </p>
            )}
          </Panel>
        </div>
      </div>

      <Panel className="space-y-6" padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Company directory</h2>
            <p className="text-sm text-foreground/60">
              Review statuses and keep track of which tenants are ready for production traffic.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="h-10 w-full max-w-sm rounded-2xl bg-surface-muted" />
            }
          >
            <DebouncedSearchInput
              param="query"
              placeholder="Search companies by name or website"
              initialValue={searchTerm}
              className="w-full sm:w-auto"
            />
          </Suspense>
        </div>
        <div className="space-y-4">
          {filteredCompanies.length === 0 ? (
            <p className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
              {searchTerm
                ? `No companies matched "${searchTerm}".`
                : "No companies found yet. Create your first tenant to get started."}
            </p>
          ) : (
            filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="flex flex-col gap-6 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{company.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/50">
                    <span className={cx("rounded-full px-2 py-1 font-semibold", statusClass(company.status))}>
                      {company.status}
                    </span>
                    <span className="rounded-full bg-foreground/5 px-2 py-1 text-foreground/70">
                      Onboarded {formatDate(company.createdAt)}
                    </span>
                  </div>
                  {company.description ? (
                    <p className="text-sm text-foreground/70">{company.description}</p>
                  ) : (
                    <p className="text-sm text-foreground/50">No description provided yet.</p>
                  )}
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : null}
                </div>

                <form
                  action={updateCompanyStatusAction}
                  className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-surface px-4 py-4 text-sm text-foreground/80 md:w-[260px]"
                >
                  <input type="hidden" name="companyId" value={company.id} />
                  <input type="hidden" name="redirectTo" value={redirectPath} />
                  <label
                    htmlFor={`company-status-${company.id}`}
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50"
                  >
                    Company status
                  </label>
                  <select
                    id={`company-status-${company.id}`}
                    name="status"
                    defaultValue={company.status}
                    className="h-9 rounded-2xl border border-border/70 bg-surface-muted px-3 text-sm text-foreground shadow-[0_6px_18px_rgba(var(--shadow-soft),0.18)] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    {COMPANY_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm">
                    Update status
                  </Button>
                </form>
              </div>
            ))
          )}
        </div>
      </Panel>
    </Container>
  );
}
