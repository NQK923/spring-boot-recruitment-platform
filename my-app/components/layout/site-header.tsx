import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { NavigationActions } from "@/components/layout/navigation-actions";

export function SiteHeader() {
  return (
    <header className="border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.home} className="text-base font-semibold tracking-tight">
          talentflow
        </Link>
        <SiteNavbar />
        <NavigationActions />
      </div>
    </header>
  );
}
