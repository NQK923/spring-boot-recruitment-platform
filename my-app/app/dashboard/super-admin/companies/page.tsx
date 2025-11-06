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
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "PENDING", label: "Đang xét" },
  { value: "INACTIVE", label: "Ngưng hoạt động" },
];

const numberFormatter = new Intl.NumberFormat();
const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

function formatDate(value: string | null): string {
  if (!value) {
    return "Vừa tham gia";
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
            <h1 className="text-2xl font-semibold text-text sm:text-3xl">Workspace quản trị cấp cao</h1>
            <p className="mt-2 text-sm text-muted">
              Giám sát mọi tenant, đảm bảo quy trình onboard thông suốt và mỗi công ty đều có người phụ trách phù hợp.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-text/50">Số công ty</p>
              <p className="mt-2 text-2xl font-semibold text-text">
                {numberFormatter.format(dashboard?.totalCompanies ?? companies.length)}
              </p>
              <p className="text-xs text-muted">Tenant đã đăng ký trên nền tảng</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-text/50">Vị trí đang mở</p>
              <p className="mt-2 text-2xl font-semibold text-text">
                {numberFormatter.format(dashboard?.totalJobPostings ?? 0)}
              </p>
              <p className="text-xs text-muted">Bài tuyển dụng đang hiển thị trên toàn bộ tenant</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-text/50">Hồ sơ ứng tuyển</p>
              <p className="mt-2 text-2xl font-semibold text-text">
                {numberFormatter.format(dashboard?.totalApplications ?? 0)}
              </p>
              <p className="text-xs text-muted">Hồ sơ ứng viên đã nhận</p>
            </div>
          </div>
          {topCompanies.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-text/50">Công ty tuyển dụng tích cực</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {topCompanies.slice(0, 4).map((company) => (
                  <li key={company.companyId} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2">
                    <span className="font-medium text-text">{company.companyName}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-text/50">
                      {numberFormatter.format(company.openRoles)} vị trí mở
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
              <h2 className="text-lg font-semibold text-text">Tạo công ty mới</h2>
              <p className="text-sm text-muted">Khởi tạo workspace riêng và có thể gán người phụ trách sau.</p>
            </div>
            <CreateCompanyForm />
          </Panel>

          <Panel className="space-y-4" padding="lg">
            <div>
              <h2 className="text-lg font-semibold text-text">Mời quản trị công ty</h2>
              <p className="text-sm text-muted">
                Gửi lời mời để chủ công ty cấu hình tenant và thêm thành viên.
              </p>
            </div>
            {companyOptions.length > 0 ? (
              <InviteCompanyUserForm companies={companyOptions} />
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted">
                Hãy tạo công ty trước khi gửi lời mời.
              </p>
            )}
          </Panel>
        </div>
      </div>

      <Panel className="space-y-6" padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text">Danh sách công ty</h2>
            <p className="text-sm text-muted">
              Rà soát trạng thái và theo dõi tenant nào đã sẵn sàng vận hành.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="h-10 w-full max-w-sm rounded-2xl bg-surface" />
            }
          >
            <DebouncedSearchInput
              param="query"
              placeholder="Tìm công ty theo tên hoặc website"
              initialValue={searchTerm}
              className="w-full sm:w-auto"
            />
          </Suspense>
        </div>
        <div className="space-y-4">
          {filteredCompanies.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface px-5 py-6 text-sm text-muted">
              {searchTerm
                ? `Không tìm thấy công ty khớp với "${searchTerm}".`
                : "Chưa có công ty nào. Hãy tạo tenant đầu tiên để bắt đầu."}
            </p>
          ) : (
            filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="flex flex-col gap-6 rounded-2xl border border-border bg-surface px-5 py-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-text">{company.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-text/50">
                    <span className={cx("rounded-full px-2 py-1 font-semibold", statusClass(company.status))}>
                      {statusLabel(company.status)}
                    </span>
                    <span className="rounded-full bg-foreground/5 px-2 py-1 text-muted">
                      Tham gia {formatDate(company.createdAt)}
                    </span>
                  </div>
                  {company.description ? (
                    <p className="text-sm text-muted">{company.description}</p>
                  ) : (
                    <p className="text-sm text-text/50">Chưa có mô tả.</p>
                  )}
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : null}
                </div>

                <form
                  action={updateCompanyStatusAction}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-4 text-sm text-text/80 md:w-[260px]"
                >
                  <input type="hidden" name="companyId" value={company.id} />
                  <input type="hidden" name="redirectTo" value={redirectPath} />
                  <label
                    htmlFor={`company-status-${company.id}`}
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-text/50"
                  >
                    Trạng thái công ty
                  </label>
                  <select
                    id={`company-status-${company.id}`}
                    name="status"
                    defaultValue={company.status}
                    className="h-9 rounded-2xl border border-border bg-surface px-3 text-sm text-text shadow-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                  >
                    {COMPANY_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm">
                    Cập nhật trạng thái
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
