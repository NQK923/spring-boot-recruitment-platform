import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getAccessTokenFromCookies } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import { ApplyForm } from "@/components/jobs/apply-form";
import type { CompanyPublicProfile, JobPostingPublic, MeResponse } from "@/lib/types";

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

type JobDetailsPageProps = {
  params: Promise<{ jobId: string }> | { jobId: string };
};

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const job = await getJob(resolvedParams.jobId);
  if (!job) {
    notFound();
  }
  const companyProfile = job.companyId ? await getCompanyProfile(job.companyId) : null;

  let canApply = false;
  const token = await getAccessTokenFromCookies();
  if (token) {
    const me = await getCurrentUser();
    canApply = me?.roles?.includes("CANDIDATE") ?? false;
  }

  const companyWebsiteRaw = companyProfile?.website ?? null;
  const companyWebsite =
    companyWebsiteRaw && companyWebsiteRaw.trim().length > 0
      ? companyWebsiteRaw.startsWith("http")
        ? companyWebsiteRaw
        : `https://${companyWebsiteRaw}`
      : null;

  return (
    <Container className="max-w-5xl space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-muted">
          <span>Vị trí #{job.id}</span>
          <span className="h-1 w-1 rounded-full bg-muted/50" />
          <span>Đăng tuyển công khai</span>
        </div>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{job.title}</h1>
        <p className="max-w-3xl text-sm text-foreground/70">
          Thông tin chi tiết được cung cấp trực tiếp từ đội ngũ tuyển dụng. Hãy ứng tuyển để tham gia pipeline, hoặc đăng nhập vào workspace ứng viên để theo dõi phỏng vấn và phản hồi.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel variant="surface" padding="lg" className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Tổng quan vị trí</h2>
              <p className="whitespace-pre-wrap text-sm text-foreground/70">
                {job.description ??
                  "Đội ngũ tuyển dụng đang hoàn thiện mô tả. Hãy quay lại sau hoặc theo dõi vị trí để nhận cập nhật."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Yêu cầu</h2>
              <p className="whitespace-pre-wrap text-sm text-foreground/70">
                {job.requirements ??
                  "Nhà tuyển dụng sẽ bổ sung kỹ năng, kinh nghiệm và công cụ bắt buộc ngay khi được xác nhận."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Quyền lợi</h2>
              <p className="whitespace-pre-wrap text-sm text-foreground/70">
                {job.benefits ??
                  "Thông tin quyền lợi và đãi ngộ sẽ được cập nhật khi bài đăng hoàn tất."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Khung lương</h2>
              <p className="whitespace-pre-wrap text-sm text-foreground/70">
                {job.salaryRange ??
                  "Thông tin lương sẽ hiển thị sau khi đội ngũ tuyển dụng xác định mức cụ thể cho vị trí này."}
              </p>
            </div>
          </Panel>

          <Panel variant="surface" padding="lg" className="text-sm text-foreground/70">
            <p className="font-semibold text-foreground">Quy trình tuyển dụng của đội ngũ này</p>
            <p className="mt-2">
              Hồ sơ sẽ được chuyển thẳng tới nhà tuyển dụng phụ trách. Bạn sẽ nhận cập nhật kịp thời, ghi chú nội bộ và lời mời phỏng vấn trong suốt quá trình.
            </p>
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel variant="glass" padding="lg" className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Về công ty</p>
              <h2 className="text-xl font-semibold text-foreground">
                {companyProfile?.name ?? "Đơn vị tuyển dụng"}
              </h2>
            </div>
            <p className="text-sm text-foreground/70">
              {companyProfile?.description ??
                "Đội ngũ tuyển dụng sẽ chia sẻ thêm về văn hóa, giá trị và sứ mệnh của công ty khi bài đăng được cập nhật."}
            </p>
            <dl className="space-y-3 text-sm text-foreground/70">
              <div>
                <dt className="font-semibold text-foreground">Quy mô nhân sự</dt>
                <dd>{companyProfile?.companySize ?? "Đang chờ nhà tuyển dụng xác nhận số lượng nhân sự."}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Văn phòng chính</dt>
                <dd>{companyProfile?.companyAddress ?? "Địa chỉ văn phòng sẽ được công bố sớm."}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Nơi làm việc</dt>
                <dd>{job.location ?? "Thông tin địa điểm sẽ hiển thị sau khi xác nhận."}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Hình thức làm việc</dt>
                <dd>{job.workType ?? "Đội ngũ sẽ sớm xác nhận kỳ vọng onsite, hybrid hoặc remote."}</dd>
              </div>
            </dl>
            {companyWebsite && (
              <Link
                href={companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-border/70 px-4 py-2 text-xs font-semibold text-foreground transition hover:border-foreground"
              >
                Truy cập trang công ty
              </Link>
            )}
          </Panel>
        </aside>
      </div>

      {canApply ? (
        <Panel variant="glass" padding="lg">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Gửi hồ sơ ứng tuyển</h2>
              <p className="text-sm text-foreground/70">
                Hãy gửi hồ sơ kèm CV mới nhất. Bạn có thể quản lý tài liệu và theo dõi trạng thái ngay trong portal ứng viên.
              </p>
            </div>
            <ApplyForm jobPostingId={job.id} />
          </div>
        </Panel>
      ) : (
        <Panel variant="glass" padding="lg" className="space-y-4 text-sm text-foreground/70">
          <div>
            <p className="font-semibold text-foreground">Sẵn sàng ứng tuyển?</p>
            <p>
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
        </Panel>
      )}
    </Container>
  );
}
