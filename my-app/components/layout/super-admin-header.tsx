import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SiteNavbar, type NavItem } from "@/components/layout/site-navbar";
import { NavigationActions } from "@/components/layout/navigation-actions";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ROUTES } from "@/lib/routes";

const superAdminNavigation: NavItem[] = [
  { href: ROUTES.superAdminCompanies, label: "Quản lý doanh nghiệp" },
  { href: ROUTES.superAdminUsers, label: "Quản lý người dùng" },
];

export function SuperAdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-surface/80">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href={ROUTES.superAdminDashboard} className="flex items-center gap-3">
          <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold uppercase tracking-[0.2em] shadow-sm">
            SA
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight text-text sm:text-lg">
              Bảng điều khiển Super Admin
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.32em] text-muted sm:block">
              Kiểm soát nền tảng
            </span>
          </div>
        </Link>
        <SiteNavbar items={superAdminNavigation} />
        <div className="flex items-center gap-2 sm:gap-3">
          <NavigationActions />
          <MobileNav items={superAdminNavigation} />
        </div>
      </Container>
    </header>
  );
}
