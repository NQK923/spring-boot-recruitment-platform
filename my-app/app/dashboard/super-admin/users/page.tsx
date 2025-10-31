import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { SuperAdminCompanySwitcher } from "@/components/super-admin/company-switcher";
import { SuperAdminUsersPanel } from "@/components/super-admin/users-panel";
import { fetchSuperAdminCompanies, fetchCompanyUsers } from "@/app/dashboard/super-admin/data";

const numberFormatter = new Intl.NumberFormat();

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

type SuperAdminUsersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SuperAdminUsersPage({ searchParams }: SuperAdminUsersPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedCompanyId = Number(resolvedSearchParams.companyId);

  const companies = await fetchSuperAdminCompanies();

  if (companies.length === 0) {
    return (
      <Container className="py-10">
        <Panel className="space-y-4" padding="lg">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">User management</h1>
          <p className="text-sm text-foreground/60">
            Create a company tenant first, then you can invite admins and recruiters to manage their hiring pipeline.
          </p>
        </Panel>
      </Container>
    );
  }

  const fallbackCompany = companies[0];
  const selectedCompany =
    companies.find((company) => Number.isFinite(requestedCompanyId) && company.id === requestedCompanyId) ??
    fallbackCompany;

  const users = await fetchCompanyUsers(selectedCompany.id);
  const lockedUsers = users.filter((user) => user.locked).length;
  const activeUsers = users.length - lockedUsers;

  return (
    <Container className="space-y-8 py-10">
      <Panel className="space-y-6" padding="lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">User management</h1>
            <p className="mt-2 text-sm text-foreground/60">
              Lock or unlock access for company admins and recruiters across every tenant.
            </p>
          </div>
          <SuperAdminCompanySwitcher
            companies={companies.map((company) => ({ id: company.id, name: company.name }))}
            selectedCompanyId={selectedCompany.id}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-foreground/50">
          <span className="rounded-full bg-foreground/5 px-2 py-1 text-foreground/70">{selectedCompany.name}</span>
          <span className={`rounded-full px-2 py-1 ${statusClass(selectedCompany.status)}`}>
            {selectedCompany.status}
          </span>
          <span className="rounded-full bg-foreground/5 px-2 py-1 text-foreground/70">
            {numberFormatter.format(users.length)} member{users.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-foreground/5 px-2 py-1 text-foreground/70">
            {numberFormatter.format(activeUsers)} active
          </span>
          <span className="rounded-full bg-foreground/5 px-2 py-1 text-foreground/70">
            {numberFormatter.format(lockedUsers)} locked
          </span>
        </div>
      </Panel>

      <Panel className="space-y-6" padding="lg">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Team roster</h2>
          <p className="text-sm text-foreground/60">
            Keep access aligned with company expectations. Locked accounts cannot sign in until you reactivate them.
          </p>
        </div>
        <SuperAdminUsersPanel
          companyId={selectedCompany.id}
          companyName={selectedCompany.name}
          users={users}
        />
      </Panel>
    </Container>
  );
}
