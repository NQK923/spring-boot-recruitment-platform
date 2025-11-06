import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
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

async function getCandidateProfile(candidateId: number | null | undefined): Promise<Profile | null> {
  if (!candidateId) {
    return null;
  }

  try {
    const response = await apiFetch(`/api/profiles/candidates/${candidateId}/profile`, {
      method: "GET",
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

  const [job, notes, profile] = await Promise.all([
    getJobSummary(application.jobPostingId),
    getApplicationNotes(applicationId),
    getCandidateProfile(application.candidateId),
  ]);

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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <Link
        href={ROUTES.recruiterDashboard}
        className="text-sm font-semibold text-foreground/70 hover:text-foreground"
      >
        Quay lại bảng điều khiển
      </Link>

      <header className="space-y-2">
        <span className="inline-flex items-center rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground">
          {formatStatus(application.status)}
        </span>
        <h1 className="text-3xl font-semibold text-foreground">
          {job?.title ?? `Hồ sơ #${application.id}`}
        </h1>
        <p className="text-sm text-foreground/60">
          Ứng viên: {application.candidateName ?? `#${application.candidateId}`} · Mã việc #
          {application.jobPostingId}
        </p>
        <p className="text-xs text-foreground/50">Nộp hồ sơ {formatDateTime(application.appliedAt)}</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <article className="space-y-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Thông tin việc làm</h2>
            <p className="whitespace-pre-wrap text-sm text-foreground/70">
              {job?.description ??
                "Chưa có mô tả chi tiết cho việc làm này. Có thể tin tuyển dụng đã được lưu trữ hoặc nhóm tuyển dụng chưa cập nhật nội dung mới."}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Trạng thái</h3>
            <p className="text-sm text-foreground/70">
              Cập nhật giai đoạn quy trình sau khi đánh giá tiến độ của ứng viên.
            </p>
            <div className="mt-3">
              <StatusUpdateForm
                applicationId={application.id}
                currentStatus={application.status as ApplicationStatus}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Ghi chú</h3>
            <p className="text-sm text-foreground/70">
              Ghi chú hiển thị với quản trị viên công ty và nhà tuyển dụng để giữ thông tin nhất quán.
            </p>
            <div className="mt-4 space-y-4">
              <AddNoteForm applicationId={application.id} />
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="rounded-xl border border-foreground/10 bg-background/60 px-4 py-4 text-sm text-foreground/60">
                    Chưa có ghi chú nào. Hãy lưu lại phản hồi phỏng vấn hoặc các đầu việc cần theo dõi tại đây.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl border border-foreground/10 px-4 py-3 text-sm text-foreground"
                    >
                      <p className="text-foreground/80">{note.content}</p>
                      <p className="mt-2 text-xs text-foreground/50">
                        Người tạo #{note.authorUserId} · {formatDateTime(note.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </article>

        <article className="space-y-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
          <div className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold text-foreground">Thông tin ứng viên</h2>
            <div className="flex justify-between">
              <span className="text-foreground/60">Mã ứng viên</span>
              <span className="font-semibold text-foreground">
                {application.candidateId ?? "Không rõ"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">CV liên kết</span>
              <span className="font-semibold text-foreground">{application.cvId ?? "Không có"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Nguồn</span>
              <span className="font-semibold text-foreground">{application.source ?? "Không có"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Phụ trách</span>
              <span className="font-semibold text-foreground">
                {application.ownerUserId ?? "Chưa gán"}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="text-sm font-semibold text-foreground">Tóm tắt hồ sơ</h3>
            {profile ? (
              <div className="space-y-3">
                <div>
                  <span className="text-foreground/60">Họ và tên</span>
                  <p className="font-semibold text-foreground">
                    {profile.fullName || `Ứng viên #${application.candidateId}`}
                  </p>
                </div>
                <div>
                  <span className="text-foreground/60">Số điện thoại</span>
                  <p className="font-semibold text-foreground">
                    {profile.phoneNumber || "Chưa cung cấp"}
                  </p>
                </div>
                <div>
                  <span className="text-foreground/60">Giới thiệu</span>
                  <p className="text-foreground/70">
                    {profile.summary || "Chưa có phần giới thiệu."}
                  </p>
                </div>
                {primarySkills.length > 0 ? (
                  <div>
                    <span className="text-foreground/60">Kỹ năng</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {primarySkills.map((skill) => (
                        <span
                          key={skill.id}
                          className="rounded-full border border-foreground/10 px-3 py-1 text-xs font-medium text-foreground/70"
                        >
                          {skill.skillName || "Kỹ năng"}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {latestExperience ? (
                  <div>
                    <span className="text-foreground/60">Kinh nghiệm gần nhất</span>
                    <p className="font-semibold text-foreground">
                      {latestExperience.title || "Chức danh"}
                    </p>
                    <p className="text-xs text-foreground/50">
                      {latestExperience.companyName || "Công ty"} (
                      {formatProfileDate(latestExperience.startDate, "Không rõ")} -{" "}
                      {formatProfileDate(latestExperience.endDate, "Hiện tại")})
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="rounded-xl border border-foreground/10 bg-background/60 px-4 py-4 text-sm text-foreground/60">
                Chưa có hồ sơ ứng viên. Hãy nhắc ứng viên hoàn thiện thông tin của họ.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
