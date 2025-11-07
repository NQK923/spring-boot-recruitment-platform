import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { SuperAdminCompanySwitcher } from "@/components/super-admin/company-switcher";
import { SuperAdminUsersPanel } from "@/components/super-admin/users-panel";
import { fetchSuperAdminCompanies, fetchCompanyUsers } from "@/app/dashboard/super-admin/data";

const numberFormatter = new Intl.NumberFormat();

function statusClass(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700";
    case "INACTIVE":
      return "bg-gradient-to-r from-red-100 to-pink-100 text-red-700";
    case "PENDING":
    default:
      return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700";
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
      <Container className="py-12">
        <Panel className="space-y-4 border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50" padding="lg">
          <h1 className="text-3xl font-bold text-amber-900 sm:text-4xl flex items-center gap-2">
            👥 Quản lý người dùng
          </h1>
          <p className="text-base leading-relaxed text-slate-700 font-medium">
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
    <Container className="space-y-8 py-12">
      <Panel className="space-y-6 border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50" padding="lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900 sm:text-4xl flex items-center gap-2">
              👥 Quản lý người dùng
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-700 font-medium">
              Khóa hoặc mở khóa quyền truy cập của quản trị viên và nhà tuyển dụng trên mọi tenant.
            </p>
          </div>
          <SuperAdminCompanySwitcher
            companies={companies.map((company) => ({ id: company.id, name: company.name }))}
            selectedCompanyId={selectedCompany.id}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider font-bold">
          <span className="rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 text-blue-700">
            🏢 {selectedCompany.name}
          </span>
          <span className={`rounded-full px-3 py-1.5 ${statusClass(selectedCompany.status)}`}>
            {statusLabel(selectedCompany.status)}
          </span>
          <span className="rounded-full bg-gradient-to-r from-slate-100 to-gray-100 px-3 py-1.5 text-slate-700">
            👤 {numberFormatter.format(users.length)} thành viên
          </span>
          <span className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1.5 text-emerald-700">
            ✅ {numberFormatter.format(activeUsers)} đang hoạt động
          </span>
          <span className="rounded-full bg-gradient-to-r from-red-100 to-pink-100 px-3 py-1.5 text-red-700">
            🔒 {numberFormatter.format(lockedUsers)} bị khóa
          </span>
        </div>
      </Panel>

      <Panel className="space-y-6 border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50" padding="lg">
        <div>
          <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
            📋 Danh sách thành viên
          </h2>
          <p className="text-sm text-slate-700 font-medium mt-1">
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
