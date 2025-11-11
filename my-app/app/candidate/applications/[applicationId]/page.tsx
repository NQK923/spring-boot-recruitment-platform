import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { dateFormatter, dateTimeFormatter } from "@/lib/dates";
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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <Link
        href={ROUTES.candidatePortal}
        className="text-sm font-semibold text-muted hover:text-text"
      >
        Quay lại danh sách đơn ứng tuyển
      </Link>

      <header className="space-y-2">
        <span className="inline-flex items-center rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-text">
          {formatStatus(application.status)}
        </span>
        <h1 className="text-3xl font-semibold text-text">
          {job?.title ?? `Application #${application.id}`}
        </h1>
        <p className="text-sm text-muted">
          Công việc #{application.jobPostingId} - Đã nộp {formatDate(application.appliedAt, true)}
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-border bg-bg/70 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Tổng quan công việc</h2>
        <p className="whitespace-pre-wrap text-sm text-muted">
          {job?.description ??
            "Đội ngũ tuyển dụng đang chuẩn bị mô tả chi tiết, bao gồm trách nhiệm, trình độ chuyên môn và quyền lợi."}
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-bg/70 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Thông tin đơn ứng tuyển</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted">Trạng thái</dt>
            <dd className="font-semibold text-text">{formatStatus(application.status)}</dd>
          </div>
          <div>
            <dt className="text-muted">Ngày nộp</dt>
            <dd className="font-semibold text-text">{formatDate(application.appliedAt, true)}</dd>
          </div>
          <div>
            <dt className="text-muted">CV tham chiếu</dt>
            <dd className="font-semibold text-text">{application.cvId ?? "N/A"}</dd>
          </div>
          <div>
            <dt className="text-muted">Nguồn</dt>
            <dd className="font-semibold text-text">{application.source ?? "N/A"}</dd>
          </div>
          <div>
            <dt className="text-muted">Người phụ trách</dt>
            <dd className="font-semibold text-text">{application.ownerUserId ?? "Chưa được giao"}</dd>
          </div>
          <div>
            <dt className="text-muted">Tên ứng viên</dt>
            <dd className="font-semibold text-text">
              {application.candidateName ?? `Ứng viên #${application.candidateId}`}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-bg/70 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Phỏng vấn</h2>
        {interviews.length === 0 ? (
          <p className="text-sm text-muted">
            Chưa có lịch phỏng vấn nào. Bạn sẽ nhận được email khi nhà tuyển dụng sắp xếp lịch.
          </p>
        ) : (
          <div className="space-y-3 text-sm">
            {interviews.map((interview) => (
              <div key={interview.id} className="rounded-xl border border-border px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text">
                    {formatDate(interview.scheduleTime, true)}
                  </span>
                  <span className="text-xs text-muted">{interview.format ?? "Chưa có hình thức"}</span>
                </div>
                <p className="text-xs text-text/50">
                  {interview.locationOrLink ? interview.locationOrLink : "Địa điểm hoặc liên kết sẽ được chia sẻ"}
                </p>
                {interview.outcome ? (
                  <p className="mt-1 text-xs text-text/50">Kết quả: {interview.outcome}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
        {calendarHref ? (
          <Link href={calendarHref} className="text-sm font-semibold text-text hover:underline">
            Tải lịch phỏng vấn (.ics)
          </Link>
        ) : null}
      </section>
    </div>
  );
}
