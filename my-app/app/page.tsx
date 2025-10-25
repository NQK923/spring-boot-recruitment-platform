import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser } from "@/lib/current-user";
import type { MeResponse } from "@/lib/types";

const metrics = [
  { label: "Active companies", value: "48", detail: "Multi-tenant teams" },
  { label: "Candidates supported", value: "12k+", detail: "Profiles and CVs" },
  { label: "Interviews automated", value: "3.4k", detail: "Calendar and reminders" },
];

const platformHighlights = [
  {
    title: "Unified pipelines",
    description:
      "Track every job and application with live statuses, owners, and SLA alerts in one workspace.",
  },
  {
    title: "Collaboration ready",
    description:
      "Mention teammates, share notes, and review structured feedback without juggling spreadsheets.",
  },
  {
    title: "Insights that matter",
    description:
      "Monitor conversion rates, time to hire, and source performance with dashboards you can export.",
  },
  {
    title: "Secure file vault",
    description:
      "Version CVs, offers, and compliance documents with granular access control by role.",
  },
];

const recruiterHighlights = [
  "Automated stage changes trigger candidate updates and dashboards instantly.",
  "Role-aware permissions keep sensitive details visible to the right reviewers.",
  "Templates, tasks, and reminders eliminate repetitive busywork for recruiters.",
];

const candidateHighlights = [
  "Guided profile builder keeps skills, education, and experience in sync across applications.",
  "Instant interview updates with calendar files ensure every candidate is prepared.",
  "Transparent status tracking reduces follow-up emails and increases offer acceptance.",
];

const workflowSteps = [
  {
    phase: "Day 0",
    title: "Connect your teams",
    description: "Invite super admins, company admins, and recruiters with roles that match your org chart.",
  },
  {
    phase: "Day 1",
    title: "Sync existing data",
    description: "Import jobs and candidate history or start with ready-to-use templates for each department.",
  },
  {
    phase: "Day 7",
    title: "Automate outreach",
    description: "Activate notifications, interview reminders, and nurturing nudges without manual follow-ups.",
  },
  {
    phase: "Day 14",
    title: "Measure and iterate",
    description: "Review dashboards, share insights, and refine each stage of the funnel with real metrics.",
  },
];

const pipelineStages = [
  { stage: "Applied", count: 42, detail: "8 new this morning", fill: 68, owner: "Talent Ops", sla: "Reply in 1 day" },
  { stage: "Screening", count: 18, detail: "6 reviews due today", fill: 54, owner: "Recruiters", sla: "Decision in 2 days" },
  { stage: "Interview", count: 12, detail: "4 on-site this week", fill: 72, owner: "Hiring managers", sla: "Feedback in 24h" },
  { stage: "Offer", count: 4, detail: "2 approvals pending", fill: 32, owner: "People team", sla: "Package in 48h" },
];

const pipelineStats = [
  { label: "Open roles", value: "28", meta: "+3 vs last week" },
  { label: "Avg. SLA", value: "96%", meta: "On target" },
  { label: "At risk", value: "3 stages", meta: "Needs follow-up" },
];

const pipelineFocus = [
  { title: "Backend Platform Engineer", detail: "Awaiting hiring manager feedback", owner: "Nora Patel" },
  { title: "Senior Product Designer", detail: "Offer review scheduled tomorrow", owner: "Alex Trinh" },
  { title: "Campus recruiter cohort", detail: "Bulk interviews next Tuesday", owner: "Ops pod" },
];

const candidateTimeline = [
  {
    time: "09:10",
    title: "Portfolio reviewed",
    description: "Recruiter Linh confirmed skills fit and left structured feedback.",
    status: "Completed",
  },
  {
    time: "10:30",
    title: "Panel interview scheduled",
    description: "Calendar holds sent to hiring manager and interviewer trio.",
    status: "Scheduled",
  },
  {
    time: "14:00",
    title: "Candidate update",
    description: "Automated email confirms agenda plus prep materials.",
    status: "Sent",
  },
  {
    time: "Tomorrow",
    title: "Comp review",
    description: "Finance reminder to pre-build offer package if panel passes.",
    status: "Upcoming",
  },
];

const insightSnapshots = [
  { label: "Time to hire", value: "21 days", delta: "-3 days vs Q2", trend: "positive" as const },
  { label: "Offer acceptance", value: "82%", delta: "+5 pts vs avg", trend: "positive" as const },
  { label: "Candidate NPS", value: "67", delta: "+12 vs last month", trend: "positive" as const },
  { label: "Diversity slate", value: "54%", delta: "+7 pts this quarter", trend: "positive" as const },
];

