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

function statusLabel(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "Hoạt động";
    case "INACTIVE":
      return "Ngưng hoạt động";
    case "PENDING":
    default:
      return "Đang xét";
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
          <h1 className="text-2xl font-semibold text-text sm:text-3xl">Quản lý người dùng</h1>
          <p className="text-sm text-muted">
            Hãy tạo tenant công ty trước, sau đó bạn có thể mời quản trị viên và nhà tuyển dụng quản lý pipeline.
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
            <h1 className="text-2xl font-semibold text-text sm:text-3xl">Quản lý người dùng</h1>
            <p className="mt-2 text-sm text-muted">
              Khóa hoặc mở khóa quyền truy cập của quản trị viên và nhà tuyển dụng trên mọi tenant.
            </p>
          </div>
          <SuperAdminCompanySwitcher
            companies={companies.map((company) => ({ id: company.id, name: company.name }))}
            selectedCompanyId={selectedCompany.id}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-text/50">
          <span className="rounded-full bg-foreground/5 px-2 py-1 text-muted">{selectedCompany.name}</span>
          <span className={`rounded-full px-2 py-1 ${statusClass(selectedCompany.status)}`}>
            {statusLabel(selectedCompany.status)}
          </span>
          <span className="rounded-full bg-foreground/5 px-2 py-1 text-muted">
            {numberFormatter.format(users.length)} thành viên
          </span>
          <span className="rounded-full bg-foreground/5 px-2 py-1 text-muted">
            {numberFormatter.format(activeUsers)} đang hoạt động
          </span>
          <span className="rounded-full bg-foreground/5 px-2 py-1 text-muted">
            {numberFormatter.format(lockedUsers)} bị khóa
          </span>
        </div>
      </Panel>

      <Panel className="space-y-6" padding="lg">
        <div>
          <h2 className="text-xl font-semibold text-text">Danh sách thành viên</h2>
          <p className="text-sm text-muted">
            Đảm bảo quyền truy cập phù hợp với kỳ vọng của công ty. Tài khoản bị khóa sẽ không đăng nhập được cho tới khi bạn mở lại.
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
