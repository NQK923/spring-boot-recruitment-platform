"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export type NavItem = {
  href: string;
  label: string;
  badge?: string;
};

const defaultNavigation: NavItem[] = [
  { href: ROUTES.home, label: "Trang chủ" },
  { href: ROUTES.jobs, label: "Việc làm" },
  { href: ROUTES.candidatePortal, label: "Ứng viên", badge: "mới" },
  { href: ROUTES.recruiterDashboard, label: "Nhà tuyển dụng" },
  { href: ROUTES.docs, label: "Tài liệu" },
];

type SiteNavbarProps = {
  className?: string;
  orientation?: "horizontal" | "vertical";
  onNavigateAction?: () => void;
  items?: NavItem[];
  variant?: "default" | "inverse";
};

export function SiteNavbar({
  className,
  orientation = "horizontal",
  onNavigateAction,
  items,
  variant = "default",
}: SiteNavbarProps) {
  const pathname = usePathname();
  const isVertical = orientation === "vertical";
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const updateHash = () => setActiveHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, []);

  const navigation = useMemo(() => items ?? defaultNavigation, [items]);
  const palette =
    variant === "inverse"
      ? {
          text: "text-white/90",
          active: "bg-white/20 text-white shadow-md",
          inactive: "hover:bg-white/10 hover:text-white",
          indicator: "bg-white",
        }
      : {
          text: "text-slate-700",
          active: "bg-indigo-50 text-indigo-700 shadow-sm",
          inactive: "hover:bg-blue-50 hover:text-indigo-600",
          indicator: "bg-indigo-600",
        };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const anchors = navigation
      .map((item) => {
        const [baseHref, anchor] = item.href.split("#");
        if (!anchor) {
          return null;
        }
        const element = document.getElementById(anchor);
        if (!element) {
          return null;
        }
        return {
          base: baseHref || "/",
          anchor,
          element,
        };
      })
      .filter(Boolean) as Array<{ base: string; anchor: string; element: HTMLElement }>;

    if (anchors.length === 0) {
      return;
    }

    const updateActiveAnchor = () => {
      const path = window.location.pathname;
      const headerOffset = 120;
      let candidateAnchor = "";
      let candidateTop = Number.NEGATIVE_INFINITY;
      let fallbackAnchor = "";

      anchors.forEach(({ base, anchor, element }) => {
        if (!path.startsWith(base)) {
          return;
        }
        const rect = element.getBoundingClientRect();
        const top = rect.top;
        if (top <= headerOffset && top > candidateTop) {
          candidateAnchor = anchor;
          candidateTop = top;
        }
        if (!candidateAnchor && !fallbackAnchor && top > headerOffset) {
          fallbackAnchor = anchor;
        }
      });

      const nextHash =
        candidateAnchor !== ""
          ? `#${candidateAnchor}`
          : fallbackAnchor !== ""
            ? `#${fallbackAnchor}`
            : "";

      setActiveHash((current) => (current === nextHash ? current : nextHash));
    };

    updateActiveAnchor();

    let ticking = false;
    const handleScroll = () => {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(() => {
        updateActiveAnchor();
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [navigation]);

  return (
    <nav
      className={[
        isVertical ? "flex flex-col gap-4" : "hidden items-center gap-6 md:gap-8 sm:flex",
        "text-sm font-medium",
        palette.text,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {navigation.map((item) => {
        const [baseHref, anchor] = item.href.split("#");
        const normalizedBase = baseHref || "/";
        const matchesBase =
          normalizedBase === ROUTES.home ? pathname === ROUTES.home : pathname.startsWith(normalizedBase);
        const targetHash = anchor ? `#${anchor}` : null;
        const active = anchor
          ? matchesBase && (activeHash === targetHash || (!activeHash && anchor === "overview"))
          : matchesBase;
        const handleClick = () => {
          onNavigateAction?.();
          if (targetHash) {
            setActiveHash(targetHash);
          } else {
            setActiveHash("");
          }
        };

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleClick}
            className={[
              "group relative inline-flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors duration-150",
              active ? palette.active : palette.inactive,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span>{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                {item.badge}
              </span>
            ) : null}
            {!isVertical ? (
              <span
                className={[
                  "absolute inset-x-0 bottom-[-10px] h-px scale-x-0 transition-transform duration-200",
                  active ? "scale-x-100" : "group-hover:scale-x-100",
                  palette.indicator,
                ].join(" ")}
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