export default async function Home() {
  const viewer = await getCurrentUser();

  const renderPrimaryCtas = (user: MeResponse | null) => {
    if (!user) {
      return (
        <>
          <Link href={ROUTES.signIn}>
            <Button size="lg">Start as recruiter</Button>
          </Link>
          <Link href={ROUTES.register}>
            <Button size="lg" variant="secondary">
              Create candidate account
            </Button>
          </Link>
        </>
      );
    }

    const roles = user.roles ?? [];
    const isSuperAdmin = roles.includes("SUPER_ADMIN");
    const isCompanyAdmin = roles.includes("COMPANY_ADMIN");
    const isRecruiter = roles.includes("RECRUITER");
    const isCandidate = roles.includes("CANDIDATE");

    if (isSuperAdmin) {
      return (
        <>
          <Link href={ROUTES.superAdminDashboard}>
            <Button size="lg">Open admin console</Button>
          </Link>
          <Link href={isRecruiter ? ROUTES.recruiterDashboard : ROUTES.docs}>
            <Button size="lg" variant="secondary">
              {isRecruiter ? "Switch to recruiter tools" : "Rollout checklist"}
            </Button>
          </Link>
        </>
      );
    }

    if (isCompanyAdmin) {
      return (
        <>
          <Link href={ROUTES.companyAdminDashboard}>
            <Button size="lg">Open company workspace</Button>
          </Link>
          <Link href={isRecruiter ? ROUTES.recruiterDashboard : ROUTES.docs}>
            <Button size="lg" variant="secondary">
              {isRecruiter ? "Go to recruiter view" : "Invite teammates"}
            </Button>
          </Link>
        </>
      );
    }

    if (isCandidate && !isRecruiter) {
      return (
        <Link href={ROUTES.candidatePortal}>
          <Button size="lg">Enter candidate portal</Button>
        </Link>
      );
    }

    return (
      <>
        <Link href={isCandidate ? ROUTES.candidatePortal : ROUTES.recruiterDashboard}>
          <Button size="lg">
            {isCandidate ? "Enter candidate portal" : "Enter recruiter workspace"}
          </Button>
        </Link>
        <Link href={isCandidate ? ROUTES.recruiterDashboard : ROUTES.candidatePortal}>
          <Button size="lg" variant="secondary">
            {isCandidate ? "Switch to recruiter tools" : "Preview candidate view"}
          </Button>
        </Link>
      </>
    );
  };

  const viewerRoles = viewer?.roles ?? [];
  const viewerIsRecruiter = viewerRoles.includes("RECRUITER");
  const viewerIsCandidate = viewerRoles.includes("CANDIDATE");

  return (
    <Container as="main" className="flex flex-col gap-24 pb-24">
      <section className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            Recruiting without busywork
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Design hiring experiences candidates remember.
            </h1>
            <p className="max-w-xl text-base text-muted">
              Coordinate teams, keep candidates informed, and surface insights automatically. Talentflow brings
              your recruitment services, data, and communication into one secure workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {renderPrimaryCtas(viewer)}
            <Link href={ROUTES.docs}>
              <Button size="lg" variant="ghost">
                View documentation
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-accent" />
              <span>Average response time under 4 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-accent" />
              <span>ISO-ready audit trails included</span>
            </div>
          </div>
        </div>
        <Panel padding="lg" className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
              By the numbers
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {metrics.map((stat, index) => (
                <div
                  key={stat.label}
                  className={[
                    "space-y-2",
                    index > 0 ? "sm:border-l sm:border-border sm:pl-6" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <p className="text-3xl font-semibold text-foreground sm:text-4xl">{stat.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                    {stat.label}
                  </p>
                  <p className="text-sm text-muted">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface-muted p-5 text-sm text-muted">
            Built-in guardrails keep authentication, company context, and pacing consistent so every team ships
            securely without exposing internal architecture.
          </div>
        </Panel>
      </section>

      <section className="space-y-10">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
            Platform capabilities
          </span>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Everything your team needs to run hiring in one place.
            </h2>
            <p className="max-w-2xl text-base text-muted">
              From identity to interviews, Talentflow ships with opinionated building blocks so you can focus on
              delivering great candidate journeys instead of wiring infrastructure.
            </p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {platformHighlights.map((item) => (
            <Panel key={item.title} padding="sm" className="h-full space-y-3">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted">{item.description}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <Panel padding="lg" className="space-y-5">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
            For recruiting teams
          </span>
          <h3 className="text-2xl font-semibold text-foreground">
            Keep every stakeholder aligned from sourcing to offer.
          </h3>
          <ul className="space-y-3 text-sm text-muted">
            {recruiterHighlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link href={viewerIsRecruiter ? ROUTES.recruiterDashboard : ROUTES.signIn}>
              <Button size="md">{viewerIsRecruiter ? "Open recruiter workspace" : "Sign in as recruiter"}</Button>
            </Link>
            <Link href="/docs/recruiter">
              <Button size="md" variant="secondary">
                Recruiter playbook
              </Button>
            </Link>
          </div>
        </Panel>
        <Panel padding="lg" className="space-y-5">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
            For candidates
          </span>
          <h3 className="text-2xl font-semibold text-foreground">
            Deliver a transparent journey from resume upload to offer.
          </h3>
          <ul className="space-y-3 text-sm text-muted">
            {candidateHighlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link href={viewerIsCandidate ? ROUTES.candidatePortal : ROUTES.register}>
              <Button size="md">
                {viewerIsCandidate ? "Open candidate portal" : "Create candidate account"}
              </Button>
            </Link>
            <Link href="/docs/candidate">
              <Button size="md" variant="secondary">
                Candidate guide
              </Button>
            </Link>
          </div>
        </Panel>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Panel padding="lg" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                Product preview
              </span>
              <h3 className="text-2xl font-semibold text-foreground">Live pipeline snapshot</h3>
              <p className="text-sm text-muted">Monitor every stage with automatic SLAs and reminders.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              Realtime
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {pipelineStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-surface-muted/60 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-muted">{stat.meta}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {pipelineStages.map((stage) => (
              <div key={stage.stage} className="rounded-2xl border border-border bg-surface-muted/60 p-4 shadow-inner">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                  <span>{stage.stage}</span>
                  <span>SLA</span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-foreground">{stage.count}</p>
                <p className="text-sm text-muted">{stage.detail}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted">
                  <span>Owner: <span className="font-semibold text-foreground/80">{stage.owner}</span></span>
                  <span>{stage.sla}</span>
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-border/60">
                  <span
                    className="flex h-full rounded-full bg-accent transition-all"
                    style={{ width: `${stage.fill}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-surface-muted/80 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Focus queue</p>
                <p className="text-sm text-muted">Top items the team plans to unblock today.</p>
              </div>
              <Button size="sm" variant="ghost">
                Assign owner
              </Button>
            </div>
            <ul className="mt-4 space-y-3">
              {pipelineFocus.map((item) => (
                <li key={item.title} className="rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>{item.title}</span>
                    <span className="text-xs uppercase tracking-[0.28em] text-muted">Owner</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{item.detail}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{item.owner}</p>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
        <div className="grid gap-6">
          <Panel padding="lg" className="space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                Candidate journey
              </span>
              <h3 className="text-xl font-semibold text-foreground">Timeline view</h3>
              <p className="text-sm text-muted">One place to follow every touchpoint and owner handoff.</p>
            </div>
            <ul className="space-y-4">
              {candidateTimeline.map((event) => (
                <li key={`${event.time}-${event.title}`} className="flex gap-3">
                  <div className="w-20 shrink-0 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
                    {event.time}
                  </div>
                  <div className="flex-1 rounded-2xl border border-border bg-surface-muted/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
                        {event.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{event.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel padding="lg" className="space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                Insight tiles
              </span>
              <h3 className="text-xl font-semibold text-foreground">Real results</h3>
              <p className="text-sm text-muted">Share live KPIs with leadership and hiring managers.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {insightSnapshots.map((insight) => (
                <div key={insight.label} className="rounded-2xl border border-border bg-surface-muted/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">{insight.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{insight.value}</p>
                  <p
                    className={`text-xs font-semibold ${
                      insight.trend === "positive" ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {insight.delta}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section>
        <Panel variant="glass" padding="lg" className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
                Implementation
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Launch your workspace in weeks, not quarters.
              </h2>
              <p className="max-w-2xl text-base text-muted">
                Guided onboarding, prebuilt automations, and unified permissions land out of the box. Security,
                compliance, and collaboration stay consistent from day one—no diagrams required.
              </p>
            </div>
            <Link href={ROUTES.docs}>
              <Button size="md" variant="ghost">
                Download rollout checklist
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step) => (
              <div
                key={step.phase}
                className="rounded-xl border border-border bg-surface/95 p-5 shadow-[0_6px_16px_rgba(15,23,42,0.08)]"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                  {step.phase}
                </span>
                <p className="mt-2 text-base font-semibold text-foreground">{step.title}</p>
                <p className="mt-2 text-sm text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section>
        <Panel padding="lg" className="flex flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
            Next steps
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Experience the unified hiring workspace today.
          </h2>
          <p className="max-w-2xl text-base text-muted">
            Spin up your environment, plug in the hiring tools you already trust, and give teams a single source
            of truth for recruitment. Start with seeded users and sample data or bring your own.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {renderPrimaryCtas(viewer)}
            <Link href={ROUTES.docs}>
              <Button size="lg" variant="ghost">
                Explore documentation
              </Button>
            </Link>
          </div>
        </Panel>
      </section>
    </Container>
  );
}
