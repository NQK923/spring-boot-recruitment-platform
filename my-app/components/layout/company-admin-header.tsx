"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SiteNavbar, type NavItem } from "@/components/layout/site-navbar";
import { NavigationActions } from "@/components/layout/navigation-actions";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ROUTES } from "@/lib/routes";
import type { MeResponse } from "@/lib/types";
import { cx } from "@/lib/cx";

const companyAdminNavigation: NavItem[] = [
  { href: `${ROUTES.companyAdminDashboard}#overview`, label: "Tổng quan" },
  { href: `${ROUTES.companyAdminDashboard}#company`, label: "Công ty" },
  { href: `${ROUTES.companyAdminDashboard}#team`, label: "Đội ngũ" },
  { href: `${ROUTES.companyAdminDashboard}#jobs`, label: "Việc làm" },
  { href: `${ROUTES.companyAdminDashboard}#invites`, label: "Lời mời" },
];

type CompanyAdminHeaderProps = {
  currentUser: MeResponse | null;
};

export function CompanyAdminHeader({ currentUser }: CompanyAdminHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cx(
        "sticky top-0 z-40 border-b transition-all duration-300 ease-out",
        isScrolled
          ? "border-blue-100/80 bg-surface shadow-xl backdrop-blur-md supports-[backdrop-filter]:bg-surface/90"
          : "border-transparent bg-transparent shadow-none"
      )}
    >
      <Container
        className={cx(
          "flex items-center justify-between gap-4 transition-[height,padding] duration-300 ease-out",
          isScrolled ? "h-14 sm:h-16" : "h-20 sm:h-24"
        )}
      >
        <Link href={ROUTES.companyAdminDashboard} className="flex items-center gap-2.5">
          <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold uppercase tracking-[0.2em] shadow-sm">
            CA
          </span>
          <span className="hidden text-base font-semibold tracking-tight text-text sm:inline">
            Quản trị công ty
          </span>
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
