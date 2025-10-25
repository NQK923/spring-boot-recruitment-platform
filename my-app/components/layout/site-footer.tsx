import Link from "next/link";

import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const footerLinks = [
  {
    label: "Product",
    items: [
      { label: "Jobs", href: ROUTES.jobs },
      { label: "Candidate portal", href: ROUTES.candidatePortal },
      { label: "Recruiter workspace", href: ROUTES.recruiterDashboard },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Docs home", href: ROUTES.docs },
      { label: "Admin handbook", href: "/docs/admin" },
      { label: "Candidate playbook", href: "/docs/candidate" },
    ],
  },
  {
    label: "Legal",
    items: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
    ],
  },
];

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/talentflow" },
  { label: "Twitter", href: "https://twitter.com/talentflow" },
  { label: "YouTube", href: "https://www.youtube.com/@talentflow" },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-slate-950 text-white">
      <Container className="space-y-12 py-12">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/70 via-purple-600/60 to-slate-900 p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">Need a hand?</p>
              <h2 className="text-2xl font-semibold">Get a guided walkthrough or talk with support.</h2>
              <p className="text-sm text-white/80">
                We are here to help with rollouts, candidate onboarding, and day-to-day pipeline questions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:support@talentflow.app"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-white/40 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Email support
              </a>
              <Link href={ROUTES.docs}>
                <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90">
                  View docs
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-4">
            <Link href={ROUTES.home} className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
              Talentflow
            </Link>
            <p className="max-w-sm text-sm text-white/70">
              Talentflow connects companies, recruiters, and candidates in one workspace. Manage openings, profiles, and interviews with full visibility across the journey.
            </p>
            <div className="space-y-1 text-sm text-white/70">
              <p>
                Email:{" "}
                <a href="mailto:support@talentflow.app" className="font-semibold text-white hover:text-indigo-200">
                  support@talentflow.app
                </a>
              </p>
              <p>Hotline: +84 234 567 899</p>
              <p>Support hours: 08:00-18:00 (Mon-Fri)</p>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.label} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{group.label}</p>
              <ul className="space-y-2 text-sm text-white/70">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} Talentflow. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-white/70">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold uppercase tracking-[0.2em] hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
