import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SiteNavbar, type NavItem } from "@/components/layout/site-navbar";
import { NavigationActions } from "@/components/layout/navigation-actions";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ROUTES } from "@/lib/routes";

const companyAdminNavigation: NavItem[] = [
  { href: `${ROUTES.companyAdminDashboard}#overview`, label: "Overview" },
  { href: `${ROUTES.companyAdminDashboard}#company`, label: "Company" },
  { href: `${ROUTES.companyAdminDashboard}#team`, label: "Team" },
  { href: `${ROUTES.companyAdminDashboard}#jobs`, label: "Jobs" },
  { href: `${ROUTES.companyAdminDashboard}#invites`, label: "Invitations" },
];

export function CompanyAdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/95 shadow-[0_12px_32px_rgba(15,23,42,0.1)] backdrop-blur-md supports-[backdrop-filter]:bg-surface/80">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href={ROUTES.companyAdminDashboard} className="flex items-center gap-3">
          <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-sm">
            CA
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Company workspace
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.32em] text-muted sm:block">
              Admin controls
            </span>
          </div>
        </Link>
        <SiteNavbar items={companyAdminNavigation} />
        <div className="flex items-center gap-2 sm:gap-3">
          <NavigationActions />
          <MobileNav items={companyAdminNavigation} />
        </div>
      </Container>
    </header>
  );
}
