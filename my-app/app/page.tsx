import type { JSX } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/current-user";
import { ROUTES } from "@/lib/routes";
import type { JobPostingPublic, PaginatedResponse, MeResponse } from "@/lib/types";

const LATEST_JOBS_LIMIT = 6;

type JourneyStep = {
  title: string;
  description: string;
};

type JourneyTrack = {
  id: "candidate" | "recruiter";
  label: string;
  title: string;
  caption: string;
  steps: JourneyStep[];
};

const JOURNEYS: JourneyTrack[] = [
  {
    id: "candidate",
    label: "Candidate",
    title: "Own every step of your job search",
    caption: "Manage profiles, apply in minutes, and track progress with live updates.",
    steps: [
      {
        title: "Publish a standout profile",
        description:
          "Sync your CV, experience, and skills so recruiters instantly see your strengths.",
      },
      {
        title: "Apply without retyping",
        description:
          "Send applications in a few clicks; we reuse the information you already stored.",
      },
      {
        title: "Stay in the loop",
        description:
          "Stage updates and interview invites arrive instantly, so you always know what is next.",
      },
    ],
  },
  {
    id: "recruiter",
    label: "Recruiter",
    title: "Move fast with a single pipeline",
    caption: "Coordinate hiring, interviews, and comms across the team with shared context.",
    steps: [
      {
        title: "Launch a hiring campaign",
        description:
          "Publish jobs, invite teammates, and assign ownership for each company workspace.",
      },
      {
        title: "Prioritize the right talent",
        description:
          "Pipeline views highlight notes, tasks, and history to keep the team aligned.",
      },
      {
        title: "Schedule and close with confidence",
        description:
          "Calendar feeds, ICS, and automated emails keep candidates cared for at every step.",
      },
    ],
  },
];

const TESTIMONIALS = [
  {
    quote:
      "TalentFlow gives me a clear timeline. I can prepare for every interview without waiting on emails.",
    author: "Minh Anh",
    role: "Product Designer",
  },
  {
    quote:
      "Our hiring squad finally works in one place. Notes, tasks, and status changes never get lost.",
    author: "Phuong Nam",
    role: "Recruitment Lead",
  },
  {
    quote:
      "Rolling TalentFlow out to multiple companies was painless. Governance is tight while each team keeps its own view.",
    author: "Lan Huong",
    role: "HR Operations Manager",
  },
];

const TRUSTED_COMPANIES = [
  "Aidata",
  "BluePeak Studio",
  "NextOne Labs",
  "Southwind Group",
  "TechNext",
  "Vega Commerce",
];

async function getLatestJobs(): Promise<JobPostingPublic[]> {
  try {
    const params = new URLSearchParams({
      page: "0",
      size: String(LATEST_JOBS_LIMIT),
    });

    const response = await apiFetch(`/api/jobs/public?${params.toString()}`, {
      method: "GET",
      skipAuthHeaders: true,
      cache: "no-store",
    });

    const data = (await response.json()) as PaginatedResponse<JobPostingPublic>;
    return (data.items ?? [])
      .filter((item): item is JobPostingPublic => Boolean(item))
      .slice(0, LATEST_JOBS_LIMIT);
  } catch {
    return [];
  }
}

function formatJobSummary(job: JobPostingPublic) {
  const base =
    job.description ?? job.requirements ?? "Recruiters will add more details shortly. Check back soon.";
  return base.length > 160 ? `${base.slice(0, 157)}…` : base;
}

