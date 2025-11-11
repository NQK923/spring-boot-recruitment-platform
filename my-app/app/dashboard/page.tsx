import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser } from "@/lib/current-user";
import type {
  Application,
  ApplicationDetails,
  Interview,
  JobPosting,
} from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

async function getCompanyJobs(companyId: number | null): Promise<JobPosting[]> {
  if (!companyId) {
    return [];
  }
  try {
    const response = await apiFetch("/api/jobs", {
      method: "GET",
      headers: {
        "X-Company-ID": String(companyId),
      },
    });
    const data = await response.json();
    return Array.isArray(data) ? (data as JobPosting[]) : [];
  } catch {
    return [];
  }
}

async function getApplicationsForJob(jobId: number, companyId: number | null): Promise<ApplicationDetails[]> {
  if (!companyId) {
    return [];
  }
  try {
    const response = await apiFetch(`/api/jobs/${jobId}/applications`, {
      method: "GET",
      headers: {
        "X-Company-ID": String(companyId),
      },
    });
    const data = await response.json();
    return Array.isArray(data) ? (data as ApplicationDetails[]) : [];
  } catch {
    return [];
  }
}

async function getRecruiterInterviews(companyId: number | null): Promise<Interview[]> {
  if (!companyId) {
    return [];
  }
  try {
    const response = await apiFetch("/api/interviews/my", {
      method: "GET",
      headers: {
        "X-Company-ID": String(companyId),
      },
    });
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

  const isCompanyAdmin = viewer?.roles.includes("COMPANY_ADMIN") ?? false;
  const isRecruiter = viewer?.roles.includes("RECRUITER") ?? false;
  const isCandidate = viewer?.roles.includes("CANDIDATE") ?? false;
  const viewerCompanyId =
    viewer?.companyId ?? (viewer?.id ? await getViewerCompanyId(viewer.id) : null);
  const companyIdHeader = viewerCompanyId ?? null;
  const showRecruiterDashboard = isCompanyAdmin || isRecruiter;

  if (!showRecruiterDashboard && isCandidate) {
    const candidateApplications = await getCandidateApplications();
    return (
      <Container className="space-y-8 py-12">
        <header className="space-y-3">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">Bảng điều khiển</p>
          <h1 className="text-3xl font-bold text-slate-900">Tổng quan hồ sơ của bạn</h1>
          <p className="text-base text-slate-600">
            Theo dõi trạng thái các lần ứng tuyển và truy cập nhanh vào thư viện CV hoặc hồ sơ ứng viên.
          </p>
        </header>

        <section className="space-y-4 rounded-3xl border-2 border-blue-100 bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-8 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Hồ sơ đã nộp</h2>
              <p className="text-sm text-gray-700">Danh sách các vị trí bạn đã ứng tuyển gần đây.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" size="sm">
                <Link href={ROUTES.candidateProfile}>Thư viện CV</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={ROUTES.jobs}>Khám phá job mới</Link>
              </Button>
            </div>
          </div>

          {candidateApplications.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-white/60 px-5 py-6 text-center text-sm text-slate-700">
              Bạn chưa nộp hồ sơ nào. Hãy cập nhật CV và ứng tuyển để bắt đầu theo dõi tiến trình tại đây.
            </div>
          ) : (
            <div className="space-y-3">
              {candidateApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex flex-col gap-2 rounded-2xl border-2 border-blue-100 bg-white/90 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      Hồ sơ #{application.id} • Vị trí #{application.jobPostingId}
                    </p>
                    <p className="text-sm text-slate-600">
                      Nộp ngày {formatDate(application.appliedAt)} • Trạng thái hiện tại:{" "}
                      <span className="font-semibold text-blue-700">{formatStatus(application.status)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={ROUTES.candidateProfile}>Xem hồ sơ</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`${ROUTES.jobs}/${application.jobPostingId}`}>Xem job</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </Container>
    );
  }

  const canAdminJobs = Boolean(isCompanyAdmin);
  const applicationsByJob = new Map<number, ApplicationDetails[]>();
  let jobs: JobPosting[] = [];
  let allApplications: ApplicationDetails[] = [];
  let interviews: Interview[] = [];

  if (showRecruiterDashboard) {
    jobs = await getCompanyJobs(companyIdHeader);
    const [jobApplications, fetchedInterviews] = await Promise.all([
      Promise.all(
        jobs.map(async (job) => ({
          jobId: job.id,
          applications: await getApplicationsForJob(job.id, companyIdHeader),
        }))
      ),
      getRecruiterInterviews(companyIdHeader),
    ]);

    for (const entry of jobApplications) {
      applicationsByJob.set(entry.jobId, entry.applications);
    }
    allApplications = jobApplications.flatMap((entry) => entry.applications);
    interviews = fetchedInterviews;
  }
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
    <Container className="space-y-8 py-12">
      {/* Hero Section */}
      <div className="space-y-8 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 shadow-md border border-blue-200">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <span className="inline-block rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
              Không gian nhà tuyển dụng
            </span>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Điều phối việc làm, ứng viên và phỏng vấn trên cùng một nền tảng
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              Theo sát pipeline tuyển dụng với ưu tiên rõ ràng, bối cảnh từ hoạt động gần nhất và đường dẫn hành động nhanh nhất.
            </p>
            <ul className="space-y-3 text-base text-gray-800">
              {heroHighlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" aria-hidden />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-5 rounded-2xl border border-blue-400 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50 shadow-xl p-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse shadow-sm" />
              <p className="text-sm font-bold uppercase tracking-wider text-blue-800">
                Trọng tâm hôm nay
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-white/80 border border-blue-200 px-4 py-3 shadow-sm">
                <span className="text-lg flex-shrink-0">✅</span>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-bold text-gray-900">Xử lý hồ sơ đang chờ</p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Phản hồi {awaitingReview} ứng viên đang chờ để họ không bỏ lỡ cơ hội khác
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-white/80 border border-blue-200 px-4 py-3 shadow-sm">
                <span className="text-lg flex-shrink-0">📅</span>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-bold text-gray-900">Chuẩn bị phỏng vấn</p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Rà soát {upcomingInterviews.length} buổi phỏng vấn sắp tới, xác nhận lịch và người tham gia
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-white/80 border border-blue-200 px-4 py-3 shadow-sm">
                <span className="text-lg flex-shrink-0">🎯</span>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-bold text-gray-900">Kiểm tra pipeline</p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Phát hiện nút thắt và phân bổ lại công việc cho {activeCandidateIds.size} ứng viên đang theo dõi
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 shadow-lg">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-base">💡</span>
                Mục tiêu: Phản hồi mọi hồ sơ mới trong vòng 24 giờ
              </p>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {summaryMetrics.map((metric) => (
            <div
              key={metric.label}
              className="group rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-md transition-all hover:shadow-xl hover:border-blue-300 hover:-translate-y-0.5"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                {metric.label}
              </p>
              <p className="mt-3 text-4xl font-bold text-gray-900">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-gray-800 leading-relaxed">{metric.helper}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-5 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-100 p-8 shadow-md">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Hành động nhanh</h2>
          <p className="text-base text-gray-800">
            Truy cập ngay các khu vực giữ pipeline luôn thông suốt và thúc đẩy ứng viên tiến bước.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col gap-3 rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              <span className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                {action.label}
              </span>
              <span className="text-sm text-gray-800 leading-relaxed flex-grow">{action.description}</span>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition group-hover:gap-3">
                Thực hiện ngay
                <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Job Listings */}
      <div id="jobs" className="space-y-5 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-100 p-8 shadow-md">
        <header className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">Danh mục việc làm</h2>
          <p className="text-base text-gray-800 leading-relaxed">
            Rà soát các vị trí bạn đang hỗ trợ tuyển dụng. {canAdminJobs
              ? "Chuyển sang workspace quản trị công ty khi cần đăng, tạm dừng hoặc chỉnh sửa bài tuyển dụng."
              : "Chỉ quản trị viên công ty mới có thể tạo hoặc chỉnh sửa bài đăng. Hãy liên hệ quản trị khi cần thay đổi."}
          </p>
          {canAdminJobs ? (
            <div className="flex flex-wrap items-center gap-3 pt-2">
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
          <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-white/50 px-6 py-8 text-center">
            <p className="text-base text-gray-800">Chưa có bài đăng. Liên hệ quản trị công ty để mở vị trí đầu tiên.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="space-y-3 rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-800">
                      Trạng thái {formatStatus(job.status)} • Cập nhật {formatDate(job.updatedAt)}
                    </p>
                  </div>
                  <Link
                    href={`${ROUTES.jobs}/${job.id}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700 hover:gap-3"
                  >
                    Xem bài tuyển dụng
                    <span aria-hidden>→</span>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-800">
                  {job.location ? <span className="flex items-center gap-1.5">📍 {job.location}</span> : null}
                  {job.workType ? (
                    <span className="flex items-center gap-1.5">
                      💼 {job.workType.toLowerCase()}
                    </span>
                  ) : null}
                  {job.salaryRange ? (
                    <span className="flex items-center gap-1.5">
                      💰 {job.salaryRange}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pipeline & Interviews */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div id="pipeline" className="space-y-5 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-100 p-8 shadow-md">
          <header className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Tổng quan pipeline</h2>
            <p className="text-sm text-gray-800 leading-relaxed">
              Tổng hợp từ toàn bộ hồ sơ của công ty. Cập nhật trạng thái ở bất kỳ hồ sơ nào, số liệu sẽ tự động thay đổi.
            </p>
          </header>
          {allApplications.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-white/50 px-5 py-7 text-center text-sm text-gray-800">
              Chưa có hồ sơ nào. Mời ứng viên hoặc đăng tuyển vị trí mới để bắt đầu xây dựng pipeline.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(pipelineCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30 px-5 py-3.5 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <span className="font-medium text-gray-900">{formatStatus(status)}</span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div id="interviews" className="space-y-5 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-100 p-8 shadow-md">
          <header className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Phỏng vấn sắp diễn ra</h2>
            <p className="text-sm text-gray-800 leading-relaxed">
              Xem năm cuộc trao đổi tiếp theo trên lịch của bạn. Có thể đổi lịch hoặc ghi nhận phản hồi ngay tại khu vực phỏng vấn.
            </p>
          </header>

          {upcomingInterviews.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-white/50 px-5 py-7 text-center text-sm text-gray-800">
              Chưa có phỏng vấn nào. Hãy phối hợp với ứng viên để đưa họ tiến lên.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="space-y-2 rounded-xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30 px-5 py-4 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-gray-900">Đơn ứng tuyển #{interview.applicationId}</span>
                    <span className="text-xs font-medium text-gray-800 whitespace-nowrap">
                      {formatDateTime(interview.scheduleTime, interview.timezone)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">
                    {interview.format ?? "Hình thức cập nhật sau"} • {" "}
                    {interview.locationOrLink ? interview.locationOrLink : "Địa điểm sẽ được thông báo"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div id="applications" className="space-y-5 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-100 p-8 shadow-md">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Hồ sơ mới nhất</h2>
          <p className="text-base text-gray-800">
            Hoạt động gần đây trong pipeline. Nhấp để xem ghi chú, cập nhật trạng thái hoặc thêm phản hồi.
          </p>
        </header>

        {recentApplications.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-white/50 px-6 py-8 text-center text-base text-gray-800">
            Chưa có dữ liệu. Hồ sơ sẽ xuất hiện tại đây ngay khi ứng viên nộp.
          </div>
        ) : (
          <div className="space-y-3">
            {recentApplications.map((application) => (
              <Link
                key={application.id}
                href={`${ROUTES.recruiterDashboard}/applications/${application.id}`}
                className="flex items-center justify-between rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30 px-6 py-5 transition-all hover:border-blue-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="space-y-1.5">
                  <p className="font-bold text-gray-900">Hồ sơ #{application.id}</p>
                  <p className="text-sm text-gray-800">
                    Vị trí #{application.jobPostingId} • Nộp ngày {formatDate(application.appliedAt)}
                  </p>
                  <p className="text-sm text-gray-800">
                    Ứng viên {application.candidateName ?? `#${application.candidateId}`}
                  </p>
                </div>
                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200">
                  {formatStatus(application.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Job Health */}
      <div id="job-health" className="space-y-5 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-100 p-8 shadow-md">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Sức khỏe tuyển dụng</h2>
          <p className="text-base text-gray-800">
            Theo dõi số lượng hồ sơ theo từng vị trí và nhận diện các vai trò cần thêm nguồn ứng viên hoặc phản hồi nhanh hơn.
          </p>
        </header>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-white/50 px-6 py-8 text-center text-base text-gray-800">
            Chưa có vị trí nào cho công ty của bạn. Tạo bài đăng tuyển dụng để hiển thị dữ liệu.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border-2 border-blue-100 shadow-md">
            <table className="min-w-full divide-y divide-blue-200">
              <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-blue-900">
                    Vị trí
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-blue-900">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-blue-900">
                    Số hồ sơ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 bg-gradient-to-br from-white to-blue-50/30">
                {jobs.map((job) => {
                  const applications = applicationsByJob.get(job.id) ?? [];
                  return (
                    <tr key={job.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{job.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{formatStatus(job.status)}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{applications.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}

async function getCandidateApplications(): Promise<Application[]> {
  try {
    const response = await apiFetch("/api/applications/my", { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as Application[]) : [];
  } catch {
    return [];
  }
}
async function getViewerCompanyId(userId?: number | null): Promise<number | null> {
  if (!userId) {
    return null;
  }
  try {
    const response = await apiFetch(`/api/internal/companies/users/${userId}/company`, {
      method: "GET",
    });
    const data = await response.json();
    const companyId = data?.id?.companyId ?? data?.companyId ?? null;
    return typeof companyId === "number" ? companyId : null;
  } catch {
    return null;
  }
}
