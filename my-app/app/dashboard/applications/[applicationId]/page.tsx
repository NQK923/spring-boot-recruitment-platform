import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser } from "@/lib/current-user";
import { StatusUpdateForm } from "@/components/applications/status-update-form";
import { AddNoteForm } from "@/components/applications/add-note-form";
import { dateFormatter, dateTimeFormatter } from "@/lib/dates";
import type {
  ApplicationDetails,
  ApplicationNote,
  ApplicationStatus,
  JobPostingPublic,
  Profile,
} from "@/lib/types";

async function getApplication(applicationId: string): Promise<ApplicationDetails | null> {
  try {
    const response = await apiFetch(`/api/applications/${applicationId}`, { method: "GET" });
    if (response.status === 404) {
      return null;
    }
    const data = await response.json();
    return data && typeof data === "object" ? (data as ApplicationDetails) : null;
  } catch {
    return null;
  }
}

async function getApplicationNotes(applicationId: string): Promise<ApplicationNote[]> {
  try {
    const response = await apiFetch(`/api/applications/${applicationId}/notes`, { method: "GET" });
    const data = await response.json();
    return Array.isArray(data) ? (data as ApplicationNote[]) : [];
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

async function getCandidateProfile(candidateId: number | null | undefined, companyId: number | null): Promise<Profile | null> {
  if (!candidateId || !companyId) {
    return null;
  }

  try {
    const response = await apiFetch(`/api/profiles/candidates/${candidateId}/profile`, {
      method: "GET",
      headers: {
        "X-Company-ID": String(companyId),
      },
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data && typeof data === "object" ? (data as Profile) : null;
  } catch {
    return null;
  }
}

async function getViewerCompanyId(): Promise<number | null> {
  const viewer = await getCurrentUser();
  if (!viewer) {
    return null;
  }
  try {
    const response = await apiFetch(`/api/internal/companies/users/${viewer.id}/company`, { method: "GET" });
    const data = await response.json();
    const companyId = data?.id?.companyId ?? data?.companyId ?? null;
    return typeof companyId === "number" ? companyId : null;
  } catch {
    return null;
  }
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Đã nộp",
  SCREENING: "Sàng lọc",
  INTERVIEWING: "Phỏng vấn",
  OFFERED: "Đề nghị",
  HIRED: "Đã tuyển",
  REJECTED: "Đã từ chối",
};

function formatStatus(status: string) {
  const upper = status.toUpperCase() as ApplicationStatus;
  if (upper in STATUS_LABELS) {
    return STATUS_LABELS[upper];
  }
  return status
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Không rõ";
  }
  try {
    return dateTimeFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function formatProfileDate(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

type ApplicationDetailsPageProps = {
  params: Promise<{ applicationId: string }> | { applicationId: string };
};

export default async function ApplicationDetailsPage({
  params,
}: ApplicationDetailsPageProps) {
  const { applicationId } = await Promise.resolve(params);
  const application = await getApplication(applicationId);
  if (!application) {
    notFound();
  }
  const companyId = await getViewerCompanyId();

  const [job, notes, profile] = await Promise.all([
    getJobSummary(application.jobPostingId),
    getApplicationNotes(applicationId),
    getCandidateProfile(application.candidateId, companyId),
  ]);
  const profileCvs = profile?.cvs ?? [];
  const attachedCv = application.cvId ? profileCvs.find((cv) => cv.id === application.cvId) : null;
  const attachedCvLink =
    attachedCv?.downloadUrl ?? (attachedCv?.fileId ? `/api/files/${attachedCv.fileId}` : null);
  const attachedCvFallback = profileCvs.length > 0 ? "Đang cập nhật" : "Chưa đính kèm";

  const sortedExperiences = profile?.experiences
    ? profile.experiences
        .slice()
        .sort((a, b) => {
          const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
          const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
          return bTime - aTime;
        })
    : [];
  const latestExperience = sortedExperiences[0] ?? null;
  const primarySkills = profile?.skills?.slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <Link
          href={ROUTES.recruiterDashboard}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại bảng điều khiển
        </Link>

        <header className="rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
              {formatStatus(application.status)}
            </span>
            <h1 className="text-4xl font-bold text-gray-900">
              {job?.title ?? "Hồ sơ ứng tuyển"}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Ứng viên:</span>
                <span>{application.candidateName ?? "Đang cập nhật"}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Đội tuyển dụng:</span>
                <span>{job?.department ?? "Chưa xác định"}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Nộp hồ sơ:</span>
                <span>{formatDateTime(application.appliedAt)}</span>
              </div>
            </div>
          </div>
        </header>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {/* Thông tin việc làm */}
          <article className="rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Thông tin việc làm</h2>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {job?.description ??
                  "Chưa có mô tả chi tiết cho việc làm này. Có thể tin tuyển dụng đã được lưu trữ hoặc nhóm tuyển dụng chưa cập nhật nội dung mới."}
              </p>
            </div>
          </article>
          <article className="rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12h3m-3 4h3m-6-4h.01M9 16h.01M5 8h14M5 12h14M5 16h14M9 8v-.01M15 8v-.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">CV Ä‘Ã£ lÆ°u</h3>
              </div>
              {profileCvs.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  ChÆ°a cÃ³ CV Ä‘Æ°á»£c táº£i lÃªn. HÃ£y yÃªu cáº§u á»©ng viÃªn cÃºng cáº¥p má»™t bÃ¡n cÃ­nh cáº­p nháº­t.
                </p>
              ) : (
                <div className="space-y-3">
                  {profileCvs.map((cv) => {
                    const downloadHref = cv.downloadUrl ?? (cv.fileId ? `/api/files/${cv.fileId}` : null);
                    return (
                      <div
                        key={cv.id ?? cv.versionName}
                        className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {cv.versionName}
                            {cv.isDefault ? (
                              <span className="ml-2 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
                                MÆ°u mÆ·c Ä‘á»‹nh
                              </span>
                            ) : null}
                          </p>
                          <p className="text-sm text-gray-600">
                            Táº£o ngÃ y {formatProfileDate(cv.createdAt, "ChÆ°a rÃµ thá»i gian")}
                          </p>
                        </div>
                        {downloadHref ? (
                          <a
                            href={downloadHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-100"
                          >
                            TÃ¡i xuá»‘ng
                          </a>
                        ) : (
                          <span className="text-sm font-medium text-gray-500">ChÆ°a cÃ³ file Ä‘Ã­nh kÃ¨m</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </article>

          {/* Cập nhật trạng thái */}
          <article className="rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Trạng thái</h3>
                  <p className="text-sm text-gray-600">
                    Cập nhật giai đoạn quy trình sau khi đánh giá tiến độ của ứng viên.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <StatusUpdateForm
                  applicationId={application.id}
                  currentStatus={application.status as ApplicationStatus}
                />
              </div>
            </div>
          </article>

          {/* Ghi chú */}
          <article className="rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ghi chú</h3>
                  <p className="text-sm text-gray-600">
                    Ghi chú hiển thị với quản trị viên công ty và nhà tuyển dụng để giữ thông tin nhất quán.
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <AddNoteForm applicationId={application.id} />
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="rounded-xl border border-blue-200/50 bg-blue-50/50 px-6 py-5 text-sm text-blue-700">
                      <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Chưa có ghi chú nào. Hãy lưu lại phản hồi phỏng vấn hoặc các đầu việc cần theo dõi tại đây.</p>
                      </div>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 px-6 py-4 transition-all hover:shadow-md"
                      >
                        <p className="text-sm leading-relaxed text-gray-800">{note.content}</p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Người tạo {note.authorUserId ? "Thành viên tuyển dụng" : "Hệ thống"}</span>
                          <span>•</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatDateTime(note.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Sidebar - Thông tin ứng viên */}
        <div className="space-y-6">
          <article className="rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Thông tin ứng viên</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">Liên hệ chính</span>
                  <span className="font-bold text-blue-700">
                    {profile?.emailForCv ?? profile?.phoneNumber ?? "Chưa cung cấp"}
                  </span>
                </div>
                <div className="flex flex-col gap-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">CV liên kết</span>
                    <p className="text-sm font-semibold text-purple-700">
                      {attachedCv?.versionName ?? attachedCvFallback}
                    </p>
                  </div>
                  {attachedCv && attachedCvLink ? (
                    <a
                      href={attachedCvLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-50"
                    >
                      Xem CV
                    </a>
                  ) : null}
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">Nguồn</span>
                  <span className="font-bold text-amber-700">{application.source ?? "Không có"}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">Phụ trách</span>
                  <span className="font-bold text-emerald-700">
                    {application.ownerUserId ? "Đã phân công" : "Chưa gán"}
                  </span>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Tóm tắt hồ sơ</h3>
              </div>

              {profile ? (
                <div className="space-y-5">
                  <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 p-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Họ và tên</span>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {profile.fullName || application.candidateName || "Ứng viên"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 p-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Số điện thoại</span>
                    <p className="mt-1 font-semibold text-gray-900">
                      {profile.phoneNumber || "Chưa cung cấp"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 p-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Giới thiệu</span>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                      {profile.summary || "Chưa có phần giới thiệu."}
                    </p>
                  </div>

                  {primarySkills.length > 0 ? (
                    <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 p-4">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Kỹ năng</span>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {primarySkills.map((skill) => (
                          <span
                            key={skill.id}
                            className="rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-1.5 text-xs font-semibold text-blue-700"
                          >
                            {skill.skillName || "Kỹ năng"}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {latestExperience ? (
                    <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 p-4">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Kinh nghiệm gần nhất</span>
                      <p className="mt-2 text-base font-bold text-gray-900">
                        {latestExperience.title || "Chức danh"}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">{latestExperience.companyName || "Công ty"}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {formatProfileDate(latestExperience.startDate, "Không rõ")} -{" "}
                          {formatProfileDate(latestExperience.endDate, "Hiện tại")}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl border border-blue-200/50 bg-blue-50/50 px-6 py-5 text-sm text-blue-700">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Chưa có hồ sơ ứng viên. Hãy nhắc ứng viên hoàn thiện thông tin của họ.</p>
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
    </div>
  );
}
