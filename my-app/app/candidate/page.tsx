import Link from "next/link";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { dateFormatter, dateTimeFormatter } from "@/lib/dates";
import type { Application, Interview, JobPostingPublic, Profile } from "@/lib/types";

type EnrichedApplication = Application & {
  jobTitle: string;
  jobDescription: string | null;
};

type NextStep = {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
};

async function getApplications(): Promise<Application[]> {
  try {
    const response = await apiFetch("/api/applications/my", { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as Application[]) : [];
  } catch {
    return [];
  }
}

async function getJobSummary(jobId: number): Promise<JobPostingPublic | null> {
  try {
    const response = await apiFetch(`/api/jobs/public/${jobId}`, {
      method: "GET",
      skipAuthHeaders: true,
    });
    if (response.status === 404) {
      return null;
    }
    const data = await response.json();
    return data && typeof data === "object" ? (data as JobPostingPublic) : null;
  } catch {
    return null;
  }
}

async function enrichApplications(applications: Application[]): Promise<EnrichedApplication[]> {
  const jobIds = Array.from(new Set(applications.map((app) => app.jobPostingId)));
  const jobMap = new Map<number, JobPostingPublic>();

  await Promise.all(
    jobIds.map(async (jobId) => {
      const summary = await getJobSummary(jobId);
      if (summary) {
        jobMap.set(jobId, summary);
      }
    })
  );

  return applications.map((app) => {
    const job = jobMap.get(app.jobPostingId);
    return {
      ...app,
      jobTitle: job?.title ?? `Job #${app.jobPostingId}`,
      jobDescription: job?.description ?? null,
    };
  });
}

async function getInterviews(): Promise<Interview[]> {
  try {
    const response = await apiFetch("/api/interviews/my", { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as Interview[]) : [];
  } catch {
    return [];
  }
}

async function getProfile(): Promise<Profile | null> {
  try {
    const response = await apiFetch("/api/profiles/me", { method: "GET" });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data && typeof data === "object" ? (data as Profile) : null;
  } catch {
    return null;
  }
}

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Đã nộp",
  IN_REVIEW: "Đang xem xét",
  INTERVIEW_SCHEDULED: "Đã lên lịch phỏng vấn",
  INTERVIEW: "Phỏng vấn",
  OFFERED: "Nhận đề nghị",
  HIRED: "Đã nhận việc",
  REJECTED: "Bị từ chối",
  WITHDRAWN: "Đã rút đơn",
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

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "vừa cập nhật";
  }
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function formatDateTime(value: string | null | undefined, timezone?: string | null) {
  if (!value) {
    return "Sẽ lên lịch sớm";
  }
  try {
    const date = new Date(value);
    if (timezone) {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: timezone,
      }).format(date);
    }
    return dateTimeFormatter.format(date);
  } catch {
    return value;
  }
}

