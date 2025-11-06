import Link from "next/link";

import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const footerLinks = [
  {
    label: "Sản phẩm",
    items: [
      { label: "Danh sách việc làm", href: ROUTES.jobs },
      { label: "Cổng thông tin ứng viên", href: ROUTES.candidatePortal },
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
];

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/talentflow" },
  { label: "Twitter", href: "https://twitter.com/talentflow" },
  { label: "YouTube", href: "https://www.youtube.com/@talentflow" },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-slate-950 text-white">
      <Container className="space-y-12 py-12">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/70 via-purple-600/60 to-slate-900 p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">
                Cần hướng dẫn chi tiết hoặc trao đổi với đội hỗ trợ?
              </h2>
              <p className="text-sm text-white/80">
                Chúng tôi luôn sẵn sàng đồng hành trong quá trình triển khai, onboarding ứng viên và giải
                đáp mọi thắc mắc vận hành hằng ngày.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:support@talentflow.app"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-white/40 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Gửi email hỗ trợ
              </a>
              <Link href={ROUTES.docs}>
                <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90">
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
            <p className="max-w-sm text-sm text-white/70">
              Talentflow kết nối doanh nghiệp, nhà tuyển dụng và ứng viên trong cùng một không gian làm
              việc, giúp quản lý vị trí tuyển dụng, hồ sơ và lịch phỏng vấn với sự minh bạch toàn diện.
            </p>
            <div className="space-y-1 text-sm text-white/70">
              <p>
                Hộp thư:{" "}
                <a
                  href="mailto:support@talentflow.app"
                  className="font-semibold text-white hover:text-indigo-200"
                >
                  support@talentflow.app
                </a>
              </p>
              <p>Đường dây nóng: +84 234 567 899</p>
              <p>Khung giờ hỗ trợ: 08:00-18:00 (Thứ Hai - Thứ Sáu)</p>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.label} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                {group.label}
              </p>
              <ul className="space-y-2 text-sm text-white/70">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} Talentflow.</p>
          <div className="flex flex-wrap items-center gap-4 text-white/70">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold uppercase tracking-[0.2em] hover:text-white"
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
