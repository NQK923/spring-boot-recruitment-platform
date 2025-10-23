"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";

type NavItem = {
  href: string;
  label: string;
  badge?: string;
};

const navigation: NavItem[] = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.jobs, label: "Jobs" },
  { href: ROUTES.candidatePortal, label: "Candidate", badge: "new" },
  { href: ROUTES.recruiterDashboard, label: "Recruiter" },
  { href: ROUTES.docs, label: "Docs" },
];

type SiteNavbarProps = {
  className?: string;
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
};

export function SiteNavbar({
  className,
  orientation = "horizontal",
  onNavigate,
}: SiteNavbarProps) {
  const pathname = usePathname();
  const isVertical = orientation === "vertical";

  return (
    <nav
      className={[
        isVertical ? "flex flex-col gap-4" : "hidden items-center gap-8 sm:flex",
        "text-sm font-medium text-foreground/70",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {navigation.map((item) => {
        const active =
          item.href === ROUTES.home ? pathname === ROUTES.home : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={[
              "group relative inline-flex items-center gap-2 transition",
              active ? "text-foreground" : "hover:text-foreground",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span>{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                {item.badge}
              </span>
            ) : null}
            {!isVertical ? (
              <span
                className={[
                  "absolute inset-x-0 bottom-[-10px] h-px scale-x-0 bg-accent transition-transform duration-200",
                  active ? "scale-x-100" : "group-hover:scale-x-100",
                ].join(" ")}
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
