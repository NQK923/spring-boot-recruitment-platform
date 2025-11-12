import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SiteNavbar, type NavItem } from "@/components/layout/site-navbar";
import { NavigationActions } from "@/components/layout/navigation-actions";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ROUTES } from "@/lib/routes";
import type { MeResponse } from "@/lib/types";

const companyAdminNavigation: NavItem[] = [
  { href: `${ROUTES.companyAdminDashboard}#overview`, label: "Tổng quan" },
  { href: `${ROUTES.companyAdminDashboard}#company`, label: "Thông tin công ty" },
  { href: `${ROUTES.companyAdminDashboard}#team`, label: "Đội ngũ" },
  { href: `${ROUTES.companyAdminDashboard}#jobs`, label: "Tin tuyển dụng" },
  { href: `${ROUTES.companyAdminDashboard}#invites`, label: "Lời mời" },
];

type CompanyAdminHeaderProps = {
  currentUser: MeResponse | null;
};

export function CompanyAdminHeader({ currentUser }: CompanyAdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-surface/80">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href={ROUTES.companyAdminDashboard} className="flex items-center gap-3">
          <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold uppercase tracking-[0.2em] shadow-sm">
            CA
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight text-text sm:text-lg">
              Không gian làm việc công ty
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.32em] text-muted sm:block">
              Công cụ quản trị
            </span>
          </div>
        </Link>
        <SiteNavbar items={companyAdminNavigation} />
        <div className="flex items-center gap-2 sm:gap-3">
          <NavigationActions currentUser={currentUser} />
          <MobileNav items={companyAdminNavigation} />
        </div>
      </Container>
    </header>
  );
}
