import Link from "next/link";
import { Container } from "@/components/ui/container";
import { UpdateCompanyForm } from "@/components/company-admin/update-company-form";
import { InviteMemberForm } from "@/components/company-admin/invite-member-form";
import { CompanyMembersPanel } from "@/components/company-admin/company-members-panel";
import { CompanyJobCard } from "@/components/company-admin/company-job-card";
import { CreateJobForm } from "@/components/jobs/create-job-form";
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
      recruiter_id?: number | null;
      recruiterId?: number | null;
      createdAt?: string | null;
      updatedAt?: string | null;
      salary_range?: string | null;
      work_type?: string | null;
      hiring_quantity?: number | string | null;
      hiring_count?: number | string | null;
    };
    return (data as JobPostingApi[]).map((job, index) => {
      const rawHiringQuantity = job.hiringQuantity ?? job.hiring_quantity ?? job.hiring_count ?? 1;
      return {
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
        recruiterId: job.recruiterId ?? job.recruiter_id ?? null,
        jobPosition: job.jobPosition ?? job.job_position ?? null,
        createdAt: job.createdAt ?? job.created_at ?? "",
        updatedAt: job.updatedAt ?? job.updated_at ?? "",
        hiringQuantity:
          typeof rawHiringQuantity === "number"
            ? rawHiringQuantity
            : Number(rawHiringQuantity) || 1,
      } satisfies JobPosting;
    });
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
  if (!value) return "Không rõ";
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
  const pendingInvitationCount = dashboard?.pendingInvites ?? 0;
  const lockedUsers = users.filter((user) => user.locked).length;
  const unassignedJobs = jobs.filter((job) => !job.recruiterId).length;

  const metrics = [
    {
      label: "Thành viên đội ngũ",
      value: users.length,
      helper: "Quản trị viên, nhà tuyển dụng và cộng tác viên có quyền truy cập.",
      footnote: lockedUsers
        ? `${lockedUsers} tài khoản cần được mở khóa.`
        : undefined,
    },
    {
      label: "Việc làm đang hiển thị",
      value: dashboard?.activeJobs ?? publishedJobs.length,
      helper: "Các vị trí đang hiển thị với ứng viên.",
      footnote: publishedJobs.length === 0 ? "Chưa có vị trí nào được đăng." : undefined,
    },
    {
      label: "Lời mời đang chờ",
      value: pendingInvitationCount,
      helper: "Lời mời đã gửi nhưng chưa được chấp nhận.",
    },
    {
      label: "Việc chưa có phụ trách",
      value: unassignedJobs,
      helper: "Bài đăng chưa có nhà tuyển dụng phụ trách.",
    },
  ];

  const quickActions = [
    {
      label: "Mời thành viên",
      href: "#team",
      description: "Gửi lời mời theo vai trò trong vài giây.",
    },
    {
      label: "Cập nhật hồ sơ công ty",
      href: "#company",
      description: "Trau chuốt thông tin thương hiệu và dữ liệu hiển thị công khai.",
    },
    {
      label: "Đăng việc làm",
      href: "#jobs",
      description: "Mở vị trí mới trên bảng việc làm cho ứng viên.",
    },
  ];

  const insights = [
    lockedUsers > 0
      ? `Mở khóa ${lockedUsers} tài khoản để thành viên có thể đăng nhập.`
      : null,
    pendingInvitationCount > 0
      ? `Nhắc lại ${pendingInvitationCount} lời mời đang chờ phản hồi.`
      : null,
    unassignedJobs > 0
      ? `${unassignedJobs} vị trí vẫn chưa có nhà tuyển dụng phụ trách.`
      : null,
  ].filter(Boolean) as string[];

  if (insights.length === 0) {
    insights.push("Workspace của bạn đang hoạt động rất tốt. Tiếp tục cập nhật thường xuyên để đáp ứng nhu cầu tuyển dụng.");
  }

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
    <Container className="max-w-5xl space-y-12 py-16">
      <div id="overview" className="space-y-10 rounded-3xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-10 shadow-md">
        <div className="space-y-6 text-center">
          <div className="mx-auto inline-block rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md">
            Bảng điều khiển quản trị công ty
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            {profile?.name ?? "Workspace của bạn"}
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-800">
            Mời đồng đội, quản lý việc làm và theo dõi tình trạng tuyển dụng tại một nơi.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="group rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-300"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                {metric.label}
              </p>
              <p className="mt-5 text-5xl font-bold text-gray-900">{metric.value}</p>
              <p className="mt-4 text-sm leading-relaxed text-gray-800">{metric.helper}</p>
              {metric.footnote ? (
                <p className="mt-3 text-xs text-amber-700 font-medium">{metric.footnote}</p>
              ) : null}
            </div>
          ))}
        </div>
        {insights.length > 0 && (
          <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800 mb-4">Cần chú ý</h3>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={`${insight}-${index}`} className="flex items-start gap-3 text-sm text-gray-900">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" aria-hidden />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col gap-3 rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30 px-6 py-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-300"
            >
              <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{action.label}</span>
              <p className="text-sm leading-relaxed text-gray-800">{action.description}</p>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition group-hover:gap-3">
                Đi tới
                <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div id="company" className="space-y-8 rounded-3xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-10 shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Tổng quan công ty</h2>
            <p className="mt-3 text-base text-slate-600">
              Kiểm tra lại thông tin thương hiệu, địa điểm tuyển dụng và lộ trình mở vị trí trước khi mời thêm thành viên.
            </p>
          </div>
          <Link href={ROUTES.docs} className="group inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105">
            Hướng dẫn cập nhật
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 text-sm">
          <div className="space-y-6 rounded-2xl border-2 border-blue-100 bg-white px-7 py-6 shadow-md transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-r from-blue-600 to-sky-500 p-2">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Thông tin công ty</p>
            </div>
            <div className="space-y-3">
              <p className="text-xl font-bold text-slate-900">{profile?.name ?? "Chưa cập nhật"}</p>
              {profile?.website ? (
                <a
                  href={profile.website}
                  className="block text-sm font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.website}
                </a>
              ) : (
                <p className="text-sm text-slate-500 italic">Thêm website để ứng viên tìm hiểu thêm.</p>
              )}
            </div>
            <div className="rounded-xl bg-slate-50/80 p-4 border border-blue-100">
              <p className="text-sm leading-relaxed text-slate-700">
                {profile?.description ?? "Thêm mô tả để nhà tuyển dụng có bối cảnh phù hợp."}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-600">👥</span>
              <p className="text-sm text-slate-700">
                <span className="font-bold text-slate-900">Quy mô:</span>{" "}
                {profile?.companySize ?? "Chia sẻ quy mô nhân sự để đặt kỳ vọng phù hợp với ứng viên."}
              </p>
            </div>
          </div>
          <div className="space-y-6 rounded-2xl border-2 border-blue-100 bg-white px-7 py-6 shadow-md transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-r from-blue-600 to-sky-500 p-2">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Trụ sở</p>
            </div>
            <div className="rounded-xl bg-slate-50/80 p-4 border border-blue-100">
              <p className="text-base font-bold text-slate-900">
                {profile?.companyAddress ?? "Thêm địa chỉ văn phòng chính hoặc trụ sở."}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border border-blue-100">
              <span className="text-blue-600">📅</span>
              <p className="text-sm text-slate-700">Gia nhập Talentflow từ <span className="font-bold text-slate-900">{formatDate(profile?.createdAt)}</span></p>
            </div>
            <div className="space-y-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 border-2 border-amber-200 shadow-sm">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                <span>💡</span>
                Cập nhật chi tiết
              </h3>
              <p className="text-sm leading-relaxed text-slate-700">
                Giữ thông điệp thương hiệu luôn mới. Thay đổi sẽ áp dụng ngay cho mọi bài tuyển dụng.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border-2 border-blue-100 bg-white p-7 shadow-md">
          <UpdateCompanyForm profile={profileForForm} />
        </div>
      </div>

      <div id="team" className="space-y-8 rounded-3xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-10 shadow-md">
        <div className="space-y-5">
          <h2 className="text-3xl font-bold text-slate-900">Danh sách thành viên</h2>
          <p className="text-base text-slate-600">
            Quản trị viên công ty phụ trách phân quyền, trong khi nhà tuyển dụng quản lý từng vị trí và pipeline.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center rounded-full border-2 border-blue-200 bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2 font-bold uppercase tracking-wider text-white shadow-md">
              {users.length} đang hoạt động
            </span>
            <span className="inline-flex items-center rounded-full border-2 border-slate-200 bg-white px-5 py-2 font-semibold uppercase tracking-wider text-slate-700 shadow-sm">
              {pendingInvitationCount} lời mời chờ
            </span>
            {lockedUsers > 0 ? (
              <span className="inline-flex items-center rounded-full border-2 border-red-200 bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2 font-bold uppercase tracking-wider text-white shadow-md">
                {lockedUsers} bị khóa
              </span>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border-2 border-blue-100 bg-white p-7 shadow-sm">
          <InviteMemberForm />
        </div>
        <CompanyMembersPanel users={users} />
      </div>

      <div id="jobs" className="space-y-8 rounded-3xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-10 shadow-md">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-r from-blue-600 to-sky-500 p-2.5">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Danh mục việc làm</h2>
          </div>
          <p className="text-base text-slate-600 ml-14">
            Tạo nháp, đăng hoặc tạm dừng vị trí ngay tại workspace này. Thay đổi sẽ đồng bộ tức thì với bảng việc làm công khai.
          </p>
        </div>

        <CreateJobForm positions={positions} />

        {jobs.length === 0 ? (
          <div className="rounded-2xl border-2 border-blue-100 bg-white px-8 py-16 text-center shadow-md">
            <div className="mx-auto max-w-md space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-sky-100">
                <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-700">Chưa có việc làm nào được tạo.</p>
              <p className="text-sm text-slate-600">Hãy tạo nháp để khởi động pipeline tuyển dụng.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {jobs.map((job) => (
              <CompanyJobCard key={job.id} job={job} positions={positions} />
            ))}
          </div>
        )}
      </div>

      <div id="invites" className="space-y-8 rounded-3xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-10 shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-r from-blue-600 to-sky-500 p-2.5">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Lời mời đang xử lý</h2>
            </div>
            <p className="text-base text-slate-600 ml-14">
              Theo dõi lời mời đang chờ để đồng đội không bỏ lỡ email chào mừng.
            </p>
          </div>
          <Link href="/docs/admin#reminders" className="group inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105">
            Mẫu nhắc nhở
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        {recentInvites.length === 0 ? (
          <div className="rounded-2xl border-2 border-blue-100 bg-white px-8 py-16 text-center shadow-md">
            <div className="mx-auto max-w-md space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-700">Không có lời mời nào còn tồn đọng.</p>
              <p className="text-sm text-slate-600">Bạn đang quản lý đội ngũ rất tốt!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            {recentInvites.map((invite, index) => (
              <div
                key={`${invite.email}-${index}`}
                className="group flex flex-col gap-3 rounded-2xl border-2 border-blue-100 bg-white px-7 py-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-300 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gradient-to-r from-blue-600 to-sky-500 p-2">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">{invite.email ?? "pending@email.com"}</p>
                    <p className="text-sm text-slate-600">{invite.role ?? "Vai trò sẽ cập nhật"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50/80 px-4 py-2 border border-blue-100">
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-slate-600">
                    Đã gửi <span className="font-semibold text-slate-900">{invite.invitedAt ? formatDate(invite.invitedAt) : "gần đây"}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}


