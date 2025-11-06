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
    <section className="relative overflow-hidden text-white" style={{
      background: 'linear-gradient(to bottom right, #4F46E5, #FF6B6B, #4338CA)'
    }}>
      <Container className="grid gap-12 py-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:py-28">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/90">
            Nền tảng tuyển dụng hợp nhất
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-[2.9rem] md:leading-[1.1]">
            Tuyển đúng người – Nhanh hơn và minh bạch hơn.
          </h1>
          <p className="max-w-xl text-base text-white/95 md:text-lg">
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
              style={{ background: 'white', color: '#4F46E5' }}
              className="shadow-xl hover:opacity-90"
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
              style={{ borderColor: 'white', color: 'white', background: 'rgba(255,255,255,0.1)' }}
              className="border-2 hover:bg-white/20 backdrop-blur-sm shadow-lg"
            >
              <Link href={ROUTES.recruiterDashboard}>Dùng miễn phí ngay</Link>
            </Button>
          </div>
          <ul className="flex flex-wrap gap-4 text-sm font-semibold text-white/95" aria-label="Điểm tin cậy">
            {TRUST_BADGES.map((badge) => (
              <li
                key={badge.label}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-md border shadow-lg"
                style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <span aria-hidden="true">{badge.icon}</span>
                <span>{badge.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <Panel
          variant="glass"
          className="relative h-fit overflow-hidden rounded-3xl border-2 p-8 shadow-2xl backdrop-blur-xl"
          style={{ 
            borderColor: 'rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.95)'
          }}
        >
          <div className="relative space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.28em] text-white shadow-lg" style={{ background: 'linear-gradient(to right, #6366F1, #FF6B6B)' }}>
                Pipeline minh bạch
              </span>
              <h2 className="mt-4 text-2xl font-bold" style={{ 
                background: 'linear-gradient(to right, #4F46E5, #FF6B6B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Một luồng công việc thống nhất cho ứng viên và doanh nghiệp
              </h2>
            </div>
            <ul className="space-y-4 text-sm leading-relaxed text-muted">
              <li className="flex gap-3">
                <span className="flex-shrink-0 text-lg">👤</span>
                <div><strong className="font-semibold" style={{ color: '#4F46E5' }}>Ứng viên:</strong> tạo hồ sơ, ứng tuyển và theo dõi trạng thái
                realtime chỉ với vài thao tác.</div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 text-lg">🎯</span>
                <div><strong className="font-semibold" style={{ color: '#FF6B6B' }}>Nhà tuyển dụng:</strong> phân luồng pipeline, giao việc cho
                từng hồ sơ và cộng tác tức thời.</div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 text-lg">⚡</span>
                <div><strong className="font-semibold" style={{ color: '#3B82F6' }}>Quản trị viên:</strong> kiểm soát bảo mật, tiêu chuẩn dữ liệu
                và báo cáo tổng quan trên toàn doanh nghiệp.</div>
              </li>
            </ul>
          </div>
        </Panel>
      </Container>
    </section>
  );
}
