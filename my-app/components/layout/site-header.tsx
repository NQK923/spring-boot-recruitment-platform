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
    return <SuperAdminHeader currentUser={currentUser} />;
  }

  if (roles.includes("COMPANY_ADMIN")) {
    return <CompanyAdminHeader currentUser={currentUser} />;
  }

  const navItems = buildNavigation({ roles, isAuthenticated });

  return (
    <header className="sticky top-0 z-40 border-b-2 border-blue-100 bg-white/95 shadow-sm backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-18">
        <Link href={ROUTES.home} className="flex items-center gap-3 group">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-sm font-bold uppercase text-white shadow-md group-hover:shadow-lg transition-shadow">
            TF
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Talentflow
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-wider text-indigo-600 sm:block">
              Nền tảng tuyển dụng
            </span>
          </div>
        </Link>
        <SiteNavbar items={navItems} />
        <div className="flex items-center gap-2 sm:gap-3">
          <NavigationActions currentUser={currentUser} />
          <MobileNav items={navItems} />
        </div>
      </Container>
    </header>
  );
}
