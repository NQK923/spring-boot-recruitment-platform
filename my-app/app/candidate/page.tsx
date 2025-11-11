import Link from "next/link";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { Container } from "@/components/ui/container";
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
    const response = await apiFetch("/api/profiles/me/enriched", { method: "GET" });
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
  OFFERED: "Đã nhận offer",
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
    return "Mới đây";
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
      emailForCv: null,
      location: null,
      website: null,
      linkedin: null,
      github: null,
      portfolio: null,
      yearsOfExperience: null,
      desiredPosition: null,
      workAuthorization: null,
      openToRelocate: false,
      preferredCvLanguage: "vi",
      experiences: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
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
    Boolean(profileData.emailForCv),
    Boolean(profileData.location),
    Boolean(profileData.desiredPosition),
    sortedExperiences.length > 0,
    profileData.projects.length > 0,
    sortedEducation.length > 0,
    profileData.certifications.length > 0,
    profileData.languages.length > 0,
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
      description: "Tóm tắt giúp nhà tuyển dụng hiểu nhanh về bạn và bắt đầu cuộc trao đổi thuận lợi hơn.",
      href: ROUTES.candidateProfile,
      actionLabel: "Cập nhật hồ sơ",
    });
  }

  if (!sortedCvs.length) {
    addNextStep({
      title: "Tải lên CV đầu tiên",
      description: "Chuẩn bị sẵn một CV chuyên nghiệp để có thể ứng tuyển nhanh chóng.",
      href: ROUTES.candidateProfile,
      actionLabel: "Mở quản lý CV",
    });
  }

  if (!profileData.projects.length) {
    addNextStep({
      title: "Chia sẻ dự án tiêu biểu",
      description: "Thêm 2-3 dự án tiêu biểu với số liệu rõ ràng để AI của chúng tôi có thể tạo CV chuẩn ATS cho bạn.",
      href: ROUTES.candidateProfile,
      actionLabel: "Thêm dự án",
    });
  }

  if (!profileData.languages.length) {
    addNextStep({
      title: "Cập nhật ngoại ngữ",
      description: "Liệt kê trình độ ngoại ngữ của bạn theo thang CEFR để hệ thống ATS đánh giá chính xác hơn.",
      href: ROUTES.candidateProfile,
      actionLabel: "Thêm ngoại ngữ",
    });
  }

  if (!applications.length) {
    addNextStep({
      title: "Khám phá vị trí đang tuyển",
      description: "Tìm kiếm các công việc phù hợp và gửi hồ sơ ứng tuyển đầu tiên của bạn.",
      href: ROUTES.jobs,
      actionLabel: "Tìm việc",
    });
  }

  if (profileCompletion < 80) {
    addNextStep({
      title: "Hoàn thiện hồ sơ",
      description: "Bổ sung kinh nghiệm, học vấn và kỹ năng để gây ấn tượng với nhà tuyển dụng.",
      href: ROUTES.candidateProfile,
      actionLabel: "Bổ sung thông tin",
    });
  }

  if (nextInterview) {
    addNextStep({
      title: "Chuẩn bị cho buổi phỏng vấn tiếp theo",
      description: `Xem lại kế hoạch và thông tin chi tiết cho buổi phỏng vấn của đơn ứng tuyển #${nextInterview.applicationId}.`,
      href: `${ROUTES.candidateApplications}/${nextInterview.applicationId}`,
      actionLabel: "Xem chi tiết phỏng vấn",
    });
  }

  const prioritizedNextSteps = nextSteps.slice(0, 4);

  return (
    <Container className="space-y-6 py-8">
      <div className="overflow-hidden relative bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border border-primary-200/50 shadow-sm rounded-3xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent"
        />
        <div className="relative px-8 py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 space-y-5 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/70 border border-primary-200 px-4 py-1.5">
                <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">
                  Không gian ứng viên
                </span>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                  {profileData.fullName
                    ? `Xin chào ${profileData.fullName}! 👋`
                    : "Chào mừng đến với hồ sơ của bạn"}
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {profileData.summary ??
                    "Hãy hoàn thiện hồ sơ để tăng cơ hội được nhà tuyển dụng chú ý và mời phỏng vấn."}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  {profileData.desiredPosition ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 font-medium text-primary-700">
                      🎯 {profileData.desiredPosition}
                    </span>
                  ) : null}
                  {profileData.location ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium text-gray-800">
                      📍 {profileData.location}
                    </span>
                  ) : null}
                  {profileData.yearsOfExperience != null ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-800">
                      ⏱ {profileData.yearsOfExperience}+ năm kinh nghiệm
                    </span>
                  ) : null}
                  {profileData.preferredCvLanguage ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">
                      📝 CV: {profileData.preferredCvLanguage === "vi" ? "Tiếng Việt" : "Tiếng Anh"}
                    </span>
                  ) : null}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="rounded-xl shadow-sm bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white border-0 px-6 py-2.5 hover:text-white transition-all">
                  <Link href={ROUTES.candidateProfile} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Cập nhật hồ sơ
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="rounded-xl shadow-sm bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white border-0 px-6 py-2.5 hover:text-white transition-all">
                  <Link href={`${ROUTES.candidateProfile}#cvs`} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Quản lý CV
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-xl hover:bg-primary-50 hover:text-primary-700 px-6 py-2.5">
                  <Link href={ROUTES.jobs} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Tìm việc làm
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary-200/50 bg-white/80 backdrop-blur-sm p-6 shadow-sm lg:w-72">
              <AvatarUploader avatarUrl={profileData.avatarUrl} fullName={profileData.fullName} />
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-gray-900">
                  {profileData.fullName || "Chưa cập nhật tên"}
                </p>
                <p className="text-xs text-gray-600">
                  Ảnh đại diện giúp hồ sơ chuyên nghiệp hơn
                </p>
              </div>
              <div className="w-full space-y-2 text-sm text-gray-700">
                {profileData.emailForCv ? (
                  <p className="flex items-center gap-2 break-all">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l9 6 9-6" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {profileData.emailForCv}
                  </p>
                ) : null}
                {profileData.phoneNumber ? (
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h1.28a2 2 0 011.94 1.515l1.387 5.015a2 2 0 01-.53 1.938l-1.293 1.293a16 16 0 007.586 7.586l1.293-1.293a2 2 0 011.938-.53l5.015 1.387A2 2 0 0121 19.72V21a2 2 0 01-2 2h-.25C9.44 23 1 14.56 1 3.25V3a2 2 0 012-2z" />
                    </svg>
                    {profileData.phoneNumber}
                  </p>
                ) : null}
                {profileData.location ? (
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a3 3 0 110-6 3 3 0 010 6z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 11c0 7.5-7.5 10.5-7.5 10.5S4.5 18.5 4.5 11a7.5 7.5 0 1115 0z" />
                    </svg>
                    {profileData.location}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border border-primary-200/50 p-6 shadow-sm hover:shadow-md hover:border-primary-300/70 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-300/30 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-primary-100 border border-primary-200">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Đơn ứng tuyển</p>
            </div>
            <p className="text-4xl font-extrabold text-gray-900 mb-2">{activeApplications.length}</p>
            <p className="text-sm text-gray-700">
              {lastAppliedAt
                ? `Cập nhật ${formatDate(lastAppliedAt)}`
                : "Bắt đầu hành trình của bạn"}
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border border-primary-200/50 p-6 shadow-sm hover:shadow-md hover:border-primary-300/70 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-300/30 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-primary-100 border border-primary-200">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Độ hoàn thiện</p>
            </div>
            <p className="text-4xl font-extrabold text-gray-900 mb-2">{profileCompletion}%</p>
            <p className="text-sm text-gray-700">{profileCompletionLabel}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border border-primary-200/50 p-6 shadow-sm hover:shadow-md hover:border-primary-300/70 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-300/30 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-primary-100 border border-primary-200">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">CV của tôi</p>
            </div>
            <p className="text-4xl font-extrabold text-gray-900 mb-2">{sortedCvs.length}</p>
            <p className="text-sm text-gray-700">
              {defaultCv ? `Mặc định: ${defaultCv.versionName}` : "Chưa có CV nào"}
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border border-primary-200/50 p-6 shadow-sm hover:shadow-md hover:border-primary-300/70 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-300/30 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-primary-100 border border-primary-200">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Phỏng vấn</p>
            </div>
            <p className="text-lg font-extrabold text-gray-900 mb-2 leading-tight">
              {nextInterview ? formatDateTime(nextInterview.scheduleTime, nextInterview.timezone) : "Chưa có lịch"}
            </p>
            <p className="text-sm text-gray-700 line-clamp-2">
              {nextInterview
                ? `${nextInterview.format ?? "Chưa rõ hình thức"}`
                : "Sẽ thông báo khi có"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border border-primary-200/50 shadow-sm rounded-3xl p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Đơn ứng tuyển gần đây</h2>
              <p className="text-sm text-gray-600 mt-1">Theo dõi tiến độ của từng đơn ứng tuyển</p>
            </div>
            <Button asChild size="sm" variant="outline" className="rounded-lg border-primary-300 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-400 px-4 py-2">
              <Link href={ROUTES.candidateApplications}>Xem tất cả →</Link>
            </Button>
          </div>
          {recentApplications.length ? (
            <div className="space-y-3">
              {recentApplications.map((application) => (
                <Link
                  key={application.id}
                  href={`${ROUTES.candidateApplications}/${application.id}`}
                  className="group block rounded-2xl border border-primary-200/50 bg-white/80 backdrop-blur-sm p-5 transition-all hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5 duration-200"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                            {application.jobTitle}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(application.appliedAt)}
                            </span>
                            {application.source ? (
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {application.source}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <span className="shrink-0 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
                          {formatStatus(application.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {application.jobDescription ?? "Đang cập nhật mô tả công việc..."}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-primary-300/50 bg-gradient-to-br from-white to-primary-50/30 px-6 py-12 text-center">
              <svg className="w-16 h-16 mx-auto text-primary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-700 font-medium mb-2">Chưa có đơn ứng tuyển nào</p>
              <p className="text-xs text-gray-600">Khám phá các vị trí đang tuyển và bắt đầu hành trình của bạn</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-5 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border border-primary-200/50 shadow-sm rounded-3xl p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bước tiếp theo</h2>
              <p className="text-sm text-gray-600 mt-1">
                Gợi ý được cá nhân hóa cho bạn
              </p>
            </div>
            {prioritizedNextSteps.length ? (
              <ul className="space-y-3">
                {prioritizedNextSteps.map((step) => (
                  <li
                    key={step.title}
                    className="rounded-xl border border-primary-200/50 bg-white/80 backdrop-blur-sm p-4 hover:shadow-sm hover:border-primary-300 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-primary-100 border border-primary-200 shrink-0">
                        <svg className="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm mb-1">{step.title}</p>
                        <p className="text-xs text-gray-700 leading-relaxed">{step.description}</p>
                        {step.href ? (
                          <Link
                            href={step.href}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:text-white shadow-sm transition-all"
                          >
                            {step.actionLabel ?? "Mở"}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-primary-300/50 bg-white/60 px-4 py-8 text-center">
                <svg className="w-12 h-12 mx-auto text-primary-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-700 font-medium">Bạn đã hoàn tất!</p>
                <p className="text-xs text-gray-600 mt-1">Sẽ có gợi ý mới khi cần</p>
              </div>
            )}
          </div>

          <div className="space-y-5 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border border-primary-200/50 shadow-sm rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Thư viện CV</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Quản lý các phiên bản CV của bạn
                </p>
              </div>
              <Button asChild size="sm" variant="ghost" className="rounded-lg hover:bg-primary-50 hover:text-primary-700 px-4 py-2">
                <Link href={`${ROUTES.candidateProfile}#cvs`}>Quản lý</Link>
              </Button>
            </div>
            {sortedCvs.length ? (
              <div className="space-y-2.5">
                {sortedCvs.slice(0, 5).map((cv) => {
                  const downloadHref =
                    cv.downloadUrl ?? (cv.fileId ? `/api/files/${cv.fileId}` : null);
                  return (
                    <div
                      key={cv.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-primary-200/50 bg-white/80 backdrop-blur-sm px-4 py-3 hover:border-primary-300 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-primary-50 border border-primary-200 shrink-0">
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {cv.versionName}
                            {cv.isDefault ? (
                              <span className="ml-2 text-xs text-primary-600">(Mặc định)</span>
                            ) : null}
                          </p>
                          <p className="text-xs text-gray-600">{formatDate(cv.createdAt)}</p>
                        </div>
                      </div>
                      {downloadHref ? (
                        <a
                          href={downloadHref}
                          className="shrink-0 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500 shrink-0">Đang tạo...</span>
                      )}
                    </div>
                  );
                })}
                {sortedCvs.length > 5 ? (
                  <p className="text-xs text-gray-600 text-center pt-2">
                    Và {sortedCvs.length - 5} CV khác
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-primary-300/50 bg-gradient-to-br from-white to-primary-50/20 px-5 py-10 text-center">
                <svg className="w-12 h-12 mx-auto text-primary-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-700 font-medium mb-1">Chưa có CV</p>
                <p className="text-xs text-gray-600">Tải lên CV để sẵn sàng ứng tuyển</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border border-primary-200/50 shadow-sm rounded-3xl p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Phỏng vấn sắp diễn ra</h2>
              <p className="text-sm text-gray-600 mt-1">
                Lịch phỏng vấn được đồng bộ tự động
              </p>
            </div>
            {nextInterview ? (
              <Button asChild size="sm" variant="outline" className="rounded-lg border-primary-300 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-400 px-4 py-2">
                <Link href={`${ROUTES.candidateApplications}/${nextInterview.applicationId}`}>
                  Chi tiết →
                </Link>
              </Button>
            ) : null}
          </div>
          {upcomingInterviews.length ? (
            <div className="space-y-3">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="rounded-xl border border-primary-200/50 bg-white/80 backdrop-blur-sm p-5 hover:border-primary-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary-50 border border-primary-200 shrink-0">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-1">
                        {formatDateTime(interview.scheduleTime, interview.timezone)}
                      </p>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Hình thức:</span> {interview.format ?? "Chưa xác định"}
                        </p>
                        {interview.locationOrLink ? (
                          <p className="text-sm text-gray-700 line-clamp-1">
                            <span className="font-medium">Địa điểm:</span> {interview.locationOrLink}
                          </p>
                        ) : null}
                        <p className="text-xs text-gray-600">
                          Đơn ứng tuyển #{interview.applicationId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-primary-300/50 bg-gradient-to-br from-white to-primary-50/30 px-6 py-12 text-center">
              <svg className="w-16 h-16 mx-auto text-primary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-700 font-medium mb-2">Chưa có lịch phỏng vấn</p>
              <p className="text-xs text-gray-600">Sẽ thông báo ngay khi có lịch mới</p>
            </div>
          )}
        </div>

          <div className="space-y-5 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border border-primary-200/50 shadow-sm rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tổng quan hồ sơ</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Thông tin nhà tuyển dụng sẽ thấy
                </p>
              </div>
              <Button asChild size="sm" variant="ghost" className="rounded-lg hover:bg-primary-50 hover:text-primary-700 px-4 py-2">
                <Link href={ROUTES.candidateProfile}>Chỉnh sửa</Link>
              </Button>
            </div>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-xs uppercase tracking-wider text-blue-700 font-semibold">Họ và tên</p>
                </div>
                <p className="font-semibold text-gray-900">
                  {profileData.fullName || "Chưa cập nhật"}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-pink-50/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-xs uppercase tracking-wider text-purple-700 font-semibold">Điện thoại</p>
                </div>
                <p className="font-semibold text-gray-900">
                  {profileData.phoneNumber || "Chưa cập nhật"}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200">
                  <svg className="w-3.5 h-3.5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-900">Kinh nghiệm</p>
              </div>
              {sortedExperiences.length ? (
                <div className="space-y-2.5">
                  {sortedExperiences.slice(0, 2).map((experience) => (
                    <div
                      key={experience.id}
                      className="rounded-xl border border-green-200/50 bg-gradient-to-br from-green-50/50 to-emerald-50/30 backdrop-blur-sm px-4 py-3 hover:shadow-sm transition-shadow"
                      >
                      <p className="font-semibold text-sm text-gray-900">
                        {experience.title || "Chức danh"}
                      </p>
                      <p className="text-xs text-gray-700 mt-0.5">
                        {experience.companyName || "Công ty"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatProfileDate(experience.startDate, "...")} - {formatProfileDate(experience.endDate, "Hiện tại")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-700 bg-white/60 rounded-xl border border-dashed border-primary-300/50 px-4 py-3">
                  Chưa có kinh nghiệm
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200">
                  <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-900">Học vấn</p>
              </div>
              {sortedEducation.length ? (
                <div className="space-y-2.5">
                  {sortedEducation.slice(0, 2).map((education) => (
                    <div
                      key={education.id}
                      className="rounded-xl border border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-orange-50/30 backdrop-blur-sm px-4 py-3 hover:shadow-sm transition-shadow"
                      >
                      <p className="font-semibold text-sm text-gray-900">
                        {education.school || "Trường"}
                      </p>
                      <p className="text-xs text-gray-700 mt-0.5">
                        {education.degree || "Ngành học"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatProfileDate(education.startDate, "...")} - {formatProfileDate(education.endDate, "Hiện tại")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-700 bg-white/60 rounded-xl border border-dashed border-primary-300/50 px-4 py-3">
                  Chưa có học vấn
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-100 to-sky-100 border border-cyan-200">
                  <svg className="w-3.5 h-3.5 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-900">Kỹ năng</p>
              </div>
              {displaySkills.length ? (
                <div className="flex flex-wrap gap-2">
                  {displaySkills.slice(0, 8).map((skill) =>
                    skill.skillName ? (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm hover:shadow-md hover:scale-105 transition-all"
                      >
                        {skill.skillName}
                      </span>
                    ) : null
                  )}
                  {displaySkills.length > 8 ? (
                    <span className="text-xs text-gray-700 self-center font-medium">+{displaySkills.length - 8}</span>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-gray-700 bg-white/60 rounded-xl border border-dashed border-primary-300/50 px-4 py-3">
                  Chưa có kỹ năng
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
