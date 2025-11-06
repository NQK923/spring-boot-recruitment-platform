import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/routes";

const TRUST_POINTS = ["Miễn phí cho ứng viên", "Bảo mật thông tin cá nhân"] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-600/20 via-primary-500/15 to-accent-500/20"
      />
      <Container className="grid gap-8 py-20 md:grid-cols-2 md:py-28">
        <div className="space-y-8">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary-600">
            Phương án SaaS tinh gọn
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] text-text md:text-5xl">
            Tuyển đúng người – Nhanh hơn và minh bạch hơn.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Khám phá việc làm phù hợp hoặc quản lý tuyển dụng toàn quy trình trong một nền tảng duy nhất.
          </p>
          <div
            className="flex flex-wrap gap-4"
            role="group"
            aria-label="Tùy chọn dành cho ứng viên và nhà tuyển dụng"
          >
            <Button
              asChild
              size="lg"
              data-analytics-id="hero_cta_candidate"
              data-role="candidate"
              data-section="hero"
            >
              <Link href={ROUTES.candidatePortal} aria-label="Khám phá việc làm phù hợp dành cho ứng viên">
                Khám phá việc làm phù hợp
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              data-analytics-id="hero_cta_recruiter"
              data-role="recruiter"
              data-section="hero"
            >
              <Link href={ROUTES.recruiterDashboard} aria-label="Bắt đầu quản lý tuyển dụng cho doanh nghiệp">
                Dùng miễn phí ngay
              </Link>
            </Button>
          </div>
          <ul className="flex flex-wrap gap-3 text-sm text-muted" aria-label="Cam kết dịch vụ">
            {TRUST_POINTS.map((point) => (
              <li
                key={point}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 shadow-sm backdrop-blur"
              >
                <span aria-hidden="true" className="text-primary-600">
                  ✓
                </span>
                <span className="font-medium text-text">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-xl">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-500/15 via-primary-600/10 to-accent-500/15"
          />
          <p className="text-sm font-semibold text-primary-600">Pipeline minh bạch cho cả đội</p>
          <h2 className="mt-3 text-2xl font-bold text-text">
            Theo dõi từng bước tuyển dụng với số liệu realtime và nhắc việc tự động.
          </h2>
          <dl className="mt-8 space-y-4 text-sm text-muted">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-600">
                1
              </span>
              <div>
                <dt className="font-semibold text-text">Đăng tin trong vài cú nhấp</dt>
                <dd>Tự động gợi ý mô tả, mức seniority và quy trình phê duyệt phù hợp với từng phòng ban.</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-600">
                2
              </span>
              <div>
                <dt className="font-semibold text-text">Theo dõi trạng thái ứng viên realtime</dt>
                <dd>Bảng Kanban và nhật ký hoạt động giúp cả đội nhận thông báo ngay khi trạng thái thay đổi.</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-600">
                3
              </span>
              <div>
                <dt className="font-semibold text-text">Báo cáo minh bạch mỗi ngày</dt>
                <dd>Nắm rõ nguồn ứng viên, thời gian tuyển dụng trung bình và tỷ lệ chuyển đổi theo từng chiến dịch.</dd>
              </div>
            </div>
          </dl>
        </div>
      </Container>
    </section>
  );
}
