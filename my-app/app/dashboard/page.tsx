import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser } from "@/lib/current-user";
import type {
  ApplicationDetails,
  Interview,
  JobPosting,
} from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

async function getCompanyJobs(): Promise<JobPosting[]> {
  try {
    const response = await apiFetch("/api/jobs", { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as JobPosting[]) : [];
  } catch {
    return [];
  }
}

async function getApplicationsForJob(jobId: number): Promise<ApplicationDetails[]> {
  try {
    const response = await apiFetch(`/api/jobs/${jobId}/applications`, { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as ApplicationDetails[]) : [];
  } catch {
    return [];
  }
}

async function getRecruiterInterviews(): Promise<Interview[]> {
  try {
    const response = await apiFetch("/api/interviews/my", { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as Interview[]) : [];
  } catch {
    return [];
  }
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đang hiển thị",
  CLOSED: "Đã đóng",
  APPLIED: "Đã nộp",
  SCREENING: "Đang sàng lọc",
  INTERVIEW: "Phỏng vấn",
  INTERVIEW_SCHEDULED: "Đã lên lịch phỏng vấn",
  OFFERED: "Đề nghị",
  HIRED: "Đã nhận việc",
  REJECTED: "Bị từ chối",
  WITHDRAWN: "Đã rút",
  ON_HOLD: "Tạm dừng",
};

function formatStatus(status: string) {
  const normalized = status.toUpperCase();
  if (STATUS_LABELS[normalized]) {
    return STATUS_LABELS[normalized];
  }
  return status
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Không rõ";
  }
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function formatDateTime(value?: string | null, timezone?: string | null) {
  if (!value) {
    return "Sẽ được lên lịch sớm";
  }
  try {
    const date = new Date(value);
    const formatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      ...(timezone ? { timeZone: timezone } : {}),
    });
    return formatter.format(date);
  } catch {
    return value;
  }
}

export default async function DashboardPage() {
  const viewer = await getCurrentUser();
  if (viewer?.roles.includes("SUPER_ADMIN")) {
    redirect(ROUTES.superAdminDashboard);
  }
  if (viewer?.roles.includes("COMPANY_ADMIN") && !viewer.roles.includes("RECRUITER")) {
    redirect(ROUTES.companyAdminDashboard);
  }

  const canAdminJobs = Boolean(viewer?.roles.includes("COMPANY_ADMIN"));
  const jobs = await getCompanyJobs();
  const applicationsByJob = new Map<number, ApplicationDetails[]>();

  const [jobApplications, interviews] = await Promise.all([
    Promise.all(
      jobs.map(async (job) => ({
        jobId: job.id,
        applications: await getApplicationsForJob(job.id),
      }))
    ),
    getRecruiterInterviews(),
  ]);

  for (const entry of jobApplications) {
    applicationsByJob.set(entry.jobId, entry.applications);
  }

  const allApplications = jobApplications.flatMap((entry) => entry.applications);
  const openJobs = jobs.filter((job) => job.status === "PUBLISHED");
  const activeCandidateIds = new Set(allApplications.map((app) => app.candidateId));

  const pipelineCounts = allApplications.reduce<Record<string, number>>((acc, app) => {
    const key = app.status;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const upcomingInterviews = interviews
    .slice()
    .sort((a, b) => {
      const aTime = a.scheduleTime ? new Date(a.scheduleTime).getTime() : Infinity;
      const bTime = b.scheduleTime ? new Date(b.scheduleTime).getTime() : Infinity;
      return aTime - bTime;
    })
    .slice(0, 5);

  const recentApplications = allApplications
    .slice()
    .sort((a, b) => {
      const aTime = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
      const bTime = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 8);

  const awaitingReview = allApplications.filter((application) =>
    ["APPLIED", "SCREENING"].includes(application.status)
  ).length;

  const summaryMetrics = [
    {
      label: "Vị trí đang mở",
      value: openJobs.length,
      helper: "Các vị trí hiện đang hiển thị cho ứng viên.",
    },
    {
      label: "Ứng viên trong pipeline",
      value: activeCandidateIds.size,
      helper: "Hồ sơ bạn đang theo dõi và chăm sóc.",
    },
    {
      label: "Đang chờ xử lý",
      value: awaitingReview,
      helper: "Ứng viên cần được phản hồi tiếp theo.",
    },
    {
      label: "Phỏng vấn sắp diễn ra",
      value: upcomingInterviews.length,
      helper: "Cuộc phỏng vấn đã lên lịch trong vài ngày tới.",
    },
  ];

  const quickActions = [
    {
      label: "Xem hồ sơ mới",
      href: "#applications",
      description: "Duyệt các hồ sơ vừa nộp và ghi chú cho quản lý tuyển dụng.",
    },
    {
      label: "Xử lý điểm tắc pipeline",
      href: "#pipeline",
      description: "Phát hiện nút thắt giữa các giai đoạn và phân bổ lại công việc.",
    },
    {
      label: "Chuẩn bị phỏng vấn",
      href: "#interviews",
      description: "Xác nhận lịch, chia sẻ agenda và phân công người theo dõi.",
    },
    {
      label: "Theo dõi hiệu quả tuyển dụng",
      href: "#job-health",
      description: "Xem vị trí nào cần bổ sung nguồn ứng viên hoặc phản hồi nhanh hơn.",
    },
  ];

  const heroHighlights = [
    `Có ${allApplications.length} hồ sơ trong pipeline của bạn.`,
    `${awaitingReview} ứng viên đang chờ phản hồi.`,
    `${upcomingInterviews.length} buổi phỏng vấn sắp diễn ra cần chuẩn bị.`,
  ];

  return (
    <Container className="space-y-10">
      <Panel variant="glass" padding="lg" className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
              Không gian nhà tuyển dụng
            </span>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Điều phối việc làm, ứng viên và phỏng vấn trên cùng một nền tảng.
            </h1>
            <p className="max-w-2xl text-sm text-foreground/70">
              Theo sát pipeline tuyển dụng với ưu tiên rõ ràng, bối cảnh từ hoạt động gần nhất và đường dẫn hành động nhanh nhất.
            </p>
            <ul className="space-y-2 text-sm text-foreground/70">
              {heroHighlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-accent" aria-hidden />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 rounded-3xl border border-foreground/10 bg-surface/90 p-6 shadow-[0_18px_32px_rgba(15,23,42,0.14)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
              Trọng tâm hôm nay
            </p>
            <p className="text-sm text-foreground/70">
              Bắt đầu với các ứng viên đang chờ liên hệ, sau đó rà soát lịch phỏng vấn để đảm bảo chuẩn bị và người theo dõi.
            </p>
            <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-xs text-accent">
              Duy trì tốc độ phản hồi: hãy xác nhận mọi hồ sơ mới trong vòng 24 giờ.
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-foreground/10 bg-surface/95 p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] transition hover:border-accent/30 hover:shadow-[0_20px_36px_rgba(15,23,42,0.12)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{metric.value}</p>
              <p className="mt-1 text-xs text-foreground/60">{metric.helper}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel variant="surface" padding="lg" className="space-y-6">
        <header className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Hành động nhanh</h2>
          <p className="text-sm text-foreground/60">
            Truy cập ngay các khu vực giữ pipeline luôn thông suốt và thúc đẩy ứng viên tiến bước.
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 text-sm text-foreground/70 transition hover:border-accent/40 hover:text-foreground hover:shadow-[0_22px_40px_rgba(15,23,42,0.12)]"
            >
              <span className="text-sm font-semibold text-foreground">{action.label}</span>
              <span className="text-xs">{action.description}</span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent transition group-hover:translate-x-0.5">
                Thực hiện ngay
                <span aria-hidden>&gt;</span>
              </span>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel id="jobs" variant="surface" padding="lg" className="space-y-6">
        <header className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Danh mục việc làm</h2>
          <p className="text-sm text-foreground/60">
            Rà soát các vị trí bạn đang hỗ trợ tuyển dụng. {canAdminJobs
              ? "Chuyển sang workspace quản trị công ty khi cần đăng, tạm dừng hoặc chỉnh sửa bài tuyển dụng."
              : "Chỉ quản trị viên công ty mới có thể tạo hoặc chỉnh sửa bài đăng. Hãy liên hệ quản trị khi cần thay đổi."}
          </p>
          {canAdminJobs ? (
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`${ROUTES.companyAdminDashboard}#jobs`}>
                <Button size="sm" variant="secondary">
                  Mở trang quản trị việc làm
                </Button>
              </Link>
              <Link href={`${ROUTES.companyAdminDashboard}#team`}>
                <Button size="sm" variant="ghost">
                  Quản lý quyền truy cập
                </Button>
              </Link>
            </div>
          ) : null}
        </header>
        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
            Chưa có bài đăng. Liên hệ quản trị công ty để mở vị trí đầu tiên.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 shadow-[0_12px_22px_rgba(15,23,42,0.08)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{job.title}</p>
                    <p className="text-xs text-foreground/60">
                      Trạng thái {formatStatus(job.status)} • Cập nhật {formatDate(job.updatedAt)}
                    </p>
                  </div>
                  <Link
                    href={`${ROUTES.jobs}/${job.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition hover:text-foreground"
                  >
                    Xem bài tuyển dụng
                    <span aria-hidden>&gt;</span>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/55">
                  {job.location ? <span>{job.location}</span> : null}
                  {job.workType ? (
                    <span className="flex items-center gap-1 before:block before:h-1 before:w-1 before:rounded-full before:bg-foreground/40">
                      {job.workType.toLowerCase()}
                    </span>
                  ) : null}
                  {job.salaryRange ? (
                    <span className="flex items-center gap-1 before:block before:h-1 before:w-1 before:rounded-full before:bg-foreground/40">
                      {job.salaryRange}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-foreground/50">
                  {canAdminJobs
                    ? "Cần chỉnh sửa? Vào workspace quản trị công ty để cập nhật bài tuyển dụng."
                    : "Cần cập nhật? Hãy nhờ quản trị công ty điều chỉnh nội dung."}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel id="pipeline" variant="surface" padding="lg" className="space-y-4">
          <header>
            <h2 className="text-lg font-semibold text-foreground">Tổng quan pipeline</h2>
            <p className="text-sm text-foreground/60">
              Tổng hợp từ toàn bộ hồ sơ của công ty. Cập nhật trạng thái ở bất kỳ hồ sơ nào, số liệu sẽ tự động thay đổi.
            </p>
          </header>
          {allApplications.length === 0 ? (
            <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-4 py-6 text-sm text-foreground/60">
              Chưa có hồ sơ nào. Mời ứng viên hoặc đăng tuyển vị trí mới để bắt đầu xây dựng pipeline.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(pipelineCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3 text-sm shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
                >
                  <span className="text-foreground/70">{formatStatus(status)}</span>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel id="interviews" variant="surface" padding="lg" className="space-y-4">
          <header>
            <h2 className="text-lg font-semibold text-foreground">Phỏng vấn sắp diễn ra</h2>
            <p className="text-sm text-foreground/60">
              Xem năm cuộc trao đổi tiếp theo trên lịch của bạn. Có thể đổi lịch hoặc ghi nhận phản hồi ngay tại khu vực phỏng vấn.
            </p>
          </header>

          {upcomingInterviews.length === 0 ? (
            <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-4 py-6 text-sm text-foreground/60">
              Chưa có phỏng vấn nào. Hãy phối hợp với ứng viên để đưa họ tiến lên.
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3 shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Đơn ứng tuyển #{interview.applicationId}</span>
                    <span className="text-xs text-foreground/60">
                      {formatDateTime(interview.scheduleTime, interview.timezone)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/55">
                    {interview.format ?? "Hình thức cập nhật sau"} -{" "}
                    {interview.locationOrLink ? interview.locationOrLink : "Địa điểm sẽ được thông báo"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel id="applications" variant="surface" padding="lg" className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-foreground">Hồ sơ mới nhất</h2>
          <p className="text-sm text-foreground/60">
            Hoạt động gần đây trong pipeline. Nhấp để xem ghi chú, cập nhật trạng thái hoặc thêm phản hồi.
          </p>
        </header>

        {recentApplications.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-4 py-6 text-sm text-foreground/60">
            Chưa có dữ liệu. Hồ sơ sẽ xuất hiện tại đây ngay khi ứng viên nộp.
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {recentApplications.map((application) => (
              <Link
                key={application.id}
                href={`${ROUTES.recruiterDashboard}/applications/${application.id}`}
                className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 transition hover:border-accent/30 hover:bg-surface/80"
              >
                <div>
                  <p className="font-semibold text-foreground">Hồ sơ #{application.id}</p>
                  <p className="text-xs text-foreground/50">
                    Vị trí #{application.jobPostingId} • Nộp ngày {formatDate(application.appliedAt)}
                  </p>
                  <p className="text-xs text-foreground/50">
                    Ứng viên {application.candidateName ?? `#${application.candidateId}`}
                  </p>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  {formatStatus(application.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Panel>

      <Panel id="job-health" variant="surface" padding="lg" className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-foreground">Sức khỏe tuyển dụng</h2>
          <p className="text-sm text-foreground/60">
            Theo dõi số lượng hồ sơ theo từng vị trí và nhận diện các vai trò cần thêm nguồn ứng viên hoặc phản hồi nhanh hơn.
          </p>
        </header>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface/90 px-4 py-6 text-sm text-foreground/60">
            Chưa có vị trí nào cho công ty của bạn. Tạo bài đăng tuyển dụng để hiển thị dữ liệu.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-foreground/10 bg-surface/95 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
            <table className="min-w-full divide-y divide-foreground/10 text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.28em] text-foreground/50">
                <tr>
                  <th className="px-4 py-3">Vị trí</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Số hồ sơ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {jobs.map((job) => {
                  const applications = applicationsByJob.get(job.id) ?? [];
                  return (
                    <tr key={job.id}>
                      <td className="px-4 py-3 text-sm text-foreground">{job.title}</td>
                      <td className="px-4 py-3 text-sm text-foreground/70">{formatStatus(job.status)}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">{applications.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </Container>
  );
}

