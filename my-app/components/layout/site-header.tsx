import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const navigation = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.candidatePortal, label: "Candidate" },
  { href: ROUTES.recruiterDashboard, label: "Recruiter" },
  { href: "/docs", label: "Docs" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-base font-semibold tracking-tight">
          talentflow
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 sm:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href={ROUTES.signIn} className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href={ROUTES.register}>
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
