import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Container } from "@/components/ui/container";

const footerLinks = [
  {
    label: "Platform",
    children: [
      { label: "Jobs", href: ROUTES.jobs },
      { label: "Candidate Portal", href: ROUTES.candidatePortal },
      { label: "Recruiter Workspace", href: ROUTES.recruiterDashboard },
    ],
  },
  {
    label: "Company",
    children: [
      { label: "About", href: "/docs/company" },
      { label: "Docs", href: ROUTES.docs },
      { label: "Support", href: "/docs/support" },
    ],
  },
  {
    label: "Legal",
    children: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
    ],
  },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/70 bg-surface">
      <Container className="flex flex-col gap-12 py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-4">
            <Link href={ROUTES.home} className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
              Talentflow
            </Link>
            <p className="max-w-sm text-sm text-muted">
              Talentflow connects companies, recruiters, and candidates in one workspace. Manage job openings,
              profiles, and interviews with real-time visibility across the recruiting journey.
            </p>
            <div className="space-y-1 text-sm text-muted">
              <p>Email: <a href="mailto:support@talentflow.app" className="hover:text-foreground">support@talentflow.app</a></p>
              <p>Hotline: +84 234 567 899</p>
              <p>Support 08:00 - 18:00 (Mon - Fri)</p>
            </div>
          </div>
          {footerLinks.map((group) => (
            <div key={group.label} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {group.label}
              </p>
              <ul className="space-y-2 text-sm text-foreground/70">
                {group.children.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border/60 pt-6 text-xs text-muted sm:flex sm:items-center sm:justify-between">
          <p>&copy; {currentYear} Talentflow. All rights reserved.</p>
          <div className="mt-3 flex items-center gap-4 sm:mt-0">
            <span>Crafted for multi-tenant hiring teams.</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
