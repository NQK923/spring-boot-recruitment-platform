import Link from "next/link";
import { ROUTES } from "@/lib/routes";

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
  return (
    <footer className="border-t border-border/60 bg-surface/95 shadow-[0_-12px_32px_rgba(var(--shadow-soft),0.25)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Link
              href={ROUTES.home}
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
            >
              talentflow
            </Link>
            <p className="max-w-xs text-sm text-muted">
              A unified recruitment platform for modern hiring teams. Organise jobs, applications, and
              interviews with connected workflows and delightful candidate experiences.
            </p>
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
                      className="transition hover:text-foreground hover:underline hover:underline-offset-4"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-foreground/10 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Talentflow. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="h-1 w-1 rounded-full bg-muted/60" />
            <span>Crafted for multi-tenant hiring teams.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