function formatProfileDate(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function CandidatePortalPage() {
  const [applications, interviews, profile] = await Promise.all([
    getApplications().then(enrichApplications),
    getInterviews(),
    getProfile(),
  ]);

  const profileData: Profile =
    profile ?? {
      userId: 0,
      fullName: null,
      avatarUrl: null,
      phoneNumber: null,
      summary: null,
      experiences: [],
      education: [],
      skills: [],
      cvs: [],
    };

  const upcomingInterviews = interviews
    .slice()
    .sort((a, b) => {
      const aTime = a.scheduleTime ? new Date(a.scheduleTime).getTime() : Infinity;
      const bTime = b.scheduleTime ? new Date(b.scheduleTime).getTime() : Infinity;
      return aTime - bTime;
    })
    .slice(0, 5);

  const sortedExperiences = profileData.experiences
    .slice()
    .sort((a, b) => {
      const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bTime - aTime;
    });

  const sortedEducation = profileData.education
    .slice()
    .sort((a, b) => {
      const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bTime - aTime;
    });

  const displaySkills = profileData.skills
    .slice()
    .sort((a, b) => {
      const nameA = (a.skillName || "").toLowerCase();
      const nameB = (b.skillName || "").toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

  const sortedCvs = profileData.cvs
    .slice()
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  const sortedApplications = applications
    .slice()
    .sort((a, b) => {
      const aTime = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
      const bTime = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
      return bTime - aTime;
    });

  const recentApplications = sortedApplications.slice(0, 5);

  const activeApplications = sortedApplications.filter(
    (application) => !["REJECTED", "WITHDRAWN"].includes(application.status)
  );

  const nextInterview = upcomingInterviews[0] ?? null;

  const completionChecks = [
    Boolean(profileData.fullName),
    Boolean(profileData.summary),
    Boolean(profileData.phoneNumber),
    sortedExperiences.length > 0,
    sortedEducation.length > 0,
    displaySkills.length > 0,
    sortedCvs.length > 0,
  ];

  const profileCompletion = completionChecks.length
    ? Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100)
    : 0;

  const defaultCv = sortedCvs.find((cv) => cv.isDefault) ?? sortedCvs[0] ?? null;
  const lastAppliedAt = sortedApplications[0]?.appliedAt ?? null;

  const profileCompletionLabel =
    profileCompletion >= 100
      ? "Hồ sơ của bạn đã sẵn sàng chia sẻ với nhà tuyển dụng"
      : `Bạn còn thiếu ${Math.max(0, 100 - profileCompletion)}% để hoàn thiện hồ sơ.`;

  const nextSteps: NextStep[] = [];
  const addNextStep = (step: NextStep) => {
    if (!nextSteps.some((existing) => existing.title === step.title)) {
      nextSteps.push(step);
    }
  };

  if (!profileData.summary) {
    addNextStep({
      title: "Thêm bản tóm tắt ngắn",
      description: "Tóm tắt giúp nhà tuyển dụng hiểu nhanh trọng tâm và mở đầu cuộc trao đổi thuận lợi hơn.",
      href: ROUTES.candidateProfile,
      actionLabel: "Cập nhật hồ sơ",
    });
  }

  if (!sortedCvs.length) {
    addNextStep({
      title: "Tải lên CV đầu tiên",
      description: "Giữ sẵn bản CV chỉn chu để đính kèm vào hồ sơ ứng tuyển chỉ với một cú nhấp chuột.",
      href: ROUTES.candidateProfile,
      actionLabel: "Mở quản lý CV",
    });
  }

  if (!applications.length) {
    addNextStep({
      title: "Khám phá vị trí đang tuyển",
      description: "Duyệt các tin tuyển dụng phù hợp với bạn và gửi hồ sơ đầu tiên.",
      href: ROUTES.jobs,
      actionLabel: "Tìm việc",
    });
  }

  if (profileCompletion < 80) {
    addNextStep({
      title: "Hoàn thiện hồ sơ",
      description: "Bổ sung kinh nghiệm, học vấn và kỹ năng để làm nổi bật thế mạnh trước nhà tuyển dụng.",
      href: ROUTES.candidateProfile,
      actionLabel: "Bổ sung thông tin",
    });
  }

  if (nextInterview) {
    addNextStep({
      title: "Chuẩn bị cho buổi phỏng vấn tiếp theo",
      description: `Xem lại kế hoạch và thông tin tham gia của đơn ứng tuyển #${nextInterview.applicationId}.`,
      href: `${ROUTES.candidateApplications}/${nextInterview.applicationId}`,
      actionLabel: "Xem chi tiết phỏng vấn",
    });
  }

  const prioritizedNextSteps = nextSteps.slice(0, 4);

  return (
    <Container className="space-y-10 py-10">
      <Panel variant="surface" padding="lg" className="overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-accent/10 via-transparent to-transparent"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-text/50">Chào mừng bạn trở lại</p>
            <h1 className="text-3xl font-semibold text-text">
              {profileData.fullName
                ? `${profileData.fullName}, tiếp tục duy trì đà tiến nhé`
                : "Sẵn sàng cho cơ hội tiếp theo?"}
            </h1>
            <p className="text-sm text-muted">
              {profileData.summary ??
                "Hãy chia sẻ đôi nét để đội ngũ tuyển dụng nắm được trọng tâm và kinh nghiệm của bạn trong nháy mắt."}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button asChild size="sm">
                <Link href={ROUTES.candidateProfile}>Cập nhật hồ sơ</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href={`${ROUTES.candidateProfile}#cvs`}>Quản lý CV</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href={ROUTES.jobs}>Xem vị trí tuyển dụng</Link>
              </Button>
            </div>
          </div>
          <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl border border-border bg-surface/60 p-4 text-center backdrop-blur md:w-auto">
            <AvatarUploader avatarUrl={profileData.avatarUrl} fullName={profileData.fullName} />
            <p className="text-xs text-muted">
              Một bức ảnh cập nhật giúp nhà tuyển dụng thêm tin tưởng vào hồ sơ của bạn.
            </p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Đơn đang xử lý</p>
          <p className="mt-3 text-3xl font-semibold text-text">{activeApplications.length}</p>
          <p className="text-xs text-muted">
            {lastAppliedAt
              ? `Cập nhật gần nhất ${formatDate(lastAppliedAt)}`
              : "Gửi hồ sơ đầu tiên để bắt đầu hành trình."}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Mức độ hoàn thiện hồ sơ</p>
          <p className="mt-3 text-3xl font-semibold text-text">{profileCompletion}%</p>
          <p className="text-xs text-muted">{profileCompletionLabel}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Thư viện CV</p>
          <p className="mt-3 text-3xl font-semibold text-text">{sortedCvs.length}</p>
          <p className="text-xs text-muted">
            {defaultCv ? `Mặc định: ${defaultCv.versionName}` : "Tải lên CV phù hợp để sẵn sàng sử dụng."}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Phỏng vấn tiếp theo</p>
          <p className="mt-3 text-lg font-semibold text-text">
            {nextInterview ? formatDateTime(nextInterview.scheduleTime, nextInterview.timezone) : "Chưa lên lịch"}
          </p>
          <p className="text-xs text-muted">
            {nextInterview
              ? `Đơn ứng tuyển #${nextInterview.applicationId} - ${nextInterview.format ?? "Đang cập nhật hình thức"}`
              : "Phỏng vấn sắp tới sẽ xuất hiện tại đây ngay khi được xác nhận."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel variant="surface" padding="lg" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text">Đơn ứng tuyển gần đây</h2>
              <p className="text-sm text-muted">Theo dõi bạn đang ở giai đoạn nào trong từng quy trình.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={ROUTES.candidateApplications}>Xem tất cả</Link>
            </Button>
          </div>
          {recentApplications.length ? (
            <div className="space-y-3 text-sm">
              {recentApplications.map((application) => (
                <Link
                  key={application.id}
                  href={`${ROUTES.candidateApplications}/${application.id}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition hover:border-primary-500/30 hover:bg-surface"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-text group-hover:text-primary-700">
                        {application.jobTitle}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted">
                        <span>Nộp ngày {formatDate(application.appliedAt)}</span>
                        {application.source ? <span>Nguồn: {application.source}</span> : null}
                      </div>
                    </div>
                    <span className="self-start rounded-full bg-primary-600/10 px-3 py-1 text-xs font-semibold text-primary-600">
                      {formatStatus(application.status)}
                    </span>
                  </div>
                  <p className="text-xs text-muted line-clamp-2">
                    {application.jobDescription ??
                      "Chúng tôi sẽ hiển thị mô tả công việc ngay khi công ty cập nhật."}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface/80 px-6 py-10 text-sm text-muted">
              Bạn chưa ứng tuyển vị trí nào. Khám phá các vị trí đang mở và gửi hồ sơ đầu tiên của bạn.
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel variant="surface" padding="lg" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-text">Bước tiếp theo</h2>
              <p className="text-sm text-muted">
                Những gợi ý được cá nhân hóa giúp bạn tiếp tục tìm kiếm đúng hướng.
              </p>
            </div>
            {prioritizedNextSteps.length ? (
              <ul className="space-y-4 text-sm">
                {prioritizedNextSteps.map((step) => (
                  <li
                    key={step.title}
                    className="rounded-2xl border border-dashed border-border bg-surface p-4"
                  >
                    <p className="font-semibold text-text">{step.title}</p>
                    <p className="mt-1 text-xs text-muted">{step.description}</p>
                    {step.href ? (
                      <Link
                        href={step.href}
                        className="mt-3 inline-flex text-xs font-semibold text-primary-600 hover:underline"
                      >
                        {step.actionLabel ?? "Mở"}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-border bg-surface px-4 py-6 text-sm text-muted">
                Hiện bạn đã hoàn tất. Chúng tôi sẽ hiển thị gợi ý mới ngay khi có thay đổi.
              </div>
            )}
          </Panel>

          <Panel variant="surface" padding="lg" className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-text">Thư viện CV</h2>
                <p className="text-sm text-muted">
                  Lưu trữ các phiên bản CV chỉn chu để đính kèm phù hợp cho từng đơn ứng tuyển.
                </p>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href={`${ROUTES.candidateProfile}#cvs`}>Quản lý</Link>
              </Button>
            </div>
            {sortedCvs.length ? (
              <div className="space-y-3 text-sm">
                {sortedCvs.slice(0, 5).map((cv) => {
                  const downloadHref =
                    cv.downloadUrl ?? (cv.fileId ? `/api/files/${cv.fileId}` : null);
                  return (
                    <div
                      key={cv.id}
                      className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-text">
                          {cv.versionName}
                          {cv.isDefault ? " - Mặc định" : ""}
                        </p>
                        <p className="text-xs text-muted">Added {formatDate(cv.createdAt)}</p>
                      </div>
                      {downloadHref ? (
                        <a
                          href={downloadHref}
                          className="text-xs font-semibold text-primary-600 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Tải xuống
                        </a>
                      ) : (
                        <span className="text-xs text-text/50">
                          Đây là bản tạm — hãy tải lên phiên bản cập nhật khi bạn đã sẵn sàng.
                        </span>
                      )}
                    </div>
                  );
                })}
                {sortedCvs.length > 5 ? (
                  <p className="text-xs text-text/50">
                    Hiển thị 5 phiên bản gần nhất. Vào trang quản lý để xem thêm.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-surface/80 px-5 py-8 text-sm text-muted">
                Chưa có CV nào. Tải lên CV phù hợp để đính kèm cùng hồ sơ ứng tuyển.
              </div>
            )}
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel variant="surface" padding="lg" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text">Phỏng vấn sắp diễn ra</h2>
              <p className="text-sm text-muted">
                Thông tin sẽ được đồng bộ ngay khi nhà tuyển dụng lên lịch hoặc thay đổi phiên phỏng vấn.
              </p>
            </div>
            {nextInterview ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`${ROUTES.candidateApplications}/${nextInterview.applicationId}`}>
                  Xem lịch phỏng vấn
                </Link>
              </Button>
            ) : null}
          </div>
          {upcomingInterviews.length ? (
            <ol className="space-y-4 text-sm">
              {upcomingInterviews.map((interview) => (
                <li
                  key={interview.id}
                  className="rounded-2xl border border-border bg-surface px-5 py-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-text">
                        {formatDateTime(interview.scheduleTime, interview.timezone)}
                      </p>
                      <p className="text-xs text-muted">
                        Đơn ứng tuyển #{interview.applicationId} - {interview.format ?? "Hình thức chưa xác định"}
                      </p>
                    </div>
                    <span className="text-xs text-text/50">
                      {interview.locationOrLink ?? "Địa điểm hoặc đường dẫn sẽ được cập nhật"}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface/80 px-6 py-10 text-sm text-muted">
              Chưa có buổi phỏng vấn nào được lên lịch. Chúng tôi sẽ thông báo tại đây ngay khi có lịch mới.
            </div>
          )}
        </Panel>

          <Panel variant="surface" padding="lg" className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-text">Tổng quan hồ sơ</h2>
                <p className="text-sm text-muted">
                  Xác nhận nhanh các thông tin chính mà nhà tuyển dụng sẽ nhìn thấy trước khi xem chi tiết.
                </p>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href={ROUTES.candidateProfile}>Chỉnh sửa</Link>
              </Button>
            </div>

          <div className="space-y-6 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted">Họ và tên</p>
                <p className="mt-1 font-semibold text-text">
                  {profileData.fullName || "Thêm họ tên"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted">Điện thoại</p>
                <p className="mt-1 font-semibold text-text">
                  {profileData.phoneNumber || "Thêm số liên hệ"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Kinh nghiệm nổi bật</p>
              {sortedExperiences.length ? (
                <div className="mt-3 space-y-3">
                  {sortedExperiences.slice(0, 2).map((experience) => (
                    <div
                      key={experience.id}
                      className="rounded-2xl border border-border bg-surface px-4 py-3"
                      >
                      <p className="font-semibold text-text">
                        {experience.title || "Chức danh sẽ cập nhật"}
                      </p>
                      <p className="text-xs text-muted">
                        {experience.companyName || "Công ty sẽ cập nhật"}
                      </p>
                      <p className="text-xs text-text/50">
                        {formatProfileDate(experience.startDate, "Không rõ")}
                        {" - "}
                        {formatProfileDate(experience.endDate, "Hiện tại")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-text/50">Thêm các vị trí gần đây để làm nổi bật đóng góp của bạn.</p>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Học vấn</p>
              {sortedEducation.length ? (
                <div className="mt-3 space-y-3">
                  {sortedEducation.slice(0, 2).map((education) => (
                    <div
                      key={education.id}
                      className="rounded-2xl border border-border bg-surface px-4 py-3"
                      >
                      <p className="font-semibold text-text">
                        {education.school || "Trường sẽ cập nhật"}
                      </p>
                      <p className="text-xs text-muted">
                        {education.degree || "Ngành học sẽ cập nhật"}
                      </p>
                      <p className="text-xs text-text/50">
                        {formatProfileDate(education.startDate, "Bắt đầu")}
                        {" - "}
                        {formatProfileDate(education.endDate, "Hiện tại")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-text/50">
                  Ghi lại quá trình học tập để hoàn thiện hồ sơ.
                </p>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Kỹ năng</p>
              {displaySkills.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {displaySkills.slice(0, 8).map((skill) =>
                    skill.skillName ? (
                      <span
                        key={skill.id}
                        className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
                      >
                        {skill.skillName}
                      </span>
                    ) : null
                  )}
                  {displaySkills.length > 8 ? (
                    <span className="text-xs text-text/50">+{displaySkills.length - 8} kỹ năng khác</span>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-xs text-text/50">
                  Liệt kê kỹ năng cốt lõi để nhà tuyển dụng kết nối với bạn nhanh hơn.
                </p>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </Container>
  );
}