function renderHeroActions(viewer: MeResponse | null): JSX.Element {
  if (!viewer) {
    return (
      <>
        <Link href={ROUTES.register}>
          <Button size="lg">Create candidate profile</Button>
        </Link>
        <Link href={ROUTES.signIn}>
          <Button size="lg" variant="secondary">
            Sign in as recruiter
          </Button>
        </Link>
      </>
    );
  }

  const roles = new Set(viewer.roles ?? []);

  if (roles.has("SUPER_ADMIN")) {
    return (
      <>
        <Link href={ROUTES.superAdminDashboard}>
          <Button size="lg">Open super admin console</Button>
        </Link>
        <Link href={ROUTES.docs}>
          <Button size="lg" variant="secondary">
            Rollout checklist
          </Button>
        </Link>
      </>
    );
  }

  if (roles.has("COMPANY_ADMIN")) {
    return (
      <>
        <Link href={ROUTES.companyAdminDashboard}>
          <Button size="lg">Enter company workspace</Button>
        </Link>
        <Link href={ROUTES.recruiterDashboard}>
          <Button size="lg" variant="secondary">
            View recruiting dashboard
          </Button>
        </Link>
      </>
    );
  }

  if (roles.has("RECRUITER")) {
    return (
      <>
        <Link href={ROUTES.recruiterDashboard}>
          <Button size="lg">Open recruiting dashboard</Button>
        </Link>
        <Link href={ROUTES.jobs}>
          <Button size="lg" variant="secondary">
            Browse live jobs
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href={ROUTES.candidateProfile}>
        <Button size="lg">Go to my profile</Button>
      </Link>
      <Link href={ROUTES.jobs}>
        <Button size="lg" variant="secondary">
          Browse open jobs
        </Button>
      </Link>
    </>
  );
}

function LatestJobCard({ job }: { job: JobPostingPublic }) {
  const location = job.location?.trim() || "Remote or on-site";
  const workType = job.workType?.trim() || "Full time";
  const department = job.department?.trim();
  const summary = formatJobSummary(job);

  return (
    <Panel className="flex h-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">
          {workType}
        </span>
        <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
        <p className="text-sm leading-relaxed text-foreground/70">{summary}</p>
      </div>

      <div className="mt-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2 text-xs text-foreground/60">
          <span className="rounded-full border border-foreground/15 px-3 py-1">{location}</span>
          {department ? (
            <span className="rounded-full border border-foreground/15 px-3 py-1">
              {department}
            </span>
          ) : null}
        </div>
        <Link href={`${ROUTES.jobs}/${job.id}`}>
          <Button size="sm" variant="secondary">
            View details
          </Button>
        </Link>
      </div>
    </Panel>
  );
}

export default async function Home() {
  const [viewer, latestJobs] = await Promise.all([
    getCurrentUser().catch(() => null),
    getLatestJobs(),
  ]);

  return (
    <main className="flex flex-col gap-24 pb-24">
      <section className="relative overflow-hidden bg-[linear-gradient(165deg,_rgba(15,23,42,0.9)_0%,_rgba(15,23,42,0.6)_40%,_transparent_100%)]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.35),_transparent_55%)]" />
        <Container className="flex flex-col gap-16 py-20 text-white lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
              All-in-one recruiting
            </span>
            <h1 className="text-4xl font-semibold sm:text-5xl">
              Bring candidates and hiring teams together on one platform
            </h1>
            <p className="text-base leading-relaxed text-white/80">
              TalentFlow centralizes job publishing, candidate communication, and interview
              orchestration while the gateway keeps every call secure.
            </p>
            <div className="flex flex-wrap gap-3">{renderHeroActions(viewer)}</div>
            <div className="flex flex-wrap gap-3 text-xs text-white/60">
              <span className="rounded-full border border-white/20 px-3 py-1">
                End-to-end JWT protection
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                Ready for multi-company rollouts
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                Pipeline metrics in real time
              </span>
            </div>
          </div>
          <Panel variant="glass" className="bg-white/10 text-left text-sm text-white/85 backdrop-blur-md">
            <div className="space-y-4">
              <p className="text-lg font-semibold text-white">TalentFlow supports:</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-400" />
                  <span>
                    <strong className="font-semibold text-white">Candidates</strong> manage CVs,
                    applications, and notifications without losing context.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-sky-400" />
                  <span>
                    <strong className="font-semibold text-white">Recruiters</strong> collaborate on a
                    shared pipeline with tasks, notes, and interview plans.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-violet-400" />
                  <span>
                    <strong className="font-semibold text-white">Admins</strong> govern multi-company
                    deployments with dashboards and audit trails.
                  </span>
                </li>
              </ul>
            </div>
          </Panel>
        </Container>
      </section>

      <section className="py-16">
        <Container className="space-y-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                Latest jobs
              </span>
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Fresh roles hiring right now
              </h2>
              <p className="max-w-2xl text-sm text-foreground/70">
                Jump into the newest opportunities before anyone else. Sign in to apply instantly and
                receive progress alerts.
              </p>
            </div>
            <Link href={ROUTES.jobs}>
              <Button variant="ghost" size="md">
                View all jobs
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {latestJobs.length > 0 ? (
              latestJobs.map((job) => <LatestJobCard key={job.id} job={job} />)
            ) : (
              <Panel className="md:col-span-2 xl:col-span-3">
                <div className="flex flex-col gap-4 text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-foreground">No jobs published yet</h3>
                  <p className="text-sm text-foreground/70">
                    Once recruiters publish openings they will appear here immediately. Check back
                    soon or sign in to create the first posting.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                    <Link href={ROUTES.recruiterDashboard}>
                      <Button size="sm">Create a job</Button>
                    </Link>
                    <Link href={ROUTES.jobs}>
                      <Button size="sm" variant="secondary">
                        Browse job board
                      </Button>
                    </Link>
                  </div>
                </div>
              </Panel>
            )}
          </div>
        </Container>
      </section>

      <section>
        <Container className="space-y-10">
          <div className="space-y-2 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
              How it works
            </span>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Purpose-built journeys for every role
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-foreground/70">
              Each microservice shares context through the gateway so candidates, recruiters, and
              admins always know what comes next.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {JOURNEYS.map((journey) => (
              <Panel key={journey.id} className="flex h-full flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">
                    {journey.label}
                  </span>
                  <h3 className="text-2xl font-semibold text-foreground">{journey.title}</h3>
                  <p className="text-sm text-foreground/70">{journey.caption}</p>
                </div>
                <div className="space-y-4">
                  {journey.steps.map((step, index) => (
                    <div
                      key={step.title}
                      className="flex gap-4 rounded-xl border border-border/60 bg-surface-muted px-4 py-4"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(var(--accent),0.08)] text-sm font-semibold text-[rgb(var(--accent))]">
                        {(index + 1).toString().padStart(2, "0")}
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{step.title}</p>
                        <p className="text-sm text-foreground/70">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface-muted/60 py-16">
        <Container className="space-y-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                Social proof
              </span>
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Teams scaling with TalentFlow
              </h2>
              <p className="text-sm text-foreground/70">
                They automate email nudges, share dashboards with leadership, and keep candidates
                informed every step of the way.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-foreground/60">
              {TRUSTED_COMPANIES.map((company) => (
                <span
                  key={company}
                  className="rounded-full border border-foreground/15 px-3 py-1"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <Panel key={item.author} className="flex h-full flex-col justify-between gap-6">
                <p className="text-sm leading-relaxed text-foreground/80">“{item.quote}”</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.author}</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-foreground/50">
                    {item.role}
                  </p>
                </div>
              </Panel>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <Panel className="flex flex-col items-center gap-6 bg-gradient-to-r from-[rgba(var(--accent),0.12)] to-transparent text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-accent/70">
              Ready to get started
            </span>
            <h2 className="max-w-2xl text-3xl font-semibold text-foreground sm:text-4xl">
              Launch a modern recruiting workflow today
            </h2>
            <p className="max-w-xl text-sm text-foreground/70">
              Connect to the gateway, plug in your services, and move from job posting to offer
              without losing context.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={ROUTES.register}>
                <Button size="lg">Start as candidate</Button>
              </Link>
              <Link href={ROUTES.signIn}>
                <Button size="lg" variant="secondary">
                  Talk to recruiting team
                </Button>
              </Link>
            </div>
          </Panel>
        </Container>
      </section>
    </main>
  );
}
