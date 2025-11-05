import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
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
      recruiterId: job.recruiterId ?? job.recruiter_id ?? null,
      jobPosition: job.jobPosition ?? job.job_position ?? null,
      createdAt: job.createdAt ?? job.created_at ?? "",
      updatedAt: job.updatedAt ?? job.updated_at ?? "",
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
    <Container className="max-w-5xl space-y-10">
      <Panel id="overview" variant="glass" padding="lg" className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
              Bảng điều khiển quản trị công ty
            </span>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Giữ workspace đồng bộ và sẵn sàng tuyển dụng.
            </h1>
            <p className="max-w-2xl text-sm text-foreground/70">
              Mời đồng đội, chăm chút hình ảnh thương hiệu và theo dõi các vị trí đang mở tại một trung tâm duy nhất.
            </p>
            <ul className="space-y-3 text-sm text-foreground/70">
              {insights.map((insight, index) => (
                <li key={`${insight}-${index}`} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent/70" aria-hidden />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-gradient-to-br from-surface via-surface/85 to-surface/95 p-6 shadow-[0_18px_32px_rgba(15,23,42,0.15)]">
            <div className="pointer-events-none absolute -top-14 right-0 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-6 h-28 w-28 rounded-full bg-foreground/10 blur-3xl" />
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Tình trạng workspace
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-foreground/60">Quy mô đội ngũ</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{users.length}</p>
                  <p className="text-xs text-foreground/60">Thành viên đang cộng tác trong hôm nay.</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60">Vị trí đã đăng</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{publishedJobs.length}</p>
                  <p className="text-xs text-foreground/60">Đang hiển thị với ứng viên.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-surface/85 px-4 py-3 text-xs text-foreground/70">
                {profile?.companySize
                  ? `Quy mô công ty: ${profile.companySize}.`
                  : "Chia sẻ quy mô để ứng viên biết kỳ vọng."}
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-foreground/10 bg-surface/80 px-4 py-3 text-xs text-foreground/60">
              {profile?.createdAt
                ? `Đã tham gia từ ${formatDate(profile.createdAt)}.`
                : "Hoàn thiện hồ sơ công ty để xem phân tích chi tiết hơn."}
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="group rounded-2xl border border-foreground/10 bg-surface/95 p-5 text-sm text-foreground/70 shadow-[0_10px_22px_rgba(15,23,42,0.08)] transition hover:border-accent/30 hover:shadow-[0_22px_36px_rgba(15,23,42,0.14)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{metric.value}</p>
              <p className="mt-2 text-xs">{metric.helper}</p>
              {metric.footnote ? (
                <p className="mt-3 text-xs text-foreground/60">{metric.footnote}</p>
              ) : null}
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col gap-2 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 text-sm text-foreground/75 transition hover:border-accent/40 hover:text-foreground hover:shadow-[0_20px_34px_rgba(15,23,42,0.12)]"
            >
              <span className="text-sm font-semibold text-foreground">{action.label}</span>
              <p className="text-xs text-foreground/60">{action.description}</p>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent transition group-hover:translate-x-0.5">
                Đi tới khu vực
                <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel id="company" variant="surface" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Tổng quan công ty</h2>
            <p className="text-sm text-foreground/60">
              Kiểm tra lại thông tin thương hiệu, địa điểm tuyển dụng và lộ trình mở vị trí trước khi mời thêm thành viên.
            </p>
          </div>
          <Link href={ROUTES.docs} className="text-sm font-semibold text-foreground hover:underline">
            Hướng dẫn cập nhật
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] text-sm text-foreground/70">
          <div className="space-y-4 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Thông tin công ty</p>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{profile?.name ?? "Chưa cập nhật"}</p>
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
                <p className="text-xs text-foreground/50">Thêm website để ứng viên tìm hiểu thêm.</p>
              )}
            </div>
            <p className="text-xs text-foreground/60">
              {profile?.description ?? "Thêm mô tả để nhà tuyển dụng có bối cảnh phù hợp."}
            </p>
            <p className="text-xs text-foreground/60">
              <span className="font-semibold text-foreground">Quy mô công ty:</span>{" "}
              {profile?.companySize ?? "Chia sẻ quy mô nhân sự để đặt kỳ vọng phù hợp với ứng viên."}
            </p>
          </div>
          <div className="space-y-4 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Trụ sở</p>
            <p className="font-semibold text-foreground">
              {profile?.companyAddress ?? "Thêm địa chỉ văn phòng chính hoặc trụ sở."}
            </p>
            <p className="text-xs text-foreground/60">Gia nhập Talentflow từ {formatDate(profile?.createdAt)}</p>
            <div>
              <h3 className="text-xs uppercase tracking-[0.28em] text-muted">Cập nhật chi tiết</h3>
              <p className="text-xs text-foreground/60">
                Giữ thông điệp thương hiệu luôn mới. Thay đổi sẽ áp dụng ngay cho mọi bài tuyển dụng.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-surface/95 p-5">
          <UpdateCompanyForm profile={profileForForm} />
        </div>
      </Panel>

      <Panel id="team" variant="surface" padding="lg" className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Danh sách thành viên</h2>
          <p className="text-sm text-foreground/60">
            Quản trị viên công ty phụ trách phân quyền, trong khi nhà tuyển dụng quản lý từng vị trí và pipeline.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
            <span className="inline-flex items-center rounded-full border border-foreground/15 bg-surface px-3 py-1 font-semibold uppercase tracking-[0.2em] text-foreground/70">
              {users.length} đang hoạt động
            </span>
            <span className="inline-flex items-center rounded-full border border-foreground/15 bg-surface px-3 py-1 uppercase tracking-[0.2em]">
              {pendingInvitationCount} lời mời chờ phản hồi
            </span>
            {lockedUsers > 0 ? (
              <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-accent">
                {lockedUsers} bị khóa
              </span>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-surface/95 p-5">
          <InviteMemberForm />
        </div>
        <CompanyMembersPanel users={users} />
      </Panel>

      <Panel id="jobs" variant="surface" padding="lg" className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Danh mục việc làm</h2>
          <p className="text-sm text-foreground/60">
            Tạo nháp, đăng hoặc tạm dừng vị trí ngay tại workspace này. Thay đổi sẽ đồng bộ tức thì với bảng việc làm công khai.
          </p>
        </div>

        <CreateJobForm positions={positions} />

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
            Chưa có việc làm nào được tạo. Hãy tạo nháp để khởi động pipeline tuyển dụng.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {jobs.map((job) => (
              <CompanyJobCard key={job.id} job={job} positions={positions} />
            ))}
          </div>
        )}
      </Panel>

      <Panel id="invites" variant="surface" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Lời mời đang xử lý</h2>
            <p className="text-sm text-foreground/60">
              Theo dõi lời mời đang chờ để đồng đội không bỏ lỡ email chào mừng.
            </p>
          </div>
          <Link href="/docs/admin#reminders" className="text-sm font-semibold text-foreground hover:underline">
            Mẫu nhắc nhở
          </Link>
        </div>
        {recentInvites.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
            Không có lời mời nào còn tồn đọng. Bạn đang quản lý đội ngũ rất tốt!
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
                  <p className="text-xs text-foreground/60">{invite.role ?? "Vai trò sẽ cập nhật"}</p>
                </div>
                <p className="text-xs text-foreground/50">
                  Đã gửi {invite.invitedAt ? formatDate(invite.invitedAt) : "gần đây"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </Container>
  );
}


