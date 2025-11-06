import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { ROUTES } from "@/lib/routes";

const TRUST_BADGES = [
  { icon: "✓", label: "Miễn phí cho ứng viên" },
  { icon: "🔒", label: "Bảo mật thông tin cá nhân" },
] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-accent-600/85 to-primary-500 text-surface">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),_transparent_60%)] opacity-70" />
      <Container className="grid gap-12 py-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:py-28">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-surface/80">
            Nền tảng tuyển dụng hợp nhất
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-[2.9rem] md:leading-[1.1]">
            Tuyển đúng người – Nhanh hơn và minh bạch hơn.
          </h1>
          <p className="max-w-xl text-base text-surface/85 md:text-lg">
            Khám phá việc làm phù hợp hoặc quản lý tuyển dụng toàn quy trình trong một nền tảng duy nhất – từ đăng tin,
            sàng lọc đến phỏng vấn và gửi offer.
          </p>
          <div className="flex flex-wrap gap-4" role="group" aria-label="CTA dành cho ứng viên và nhà tuyển dụng">
            <Button
              asChild
              size="lg"
              data-analytics-id="hero_cta_candidate"
              data-role="candidate"
              data-section="hero"
              className="shadow-lg shadow-primary-900/20"
            >
              <Link href={ROUTES.candidatePortal}>Khám phá việc làm phù hợp</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              data-analytics-id="hero_cta_recruiter"
              data-role="recruiter"
              data-section="hero"
              className="border border-surface/40 bg-surface/10 text-surface hover:bg-surface/20"
            >
              <Link href={ROUTES.recruiterDashboard}>Dùng miễn phí ngay</Link>
            </Button>
          </div>
          <ul className="flex flex-wrap gap-4 text-sm font-semibold text-surface/85" aria-label="Điểm tin cậy">
            {TRUST_BADGES.map((badge) => (
              <li
                key={badge.label}
                className="inline-flex items-center gap-2 rounded-full bg-surface/15 px-4 py-2 backdrop-blur-sm"
              >
                <span aria-hidden="true">{badge.icon}</span>
                <span>{badge.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <Panel
          variant="glass"
          className="relative h-fit overflow-hidden rounded-3xl border border-surface/30 bg-surface/15 p-8 text-surface shadow-2xl backdrop-blur"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.25),_transparent_65%)]" />
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-600/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-surface">
                Pipeline minh bạch
              </span>
              <h2 className="mt-4 text-2xl font-semibold text-surface">
                Một luồng công việc thống nhất cho ứng viên và doanh nghiệp
              </h2>
            </div>
            <ul className="space-y-4 text-sm leading-relaxed text-surface/85">
              <li>
                <strong className="font-semibold text-surface">Ứng viên:</strong> tạo hồ sơ, ứng tuyển và theo dõi trạng thái
                realtime chỉ với vài thao tác.
              </li>
              <li>
                <strong className="font-semibold text-surface">Nhà tuyển dụng:</strong> phân luồng pipeline, giao việc cho
                từng hồ sơ và cộng tác tức thời.
              </li>
              <li>
                <strong className="font-semibold text-surface">Quản trị viên:</strong> kiểm soát bảo mật, tiêu chuẩn dữ liệu
                và báo cáo tổng quan trên toàn doanh nghiệp.
              </li>
            </ul>
          </div>
        </Panel>
      </Container>
    </section>
  );
}
