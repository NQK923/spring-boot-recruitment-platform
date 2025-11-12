import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getAccessTokenFromCookies } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import { ApplyForm } from "@/components/jobs/apply-form";
import type { CompanyPublicProfile, JobPostingPublic, MeResponse, Cv } from "@/lib/types";

async function getJob(jobId: string): Promise<JobPostingPublic | null> {
  try {
    const response = await apiFetch(`/api/jobs/public/${jobId}`, {
      method: "GET",
      skipAuthHeaders: true,
      cache: "no-store",
    });
    if (response.status === 404) {
      return null;
    }
    const data = await response.json();
    return (data && typeof data === "object") ? (data as JobPostingPublic) : null;
  } catch {
    return null;
  }
}

async function getCurrentUser(): Promise<MeResponse | null> {
  try {
    const response = await apiFetch("/api/auth/me", { method: "GET" });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data as MeResponse;
  } catch {
    return null;
  }
}

async function getCompanyProfile(companyId: number): Promise<CompanyPublicProfile | null> {
  try {
    const response = await apiFetch(`/api/companies/public/${companyId}`, {
      method: "GET",
      skipAuthHeaders: true,
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data as CompanyPublicProfile;
  } catch {
    return null;
  }
}

type CandidateCvSummary = {
  id: number;
  versionName: string;
  isDefault: boolean;
  createdAt: string | null;
};

async function getCandidateCvs(): Promise<CandidateCvSummary[]> {
  try {
    const response = await apiFetch("/api/profiles/me/cvs", { method: "GET" });
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return (data as Cv[]).map((cv) => ({
      id: cv.id,
      versionName: (cv.versionName ?? "").trim() || "CV chưa đặt tên",
      isDefault: Boolean(cv.isDefault),
      createdAt: cv.createdAt ?? null,
    }));
  } catch {
    return [];
  }
}

type JobDetailsPageProps = {
  params: Promise<{ jobId: string }> | { jobId: string };
};

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const job = await getJob(resolvedParams.jobId);
  if (!job) {
    notFound();
  }
  const totalSlots = Math.max(job.hiringQuantity ?? 1, 1);
  const remainingSlots = Math.max(Math.min(job.availableSlots ?? totalSlots, totalSlots), 0);
  const hiredCount = Math.max(totalSlots - remainingSlots, 0);
  const hiringStatusText =
    remainingSlots > 0
      ? `Còn ${remainingSlots} vị trí trống`
      : "Đã tuyển đủ số lượng – vẫn tiếp nhận hồ sơ dự phòng";
  const companyProfile = job.companyId ? await getCompanyProfile(job.companyId) : null;

  let canApply = false;
  let candidateCvs: CandidateCvSummary[] = [];
  const token = await getAccessTokenFromCookies();
  if (token) {
    const me = await getCurrentUser();
    const isCandidate = me?.roles?.includes("CANDIDATE") ?? false;
    canApply = isCandidate;
    if (isCandidate) {
      candidateCvs = await getCandidateCvs();
    }
  }

  const companyWebsiteRaw = companyProfile?.website ?? null;
  const companyWebsite =
    companyWebsiteRaw && companyWebsiteRaw.trim().length > 0
      ? companyWebsiteRaw.startsWith("http")
        ? companyWebsiteRaw
        : `https://${companyWebsiteRaw}`
      : null;

  return (
    <Container className="max-w-5xl space-y-8 py-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-indigo-600">
          <span className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1 text-emerald-700">Đăng tuyển công khai</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">{job.title}</h1>
        <p className="max-w-3xl text-base leading-relaxed text-slate-600 font-medium">
          Thông tin chi tiết được cung cấp trực tiếp từ đội ngũ tuyển dụng. Hãy ứng tuyển để tham gia pipeline, hoặc đăng nhập vào workspace ứng viên để theo dõi phỏng vấn và phản hồi.
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            👥 {totalSlots} vị trí cần tuyển
          </span>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
              remainingSlots > 0
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {remainingSlots > 0 ? "⚡" : "ℹ️"} {hiringStatusText}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel padding="lg" className="space-y-6 border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <span>📋</span>
                <span>Tổng quan vị trí</span>
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium">
                {job.description ??
                  "Đội ngũ tuyển dụng đang hoàn thiện mô tả. Hãy quay lại sau hoặc theo dõi vị trí để nhận cập nhật."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <span>✅</span>
                <span>Yêu cầu</span>
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium">
                {job.requirements ??
                  "Nhà tuyển dụng sẽ bổ sung kỹ năng, kinh nghiệm và công cụ bắt buộc ngay khi được xác nhận."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <span>🎁</span>
                <span>Quyền lợi</span>
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium">
                {job.benefits ??
                  "Thông tin quyền lợi và đãi ngộ sẽ được cập nhật khi bài đăng hoàn tất."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <span>💰</span>
                <span>Khung lương</span>
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium">
                {job.salaryRange ??
                  "Thông tin lương sẽ hiển thị sau khi đội ngũ tuyển dụng xác định mức cụ thể cho vị trí này."}
              </p>
            </div>
          </Panel>

          <Panel padding="lg" className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <div className="space-y-3">
              <p className="text-base font-bold text-purple-900 flex items-center gap-2">
                <span>🔄</span>
                <span>Quy trình tuyển dụng của đội ngũ này</span>
              </p>
              <p className="text-sm leading-relaxed text-slate-700 font-medium">
                Hồ sơ sẽ được chuyển thẳng tới nhà tuyển dụng phụ trách. Bạn sẽ nhận cập nhật kịp thời, ghi chú nội bộ và lời mời phỏng vấn trong suốt quá trình.
              </p>
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel padding="lg" className="space-y-5 border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">🏢 Về công ty</p>
              <h2 className="text-2xl font-bold text-slate-900">
                {companyProfile?.name ?? "Đơn vị tuyển dụng"}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 font-medium">
              {companyProfile?.description ??
                "Đội ngũ tuyển dụng sẽ chia sẻ thêm về văn hóa, giá trị và sứ mệnh của công ty khi bài đăng được cập nhật."}
            </p>
            <dl className="space-y-4 text-sm">
              <div className="space-y-1">
                <dt className="font-bold text-indigo-900">👥 Quy mô nhân sự</dt>
                <dd className="text-slate-700 font-medium">{companyProfile?.companySize ?? "Đang chờ nhà tuyển dụng xác nhận số lượng nhân sự."}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-bold text-indigo-900">📍 Văn phòng chính</dt>
                <dd className="text-slate-700 font-medium">{companyProfile?.companyAddress ?? "Địa chỉ văn phòng sẽ được công bố sớm."}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-bold text-indigo-900">🌍 Nơi làm việc</dt>
                <dd className="text-slate-700 font-medium">{job.location ?? "Thông tin địa điểm sẽ hiển thị sau khi xác nhận."}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-bold text-indigo-900">💼 Hình thức làm việc</dt>
                <dd className="text-slate-700 font-medium">{job.workType ?? "Đội ngũ sẽ sớm xác nhận kỳ vọng onsite, hybrid hoặc remote."}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-bold text-indigo-900">👥 Số lượng tuyển</dt>
                <dd className="text-slate-700 font-medium">
                  {totalSlots} vị trí · {hiringStatusText}
                  {hiredCount > 0 && (
                    <span className="block text-xs font-semibold text-slate-500">
                      Đã có {hiredCount} ứng viên nhận offer.
                    </span>
                  )}
                </dd>
              </div>
            </dl>
            {companyWebsite && (
              <Link
                href={companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-2.5 text-sm font-bold text-indigo-700 transition hover:border-indigo-400 hover:shadow-md"
              >
                Truy cập trang công ty →
              </Link>
            )}
          </Panel>
        </aside>
      </div>

      {canApply ? (
        <Panel padding="lg" className="border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
                <span>📝</span>
                <span>Gửi hồ sơ ứng tuyển</span>
              </h2>
              <p className="text-sm text-slate-700 font-medium">
                Hãy gửi hồ sơ kèm CV mới nhất. Bạn có thể quản lý tài liệu và theo dõi trạng thái ngay trong portal ứng viên.
              </p>
              {remainingSlots <= 0 && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                  Đội ngũ đã tuyển đủ số lượng chính thức nhưng vẫn tiếp nhận hồ sơ dự phòng cho các đợt mở rộng tiếp theo.
                </p>
              )}
            </div>
            <ApplyForm jobPostingId={job.id} candidateCvs={candidateCvs} />
          </div>
        </Panel>
      ) : (
        <Panel padding="lg" className="border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xl font-bold text-amber-900 flex items-center gap-2">
                <span>🚀</span>
                <span>Sẵn sàng ứng tuyển?</span>
              </p>
              <p className="text-sm text-slate-700 font-medium">
                Đăng nhập bằng tài khoản ứng viên để nộp hồ sơ và theo dõi các giai đoạn trong portal chuyên biệt.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`${ROUTES.signIn}?next=${ROUTES.jobs}/${job.id}`}>
                <Button size="md">Đăng nhập để ứng tuyển</Button>
              </Link>
              <Link href={ROUTES.register}>
                <Button size="md" variant="secondary">
                  Tạo tài khoản ứng viên
                </Button>
              </Link>
            </div>
          </div>
        </Panel>
      )}
    </Container>
  );
}
