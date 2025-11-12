import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { dateFormatter, dateTimeFormatter } from "@/lib/dates";
import { OfferDecisionForm } from "@/components/candidate/OfferDecisionForm";
import type { ApplicationDetails, Interview, JobPostingPublic } from "@/lib/types";

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

async function getInterviewsForApplication(applicationId: number): Promise<Interview[]> {
  try {
    const response = await apiFetch("/api/interviews/my", { method: "GET" });
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return (data as Interview[]).filter((interview) => interview.applicationId === applicationId);
  } catch {
    return [];
  }
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

const OFFER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Đang chờ bạn phản hồi",
  ACCEPTED: "Bạn đã nhận lời",
  DECLINED: "Bạn đã từ chối",
};

function formatDate(value: string | null | undefined, includeTime = false) {
  if (!value) {
    return "Unknown";
  }
  try {
    const date = new Date(value);
    return includeTime ? dateTimeFormatter.format(date) : dateFormatter.format(date);
  } catch {
    return value;
  }
}

type CandidateApplicationDetailsPageProps = {
  params: Promise<{ applicationId: string }> | { applicationId: string };
};

export default async function CandidateApplicationDetailsPage({
  params,
}: CandidateApplicationDetailsPageProps) {
  const { applicationId } = await Promise.resolve(params);
  const application = await getApplication(applicationId);
  if (!application) {
    notFound();
  }

  const [job, interviews] = await Promise.all([
    getJobSummary(application.jobPostingId),
    getInterviewsForApplication(application.id),
  ]);

  const nextInterview = interviews
    .slice()
    .sort((a, b) => {
      const aTime = a.scheduleTime ? new Date(a.scheduleTime).getTime() : Infinity;
      const bTime = b.scheduleTime ? new Date(b.scheduleTime).getTime() : Infinity;
      return aTime - bTime;
    })[0];

  const calendarHref = nextInterview ? `/api/interviews/${nextInterview.id}/calendar` : null;
  const structuredInterview = application.interviewDetails ?? null;
  const offerDetails = application.offerDetails ?? null;
  const offerStatusLabel = offerDetails
    ? OFFER_STATUS_LABELS[offerDetails.status] ?? formatStatus(offerDetails.status)
    : null;
  const canRespondOffer = offerDetails?.status === "PENDING";
  const offerSalaryDisplay =
    offerDetails != null
      ? Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: offerDetails.currency ?? "VND",
          maximumFractionDigits: 2,
        }).format(Number(offerDetails.salaryAmount ?? 0))
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6">
        <Link
          href={ROUTES.candidatePortal}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách đơn ứng tuyển
        </Link>

        <header className="rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
              {formatStatus(application.status)}
            </span>
            <h1 className="text-4xl font-bold text-gray-900">
              {job?.title ?? `Đơn ứng tuyển #${application.id}`}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Công việc #</span>
                <span>{application.jobPostingId}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Đã nộp:</span>
                <span>{formatDate(application.appliedAt, true)}</span>
              </div>
            </div>
          </div>
        </header>

      <section className="space-y-6 rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Thông tin đơn ứng tuyển</h2>
        </div>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wider text-blue-600">Trạng thái</dt>
            <dd className="mt-1 font-bold text-blue-900">{formatStatus(application.status)}</dd>
          </div>
          <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wider text-purple-600">Ngày nộp</dt>
            <dd className="mt-1 font-bold text-purple-900">{formatDate(application.appliedAt, true)}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-6 rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h6M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Phỏng vấn</h2>
        </div>
        {structuredInterview ? (
          <div className="space-y-3 rounded-2xl border border-blue-200/80 bg-blue-50/60 p-5 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Buổi phỏng vấn tiếp theo</p>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 0 0118 0z" />
              </svg>
              <p className="text-base font-bold text-gray-900">
                {formatDate(structuredInterview.scheduledAt, true)}{" "}
                {structuredInterview.timezone ? `(${structuredInterview.timezone})` : ""}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="font-medium text-gray-800">
                {structuredInterview.location ?? "Sẽ được thông báo"}
              </p>
            </div>
            {structuredInterview.instructions ? (
              <div className="rounded-xl border border-blue-100 bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">Hướng dẫn</p>
                <p className="text-sm text-gray-700">{structuredInterview.instructions}</p>
              </div>
            ) : null}
            <div className="flex items-start gap-2 rounded-lg bg-blue-100/50 px-3 py-2">
              <svg className="h-4 w-4 mt-0.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-800">Bạn sẽ nhận email nhắc nhở trước giờ phỏng vấn.</p>
            </div>
          </div>
        ) : null}
        {!structuredInterview && interviews.length === 0 ? (
          <div className="rounded-xl border border-gray-200/50 bg-gray-50/50 px-6 py-5 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Chưa có lịch phỏng vấn nào. Bạn sẽ nhận được email và thông báo ngay khi nhà tuyển dụng sắp xếp lịch.</p>
            </div>
          </div>
        ) : null}
        {interviews.length > 0 ? (
          <div className="space-y-3 text-sm">
            {interviews.map((interview) => (
              <div key={interview.id} className="rounded-xl border border-gray-200 bg-gray-50/50 px-5 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-gray-900">
                      {formatDate(interview.scheduleTime, true)}
                    </span>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {interview.format ?? "Chưa rõ hình thức"}
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {interview.locationOrLink ? interview.locationOrLink : "Địa điểm hoặc liên kết sẽ được chia sẻ"}
                </p>
                {interview.outcome ? (
                  <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    Kết quả: {interview.outcome}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        {calendarHref ? (
          <Link 
            href={calendarHref} 
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Tải lịch phỏng vấn (.ics)
          </Link>
        ) : null}
      </section>

      <section className="space-y-6 rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Đề nghị tuyển dụng</h2>
        </div>
        {offerDetails ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Mức lương</p>
                <p className="mt-1 text-xl font-bold text-amber-900">{offerSalaryDisplay}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Trạng thái</p>
                <p className="mt-1 text-base font-bold text-emerald-900">{offerStatusLabel}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Hạn phản hồi</p>
                <p className="mt-1 text-sm font-medium text-blue-900">
                  {offerDetails.expiresAt ? formatDate(offerDetails.expiresAt, true) : "Không giới hạn"}
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-purple-600">Ghi chú</p>
                <p className="mt-1 text-sm font-medium text-purple-900">
                  {offerDetails.notes ?? "Không có ghi chú thêm"}
                </p>
              </div>
            </div>
            {canRespondOffer ? (
              <OfferDecisionForm applicationId={application.id} />
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-emerald-700">
                  {offerDetails.status === "ACCEPTED"
                    ? "Cảm ơn bạn đã xác nhận. Bộ phận nhân sự sẽ gửi hướng dẫn nhận việc trong email tiếp theo."
                    : "Bạn đã từ chối đề nghị này. Nếu muốn thay đổi quyết định, hãy liên hệ trực tiếp với nhà tuyển dụng."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200/50 bg-gray-50/50 px-6 py-5 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Chưa có đề nghị chính thức. Khi nhà tuyển dụng gửi offer, bạn sẽ thấy chi tiết và có thể xác nhận hoặc từ chối ngay tại đây.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  </div>
  );
}
