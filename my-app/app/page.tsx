import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser } from "@/lib/current-user";
import type { MeResponse } from "@/lib/types";

const stats = [
  { label: "Companies onboarded", value: "48", detail: "Multi-tenant ready" },
  { label: "Candidates engaged", value: "12k+", detail: "Profiles & CVs" },
  { label: "Interviews scheduled", value: "3.4k", detail: "Automated feeds" },
];

const recruiterFeatures = [
  {
    title: "Collaborative workflows",
    description:
      "Assign owners, capture notes, and keep hiring teams aligned with live application history.",
  },
  {
    title: "Insightful dashboards",
    description:
      "Monitor pipeline health, job performance, and interview velocity without leaving the workspace.",
  },
];

const candidateFeatures = [
  {
    title: "Guided profile builder",
    description:
      "Highlight skills, experience, and education once and sync updates with every application automatically.",
  },
  {
    title: "Smart interview timeline",
    description:
      "Receive instant updates, download calendar files, and stay ready for each conversation.",
  },
];

export default async function Home() {
  const viewer = await getCurrentUser();

  const renderPrimaryCtas = (user: MeResponse | null) => {
    if (!user) {
      return (
        <>
          <Link href={ROUTES.signIn}>
            <Button size="lg">Launch recruiter workspace</Button>
          </Link>
          <Link href={ROUTES.register}>
            <Button size="lg" variant="secondary">
              Create candidate account
            </Button>
          </Link>
        </>
      );
    }

    const hasCandidateRole = user.roles.includes("CANDIDATE");
    const hasRecruiterRole = user.roles.some((role) =>
      ["SUPER_ADMIN", "COMPANY_ADMIN", "RECRUITER"].includes(role)
    );

    if (hasCandidateRole && !hasRecruiterRole) {
      return (
        <Link href={ROUTES.candidatePortal}>
          <Button size="lg">Open candidate portal</Button>
        </Link>
      );
    }

    return (
      <>
        <Link href={hasCandidateRole ? ROUTES.candidatePortal : ROUTES.recruiterDashboard}>
          <Button size="lg">
            {hasCandidateRole ? "Open candidate portal" : "Open recruiter workspace"}
          </Button>
        </Link>
        <Link href={hasCandidateRole ? ROUTES.recruiterDashboard : ROUTES.candidatePortal}>
          <Button size="lg" variant="secondary">
            {hasCandidateRole ? "Switch to recruiter area" : "View candidate experience"}
          </Button>
        </Link>
      </>
    );
  };

  return (
    <Container as="main" className="flex flex-col gap-20">
      <section className="grid gap-12 rounded-[32px] border border-border/80 bg-surface/98 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/90 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-accent shadow-[0_8px_20px_rgba(var(--shadow-soft),0.25)]">
            Modern recruitment OS
          </span>
          <div className="space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Build remarkable hiring journeys for teams and candidates.
            </h1>
            <p className="max-w-xl text-lg text-foreground/65">
              Talentflow centralises job marketing, application review, and interview scheduling so hiring teams
              move faster while candidates stay informed every step of the way.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {renderPrimaryCtas(viewer)}
            <Link href={ROUTES.jobs}>
              <Button size="lg" variant="ghost">
                Explore live roles
              </Button>
            </Link>
          </div>
          <dl className="grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/70 bg-surface/96 p-5 shadow-[0_14px_32px_rgba(var(--shadow-soft),0.24)]"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">{stat.label}</dt>
                <dd className="mt-2 text-2xl font-semibold text-foreground">{stat.value}</dd>
                <p className="mt-1 text-xs text-foreground/60">{stat.detail}</p>
              </div>
            ))}
          </dl>
        </div>

        <Panel variant="glass" padding="lg" className="relative overflow-hidden">
          <div className="absolute -right-20 top-6 hidden h-48 w-48 rounded-full bg-accent/14 blur-3xl sm:block" />
          <div className="relative space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Live pipeline</p>
                <p className="text-sm text-foreground/70">Today&apos;s snapshot</p>
              </div>
              <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Live updates enabled
              </span>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-surface/92 p-4 shadow-[0_12px_32px_rgba(var(--shadow-soft),0.22)] backdrop-blur-sm">
                <p className="text-sm font-semibold text-foreground">Applications moving forward</p>
                <p className="mt-1 text-sm text-foreground/60">
                  86 candidates scheduled for interviews this week across 12 companies.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-2xl font-semibold text-foreground">34</p>
                    <p className="text-xs text-foreground/60">First-round</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">27</p>
                    <p className="text-xs text-foreground/60">Panel ready</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">9</p>
                    <p className="text-xs text-foreground/60">Offers pending</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface/92 p-4 shadow-[0_12px_32px_rgba(var(--shadow-soft),0.22)] backdrop-blur-sm">
                <p className="text-sm font-semibold text-foreground">Candidate experience</p>
                <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                  <li>- Personalised dashboards with interview timelines.</li>
                  <li>- Secure CV storage with versioning support.</li>
                  <li>- Real-time notifications across email and in-app alerts.</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-accent/25 bg-accent/12 px-4 py-3 text-sm text-accent">
              <span>Active collaborators: Recruiters, Hiring Managers, Interviewers, Candidates</span>
              <span className="hidden text-xs font-semibold uppercase tracking-[0.28em] lg:inline">
                Refreshed every 15 minutes
              </span>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-8 rounded-[32px] border border-border/80 bg-surface-muted/80 p-6 sm:p-10 lg:grid-cols-2">
        <Panel variant="surface" padding="lg" className="space-y-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              For recruiters & admins
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">
              Operate your entire hiring pipeline in one organised workspace.
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Publish jobs, triage applications, capture interview feedback, and keep stakeholders aligned with
              multi-tenant controls built for scaling companies.
            </p>
          </div>
          <div className="space-y-4">
            {recruiterFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border/70 bg-surface/96 p-4 shadow-[0_12px_26px_rgba(var(--shadow-soft),0.22)]"
              >
                <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                <p className="mt-1 text-sm text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {viewer ? (
              <>
                <Link href={ROUTES.recruiterDashboard}>
                  <Button size="md">Enter recruiter workspace</Button>
                </Link>
                <Link href="/docs/admin">
                  <Button size="md" variant="secondary">
                    View rollout guide
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={ROUTES.signIn}>
                  <Button size="md">Sign in to recruiter workspace</Button>
                </Link>
                <Link href="/docs/admin">
                  <Button size="md" variant="secondary">
                    View rollout guide
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Panel>

        <Panel variant="surface" padding="lg" className="space-y-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              For candidates
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">
              Stay informed, prepared, and confident through every interview step.
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              From CV versioning to interview reminders, Talentflow ensures candidates have clarity and control
              while collaborating with hiring teams.
            </p>
          </div>
          <div className="space-y-4">
            {candidateFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border/70 bg-surface/96 p-4 shadow-[0_12px_26px_rgba(var(--shadow-soft),0.22)]"
              >
                <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                <p className="mt-1 text-sm text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {viewer ? (
              <>
                <Link href={ROUTES.candidatePortal}>
                  <Button size="md">Open candidate portal</Button>
                </Link>
                <Link href="/docs/candidate">
                  <Button size="md" variant="secondary">
                    Candidate handbook
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={ROUTES.register}>
                  <Button size="md">Create candidate account</Button>
                </Link>
                <Link href="/docs/candidate">
                  <Button size="md" variant="secondary">
                    Candidate handbook
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Panel>
      </section>

      <section className="rounded-[32px] border border-border/80 bg-surface/98 p-6 sm:p-10">
        <Panel variant="glass" padding="lg" className="space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
                Why teams choose Talentflow
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Designed for modern hiring teams.</h2>
              <p className="mt-2 max-w-2xl text-sm text-foreground/70">
                Built-in permissions, reminders, and analytics keep every stakeholder aligned without chasing
                spreadsheets or patching together point solutions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-border/60 bg-surface/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Role-aware access
              </span>
              <span className="rounded-full border border-border/60 bg-surface/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Automated nudges
              </span>
              <span className="rounded-full border border-border/60 bg-surface/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Audit-ready logs
              </span>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-surface/96 p-4 shadow-[0_12px_24px_rgba(var(--shadow-soft),0.22)]">
              <p className="text-sm font-semibold text-foreground">Role-based guardrails</p>
              <p className="mt-2 text-sm text-foreground/70">
                Granular roles keep sensitive salary bands, feedback, and offers limited to the right reviewers.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-surface/96 p-4 shadow-[0_12px_24px_rgba(var(--shadow-soft),0.22)]">
              <p className="text-sm font-semibold text-foreground">Automated communications</p>
              <p className="mt-2 text-sm text-foreground/70">
                Interview reminders, application status updates, and invite emails send instantly with your
                branding.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-surface/96 p-4 shadow-[0_12px_24px_rgba(var(--shadow-soft),0.22)]">
              <p className="text-sm font-semibold text-foreground">Data insights & exports</p>
              <p className="mt-2 text-sm text-foreground/70">
                Track conversion rates, hiring velocity, and source performance with dashboards you can export or
                share live.
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="rounded-[32px] border border-border/80 bg-surface-muted/80 p-6 sm:p-10">
        <Panel
          variant="surface"
          padding="lg"
          className="flex flex-col items-center gap-6 text-center shadow-[0_18px_44px_rgba(var(--shadow-soft),0.28)]"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
            Next steps
          </span>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Experience the unified hiring workspace today.
            </h2>
            <p className="max-w-2xl text-sm text-foreground/70">
              Join recruiters, admins, and candidates collaborating in one place. Spin up a workspace, invite
              teammates, and keep every applicant informed with timely updates.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {renderPrimaryCtas(viewer)}
            <Link href={ROUTES.docs}>
              <Button size="md" variant="ghost">
                Explore documentation
              </Button>
            </Link>
          </div>
        </Panel>
      </section>
    </Container>
  );
}
