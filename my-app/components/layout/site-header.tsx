import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { NavigationActions } from "@/components/layout/navigation-actions";
import { MobileNav } from "@/components/layout/mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/95 backdrop-blur-md shadow-[0_10px_30px_rgba(var(--shadow-soft),0.35)] supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface px-3 py-1 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(var(--shadow-soft),0.35)]"
          >
            <span className="brand-gradient inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm">
              TF
            </span>
            <span className="tracking-tight">talentflow</span>
          </Link>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.28em] text-muted sm:inline">
            Unified hiring platform
          </span>
        </div>
        <SiteNavbar />
        <div className="flex items-center gap-3">
          <NavigationActions />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
