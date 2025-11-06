import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/routes";

const footerLinks = [
  {
    label: "Sản phẩm",
    items: [
      { label: "Danh sách việc làm", href: ROUTES.jobs },
      { label: "Cộng đồng ứng viên", href: ROUTES.candidatePortal },
      { label: "Không gian làm việc nhà tuyển dụng", href: ROUTES.recruiterDashboard },
    ],
  },
  {
    label: "Tài nguyên",
    items: [
      { label: "Trung tâm tài liệu", href: ROUTES.docs },
      { label: "Sổ tay quản trị", href: "/docs/admin" },
      { label: "Cẩm nang ứng viên", href: "/docs/candidate" },
    ],
  },
  {
    label: "Pháp lý",
    items: [
      { label: "Chính sách bảo mật", href: "/legal/privacy" },
      { label: "Điều khoản sử dụng", href: "/legal/terms" },
    ],
  },
] as const;

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/talentflow" },
  { label: "Twitter", href: "https://twitter.com/talentflow" },
  { label: "YouTube", href: "https://www.youtube.com/@talentflow" },
] as const;

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg text-text">
      <Container className="space-y-12 py-12">
        <div className="rounded-3xl border border-accent-500/30 bg-gradient-to-br from-primary-700 via-accent-600 to-primary-500 p-8 text-surface shadow-lg">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">
                Cần hướng dẫn chi tiết hoặc trao đổi với đội hỗ trợ?
              </h2>
              <p className="text-sm text-surface/80">
                Chúng tôi luôn sẵn sàng đồng hành trong quá trình triển khai, onboarding ứng viên và giải đáp mọi
                thắc mắc vận hành hằng ngày.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:support@talentflow.app"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-accent-500/40 bg-accent-500/10 px-4 text-sm font-semibold text-accent-600 transition hover:bg-accent-500/20"
              >
                Gửi email hỗ trợ
              </a>
              <Link href={ROUTES.docs}>
                <Button size="sm" variant="primary">
                  Xem tài liệu
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-4">
            <Link
              href={ROUTES.home}
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
            >
              Talentflow
            </Link>
            <p className="max-w-sm text-sm text-muted">
              Talentflow kết nối doanh nghiệp, nhà tuyển dụng và ứng viên trong cùng một không gian làm việc, giúp
              quản lý vòng tuyển dụng, hồ sơ và lịch phỏng vấn với sự minh bạch toàn diện.
            </p>
            <div className="space-y-1 text-sm text-muted">
              <p>
                Hỗ trợ:{" "}
                <a
                  href="mailto:support@talentflow.app"
                  className="font-semibold text-primary-600 transition hover:text-primary-700"
                >
                  support@talentflow.app
                </a>
              </p>
              <p>Đường dây nóng: +84 234 567 899</p>
              <p>Giờ hỗ trợ: 08:00-18:00 (Thứ Hai - Thứ Sáu)</p>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.label} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                {group.label}
              </p>
              <ul className="space-y-2 text-sm text-muted">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-primary-600"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} Talentflow.</p>
          <div className="flex flex-wrap items-center gap-4 text-muted">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold uppercase tracking-[0.2em] transition hover:text-primary-600"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
