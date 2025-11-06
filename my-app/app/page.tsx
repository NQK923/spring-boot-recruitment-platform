import type { JSX } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/current-user";
import { ROUTES } from "@/lib/routes";
import type { JobPostingPublic, PaginatedResponse, MeResponse } from "@/lib/types";

const LATEST_JOBS_LIMIT = 6;

type JourneyStep = {
  title: string;
  description: string;
};

type JourneyTrack = {
  id: "candidate" | "recruiter";
  label: string;
  title: string;
  caption: string;
  steps: JourneyStep[];
};

const JOURNEYS: JourneyTrack[] = [
  {
    id: "candidate",
    label: "Ứng viên",
    title: "Làm chủ mọi bước trong hành trình tìm việc",
    caption: "Quản lý hồ sơ, ứng tuyển trong vài phút và theo dõi tiến độ với cập nhật tức thời.",
    steps: [
      {
        title: "Hoàn thiện hồ sơ nổi bật",
        description:
          "Đồng bộ CV, kinh nghiệm và kỹ năng để nhà tuyển dụng nhìn thấy thế mạnh của bạn ngay lập tức.",
      },
      {
        title: "Ứng tuyển không cần nhập lại",
        description:
          "Gửi hồ sơ chỉ với vài cú nhấp chuột nhờ tận dụng dữ liệu bạn đã lưu trước đó.",
      },
      {
        title: "Luôn nắm bắt tiến độ",
        description:
          "Nhận thông báo thay đổi trạng thái và lịch phỏng vấn tức thì để biết bước tiếp theo là gì.",
      },
    ],
  },
  {
    id: "recruiter",
    label: "Nhà tuyển dụng",
    title: "Tăng tốc với một pipeline thống nhất",
    caption: "Điều phối tuyển dụng, phỏng vấn và trao đổi nội bộ với đầy đủ bối cảnh chung.",
    steps: [
      {
        title: "Khởi động chiến dịch tuyển dụng",
        description:
          "Đăng tin tuyển dụng, mời đồng đội cùng tham gia và phân công phụ trách cho từng workspace.",
      },
      {
        title: "Ưu tiên đúng ứng viên",
        description:
          "Giao diện pipeline hiển thị ghi chú, nhiệm vụ và lịch sử để cả đội luôn đồng bộ.",
      },
      {
        title: "Lên lịch và chốt offer tự tin",
        description:
          "Lịch ICS và email tự động giúp ứng viên được chăm sóc ở mọi giai đoạn.",
      },
    ],
  },
];

const TESTIMONIALS = [
  {
    quote:
      "TalentFlow giúp tôi nắm rõ từng mốc thời gian nên có thể chuẩn bị cho mọi buổi phỏng vấn mà không phải chờ email.",
    author: "Minh Anh",
    role: "Nhà thiết kế sản phẩm",
  },
  {
    quote:
      "Đội tuyển dụng của chúng tôi cuối cùng cũng làm việc trong một không gian. Ghi chú, nhiệm vụ và trạng thái không bao giờ bị thất lạc.",
    author: "Phương Nam",
    role: "Trưởng nhóm Tuyển dụng",
  },
  {
    quote:
      "Triển khai TalentFlow cho nhiều công ty diễn ra nhẹ nhàng. Quản trị chặt chẽ mà mỗi team vẫn giữ được góc nhìn riêng.",
    author: "Lan Hương",
    role: "Quản lý Vận hành Nhân sự",
  },
];

const TRUSTED_COMPANIES = [
  "Aidata",
  "BluePeak Studio",
  "NextOne Labs",
  "Southwind Group",
  "TechNext",
  "Vega Commerce",
];

async function getLatestJobs(): Promise<JobPostingPublic[]> {
  try {
    const params = new URLSearchParams({
      page: "0",
      size: String(LATEST_JOBS_LIMIT),
    });

    const response = await apiFetch(`/api/jobs/public?${params.toString()}`, {
      method: "GET",
      skipAuthHeaders: true,
      cache: "no-store",
    });

    const data = (await response.json()) as PaginatedResponse<JobPostingPublic>;
    return (data.items ?? [])
      .filter((item): item is JobPostingPublic => Boolean(item))
      .slice(0, LATEST_JOBS_LIMIT);
  } catch {
    return [];
  }
}

function formatJobSummary(job: JobPostingPublic) {
  const base =
    job.description ??
    job.requirements ??
    "Nhà tuyển dụng sẽ sớm bổ sung mô tả chi tiết. Vui lòng quay lại sau.";
  return base.length > 160 ? `${base.slice(0, 157)}…` : base;
}

