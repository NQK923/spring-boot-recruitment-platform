import Link from "next/link";

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
    <footer className="border-t-2 border-blue-200 bg-white">
      <Container className="space-y-12 py-12">
        {/* Footer Links */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-4">
            <Link
              href={ROUTES.home}
              className="inline-flex cursor-pointer items-center gap-2 group"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-sm font-bold uppercase text-white shadow-md">
                TF
              </span>
              <span className="text-xl font-bold text-slate-900">Talentflow</span>
            </Link>
            <p className="max-w-sm text-sm text-slate-700 leading-relaxed font-medium">
              Nền tảng tuyển dụng hiện đại kết nối doanh nghiệp và ứng viên. Quản lý pipeline minh bạch, hiệu quả và chuyên nghiệp.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-base">📧</span>
                <a
                  href="mailto:support@talentflow.app"
                  className="cursor-pointer font-bold text-indigo-600 hover:text-indigo-700 transition"
                >
                  support@talentflow.app
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-base">📞</span>
                <span className="font-bold text-slate-900">+84 234 567 899</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-base">🕐</span>
                <span className="font-medium text-slate-700">08:00-18:00 (T2-T6)</span>
              </p>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.label} className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                {group.label}
              </p>
              <ul className="space-y-2.5 text-sm">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="cursor-pointer text-slate-800 font-semibold hover:text-indigo-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 border-t-2 border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-700 font-bold">
            © {currentYear} Talentflow. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors"
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
