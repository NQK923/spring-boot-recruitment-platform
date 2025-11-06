import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { SiteNavbar, type NavItem } from "@/components/layout/site-navbar";
import { NavigationActions } from "@/components/layout/navigation-actions";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Container } from "@/components/ui/container";
import { CompanyAdminHeader } from "@/components/layout/company-admin-header";
import { SuperAdminHeader } from "@/components/layout/super-admin-header";
import { getCurrentUser } from "@/lib/current-user";

function buildNavigation({
  roles,
  isAuthenticated,
}: {
  roles: string[];
  isAuthenticated: boolean;
}): NavItem[] {
  const items: NavItem[] = [
    { href: ROUTES.home, label: "Trang chủ" },
    { href: ROUTES.jobs, label: "Việc làm" },
  ];

  const ensureItem = (item: NavItem) => {
    if (!items.some((existing) => existing.href === item.href)) {
      items.push(item);
    }
  };

  if (!isAuthenticated || roles.includes("CANDIDATE")) {
    ensureItem({ href: ROUTES.candidatePortal, label: "Ứng viên" });
  }

  if (roles.includes("RECRUITER")) {
    ensureItem({ href: ROUTES.recruiterDashboard, label: "Nhà tuyển dụng" });
  }

  ensureItem({ href: ROUTES.docs, label: "Tài liệu" });

  return items;
}

export async function SiteHeader() {
  const currentUser = await getCurrentUser();
  const roles = currentUser?.roles ?? [];
  const isAuthenticated = Boolean(currentUser);

  if (roles.includes("SUPER_ADMIN")) {
    return <SuperAdminHeader />;
  }

  if (roles.includes("COMPANY_ADMIN")) {
    return <CompanyAdminHeader />;
  }

  const navItems = buildNavigation({ roles, isAuthenticated });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/95 shadow-[0_12px_32px_rgba(15,23,42,0.1)] backdrop-blur-md supports-[backdrop-filter]:bg-surface/80">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href={ROUTES.home} className="flex items-center gap-3">
          <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold uppercase shadow-sm">
            TF
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Talentflow
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.32em] text-muted sm:block">
              Nền tảng tuyển dụng
            </span>
          </div>
        </Link>
        <SiteNavbar items={navItems} />
        <div className="flex items-center gap-2 sm:gap-3">
          <NavigationActions />
          <MobileNav items={navItems} />
        </div>
      </Container>
    </header>
  );
}