function renderHeroActions(viewer: MeResponse | null): JSX.Element {
  if (!viewer) {
    return (
      <>
        <Link href={ROUTES.register}>
          <Button size="lg">Tạo hồ sơ ứng viên</Button>
        </Link>
        <Link href={ROUTES.signIn}>
          <Button size="lg" variant="secondary">
            Đăng nhập dành cho nhà tuyển dụng
          </Button>
        </Link>
      </>
    );
  }

  const roles = new Set(viewer.roles ?? []);

  if (roles.has("SUPER_ADMIN")) {
    return (
      <>
        <Link href={ROUTES.superAdminDashboard}>
          <Button size="lg">Mở bảng điều khiển Super Admin</Button>
        </Link>
        <Link href={ROUTES.docs}>
          <Button size="lg" variant="secondary">
            Danh sách kiểm triển khai
          </Button>
        </Link>
      </>
    );
  }

  if (roles.has("COMPANY_ADMIN")) {
    return (
      <>
        <Link href={ROUTES.companyAdminDashboard}>
          <Button size="lg">Vào workspace của công ty</Button>
        </Link>
        <Link href={ROUTES.recruiterDashboard}>
          <Button size="lg" variant="secondary">
            Xem bảng điều khiển tuyển dụng
          </Button>
        </Link>
      </>
    );
  }

  if (roles.has("RECRUITER")) {
    return (
      <>
        <Link href={ROUTES.recruiterDashboard}>
          <Button size="lg">Mở bảng điều khiển tuyển dụng</Button>
        </Link>
        <Link href={ROUTES.jobs}>
          <Button size="lg" variant="secondary">
            Xem các vị trí đang tuyển
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href={ROUTES.candidateProfile}>
        <Button size="lg">Đến hồ sơ của tôi</Button>
      </Link>
      <Link href={ROUTES.jobs}>
        <Button size="lg" variant="secondary">
          Xem việc làm đang mở
        </Button>
      </Link>
    </>
  );
}

function LatestJobCard({ job }: { job: JobPostingPublic }) {
  const location = job.location?.trim() || "Làm việc từ xa hoặc tại văn phòng";
  const workType = job.workType?.trim() || "Toàn thời gian";
  const department = job.department?.trim();
  const summary = formatJobSummary(job);

  return (
    <Panel className="flex h-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600/70">
          {workType}
        </span>
        <h3 className="text-xl font-semibold text-text">{job.title}</h3>
        <p className="text-sm leading-relaxed text-muted">{summary}</p>
      </div>

      <div className="mt-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border border-foreground/15 px-3 py-1">{location}</span>
          {department ? (
            <span className="rounded-full border border-foreground/15 px-3 py-1">
              {department}
            </span>
          ) : null}
        </div>
        <Link href={`${ROUTES.jobs}/${job.id}`}>
          <Button size="sm" variant="secondary">
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </Panel>
  );
}

export default async function Home() {
  const [viewer, latestJobs] = await Promise.all([
    getCurrentUser().catch(() => null),
    getLatestJobs(),
  ]);

  return (
    <main className="flex flex-col gap-24 pb-24">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-accent-600/80 to-primary-500">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--accent-500)_0%,_transparent_55%)] opacity-40" />
        <Container className="flex flex-col gap-16 py-20 text-surface lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-surface/70">
              Giải pháp tuyển dụng toàn diện
            </span>
            <h1 className="text-4xl font-semibold sm:text-5xl">
              Kết nối ứng viên và đội ngũ tuyển dụng trên cùng một nền tảng
            </h1>
            <p className="text-base leading-relaxed text-surface/80">
              TalentFlow hợp nhất đăng tuyển, giao tiếp với ứng viên và điều phối phỏng vấn, trong khi
              gateway đảm bảo mọi kết nối luôn an toàn.
            </p>
            <div className="flex flex-wrap gap-3">{renderHeroActions(viewer)}</div>
            <div className="flex flex-wrap gap-3 text-xs text-surface/60">
              <span className="rounded-full border border-white/20 px-3 py-1">
                Bảo mật JWT end-to-end
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                Sẵn sàng triển khai đa doanh nghiệp
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                Chỉ số pipeline theo thời gian thực
              </span>
            </div>
          </div>
          <Panel variant="glass" className="bg-surface/10 text-left text-sm text-text backdrop-blur-md">
            <div className="space-y-4">
              <p className="text-lg font-semibold text-surface">TalentFlow hỗ trợ:</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-400" />
                  <span>
                    <strong className="font-semibold text-surface">Ứng viên</strong> quản lý CV, đơn ứng
                    tuyển và thông báo mà không bỏ lỡ bối cảnh.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-sky-400" />
                  <span>
                    <strong className="font-semibold text-surface">Nhà tuyển dụng</strong> phối hợp trên
                    pipeline chung với nhiệm vụ, ghi chú và kế hoạch phỏng vấn.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-violet-400" />
                  <span>
                    <strong className="font-semibold text-surface">Quản trị viên</strong> kiểm soát triển
                    khai đa doanh nghiệp với bảng điều khiển và dấu vết kiểm soát.
                  </span>
                </li>
              </ul>
            </div>
          </Panel>
        </Container>
      </section>

      <section className="py-16">
        <Container className="space-y-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                Việc làm mới nhất
              </span>
              <h2 className="text-3xl font-semibold text-text sm:text-4xl">
                Những vị trí đang tuyển ngay lúc này
              </h2>
              <p className="max-w-2xl text-sm text-muted">
                Đón đầu cơ hội mới trước khi người khác kịp ứng tuyển. Đăng nhập để nộp hồ sơ ngay và nhận thông báo tiến độ.
              </p>
            </div>
            <Link href={ROUTES.jobs}>
              <Button variant="ghost" size="md">
                Xem tất cả việc làm
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {latestJobs.length > 0 ? (
              latestJobs.map((job) => <LatestJobCard key={job.id} job={job} />)
            ) : (
              <Panel className="md:col-span-2 xl:col-span-3">
                <div className="flex flex-col gap-4 text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-text">Chưa có việc làm nào được đăng</h3>
                  <p className="text-sm text-muted">
                    Khi nhà tuyển dụng đăng tin, chúng sẽ xuất hiện tại đây ngay lập tức. Quay lại sau hoặc đăng nhập để là người tạo bài đăng đầu tiên.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                    <Link href={ROUTES.recruiterDashboard}>
                      <Button size="sm">Đăng việc làm mới</Button>
                    </Link>
                    <Link href={ROUTES.jobs}>
                      <Button size="sm" variant="secondary">
                        Xem bảng việc làm
                      </Button>
                    </Link>
                  </div>
                </div>
              </Panel>
            )}
          </div>
        </Container>
      </section>

      <section>
        <Container className="space-y-10">
          <div className="space-y-2 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
              Cách thức vận hành
            </span>
            <h2 className="text-3xl font-semibold text-text sm:text-4xl">
              Lộ trình được thiết kế riêng cho từng vai trò
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted">
              Các microservice chia sẻ bối cảnh qua gateway để ứng viên, nhà tuyển dụng và quản trị viên luôn biết bước tiếp theo.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {JOURNEYS.map((journey) => (
              <Panel key={journey.id} className="flex h-full flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600/70">
                    {journey.label}
                  </span>
                  <h3 className="text-2xl font-semibold text-text">{journey.title}</h3>
                  <p className="text-sm text-muted">{journey.caption}</p>
                </div>
                <div className="space-y-4">
                  {journey.steps.map((step, index) => (
                    <div
                      key={step.title}
                      className="flex gap-4 rounded-xl border border-border bg-surface px-4 py-4"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent-500/10 text-sm font-semibold text-accent-600">
                        {(index + 1).toString().padStart(2, "0")}
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-text">{step.title}</p>
                        <p className="text-sm text-muted">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface/60 py-16">
        <Container className="space-y-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                Khách hàng tin dùng
              </span>
              <h2 className="text-3xl font-semibold text-text sm:text-4xl">
                Những đội ngũ đang phát triển cùng TalentFlow
              </h2>
              <p className="text-sm text-muted">
                Họ tự động hóa email nhắc nhở, chia sẻ dashboard với lãnh đạo và giữ cho ứng viên được cập nhật ở từng giai đoạn.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              {TRUSTED_COMPANIES.map((company) => (
                <span
                  key={company}
                  className="rounded-full border border-foreground/15 px-3 py-1"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <Panel key={item.author} className="flex h-full flex-col justify-between gap-6">
                <p className="text-sm leading-relaxed text-text/80">“{item.quote}”</p>
                <div>
                  <p className="text-sm font-semibold text-text">{item.author}</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-text/50">
                    {item.role}
                  </p>
                </div>
              </Panel>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <Panel className="flex flex-col items-center gap-6 bg-gradient-to-r from-accent-500/10 to-transparent text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-primary-600/70">
              Sẵn sàng bắt đầu
            </span>
            <h2 className="max-w-2xl text-3xl font-semibold text-text sm:text-4xl">
              Khởi động quy trình tuyển dụng hiện đại ngay hôm nay
            </h2>
            <p className="max-w-xl text-sm text-muted">
              Kết nối với gateway, tích hợp dịch vụ của bạn và tiến từ đăng tuyển đến chốt offer mà không mất bối cảnh.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={ROUTES.register}>
                <Button size="lg">Bắt đầu với vai trò ứng viên</Button>
              </Link>
              <Link href={ROUTES.signIn}>
                <Button size="lg" variant="secondary">
                  Liên hệ đội tuyển dụng
                </Button>
              </Link>
            </div>
          </Panel>
        </Container>
      </section>
    </main>
  );
}
