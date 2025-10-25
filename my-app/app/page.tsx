import type { JSX } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { getCurrentUser } from "@/lib/current-user";
import { getPublicOverview } from "@/lib/overview";
import { ROUTES } from "@/lib/routes";
import type { MeResponse, PublicOverviewResponse } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const PIPELINE_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEWING: "Interviews",
  OFFERED: "Offers",
  HIRED: "Hired",
  REJECTED: "Closed",
};

export default async function Home() {
  const [viewer, overview] = await Promise.all([
    getCurrentUser(),
    getPublicOverview().catch(() => null),
  ]);

  const metrics = overview?.metrics;
  const pipelineStages = overview?.pipeline.applicationStages ?? [];
  const jobStatuses = overview?.pipeline.jobStatuses ?? [];
  const spotlightJobs = overview?.spotlightJobs ?? [];
  const publishedJobs = jobStatuses.find((status) => status.status === "PUBLISHED")?.count ?? 0;

  const statsCards = [
    {
      label: "Active companies",
      value: metrics?.companies ?? 0,
      detail: "Hiring teams live this month",
    },
    {
      label: "Candidate profiles",
      value: metrics?.candidates ?? 0,
      detail: "Profiles keeping CVs current",
    },
    {
      label: "Open roles",
      value: publishedJobs,
      detail: `${formatNumber(metrics?.jobs)} tracked overall`,
    },
    {
      label: "Interviews coordinated",
      value: metrics?.interviews ?? 0,
      detail: `${formatNumber(metrics?.upcomingInterviews)} upcoming this week`,
    },
  ];

  const stageCounts = pipelineStages.map((stage) => stage.count);
  const stageMax = stageCounts.length > 0 ? Math.max(...stageCounts) : 1;

  const renderPrimaryCtas = (user: MeResponse | null): JSX.Element => {
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
            <Button size="lg">View company workspace</Button>
          </Link>
          <Link href={ROUTES.recruiterDashboard}>
            <Button size="lg" variant="secondary">
              Manage hiring pipeline
            </Button>
          </Link>
        </>
      );
    }

    if (isRecruiter) {
      return (
        <>
          <Link href={ROUTES.recruiterDashboard}>
            <Button size="lg">Go to pipeline</Button>
          </Link>
          <Link href={ROUTES.jobs}>
            <Button size="lg" variant="secondary">
              Browse live roles
            </Button>
          </Link>
        </>
      );
    }

    if (isCandidate) {
      return (
        <>
          <Link href={ROUTES.candidateProfile}>
            <Button size="lg">Update my profile</Button>
          </Link>
          <Link href={ROUTES.jobs}>
            <Button size="lg" variant="secondary">
              Browse open roles
            </Button>
          </Link>
        </>
      );
    }

    return (
      <>
        <Link href={ROUTES.signIn}>
          <Button size="lg">Sign in</Button>
        </Link>
        <Link href={ROUTES.register}>
          <Button size="lg" variant="secondary">
            Create account
          </Button>
        </Link>
      </>
    );
  };

  return (
    <main className="bg-slate-950 text-white">
      <HeroSection overview={overview} viewer={viewer} renderPrimaryCtas={renderPrimaryCtas} />

      <section className="bg-slate-950">
        <Container className="space-y-8 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-300">
                Live platform snapshot
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                Real activity powering recruiting teams
              </h2>
            </div>
            <p className="text-sm text-slate-300">Data refreshes throughout the day from live recruiting workspaces.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statsCards.map((metric) => (
              <Panel
                key={metric.label}
                padding="lg"
                className="space-y-2 border-white/10 bg-white/5 text-white shadow-[0_20px_45px_rgba(15,23,42,0.35)]"
              >
                <p className="text-sm uppercase tracking-widest text-indigo-200">{metric.label}</p>
                <p className="text-4xl font-semibold">{formatMetric(metric.value)}</p>
                <p className="text-sm text-slate-300">{metric.detail}</p>
              </Panel>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-950">
        <Container className="grid gap-6 py-12 lg:grid-cols-[1.2fr,0.8fr]">
          <Panel className="space-y-6 border-white/10 bg-white/5 text-white">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-300">Pipeline health</p>
              <h3 className="text-2xl font-semibold text-white">Applications in motion</h3>
              <p className="text-sm text-slate-300">Totals follow the standard pipeline order recruiters see in dashboards.</p>
            </div>
            <div className="space-y-4">
              {pipelineStages.length === 0 && (
                <p className="text-sm text-slate-300">
                  We haven&#39;t detected any applications yet. As soon as candidates apply, real data will appear here.
                </p>
              )}
              {pipelineStages.map((stage) => {
                const displayName = PIPELINE_LABELS[stage.stage] ?? stage.stage;
                const fillPercentage = stage.count > 0 ? Math.max((stage.count / stageMax) * 100, 8) : 4;

                return (
                  <div key={stage.stage} className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-base font-semibold text-white">{displayName}</p>
                        <p className="text-slate-300">
                          {stage.count === 1 ? "1 candidate" : `${formatNumber(stage.count)} candidates`}
                        </p>
                      </div>
                      <p className="text-2xl font-semibold text-white">{formatNumber(stage.count)}</p>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="space-y-6 border-white/10 bg-white/5 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-300">Job board</p>
              <h3 className="text-2xl font-semibold text-white">Publishing velocity</h3>
            </div>

            <div className="space-y-3">
              {jobStatuses.length === 0 && (
                <p className="text-sm text-slate-300">
                  Job Service hasn&#39;t reported any postings yet. Publish your first role to unlock this view.
                </p>
              )}
              {jobStatuses.map((status) => (
                <div
                  key={status.status}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{status.status}</p>
                    <p className="text-xs text-slate-300">via Job Service metrics</p>
                  </div>
                  <p className="text-2xl font-semibold text-white">{formatNumber(status.count)}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-dashed border-white/20 px-4 py-3 text-sm text-slate-200">
              <span className="font-semibold text-white">{formatNumber(metrics?.upcomingInterviews)}</span> interviews
              scheduled for the next week, streamed from Interview Service.
            </div>
          </Panel>
        </Container>
      </section>

      <section className="bg-slate-950">
        <Container className="space-y-6 py-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-300">Job spotlight</p>
              <h3 className="text-3xl font-semibold text-white">Latest public roles across tenants</h3>
            </div>
            <Link href={ROUTES.jobs}>
              <Button variant="secondary">Browse all published jobs</Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {spotlightJobs.length === 0 && (
              <Panel className="col-span-full border-white/10 bg-white/5 text-center text-sm text-slate-300">
                No public postings yet. Recruiters can publish roles directly from the job workspace.
              </Panel>
            )}
            {spotlightJobs.map((job) => (
              <Panel
                key={job.id}
                padding="lg"
                className="flex h-full flex-col justify-between space-y-4 border-white/10 bg-white/5 text-white"
              >
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.5em] text-indigo-200">#{job.id}</p>
                  <h4 className="text-2xl font-semibold text-white">{job.title}</h4>
                  <p className="text-sm text-slate-300">
                    {job.description ?? "Full description available on the job detail page."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-200">
                  {job.location && <span className="rounded-full bg-white/10 px-3 py-1 text-white">{job.location}</span>}
                  {job.workType && <span className="rounded-full bg-white/10 px-3 py-1 text-white">{job.workType}</span>}
                  {job.department && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-white">{job.department}</span>
                  )}
                  {job.level && <span className="rounded-full bg-white/10 px-3 py-1 text-white">{job.level}</span>}
                </div>
              </Panel>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-950">
        <Container className="py-12">
          <Panel className="flex flex-col gap-6 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.5em] text-indigo-200">
                Bring your data with you
              </p>
              <h3 className="text-2xl font-semibold">Every event is audited so teams can move with confidence.</h3>
              <p className="text-sm text-indigo-200">Managed messaging, retention rules, and policy guardrails keep each team safe.</p>
            </div>
            <div className="flex flex-wrap gap-3">{renderPrimaryCtas(viewer)}</div>
          </Panel>
        </Container>
      </section>
    </main>
  );
}

type HeroSectionProps = {
  overview: PublicOverviewResponse | null;
  viewer: MeResponse | null;
  renderPrimaryCtas: (user: MeResponse | null) => JSX.Element;
};

function HeroSection({ overview, viewer, renderPrimaryCtas }: HeroSectionProps) {
  const metrics = overview?.metrics;

  const trustSignals = [
    `${formatNumber(metrics?.applications)} applications monitored`,
    `${formatNumber(metrics?.interviews)} interviews orchestrated`,
    `${formatNumber(metrics?.companies)} multi-tenant companies live`,
  ];

  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-500/30 blur-3xl" />
      </div>
      <Container className="relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.6em] text-indigo-200">
                Recruitment control plane
              </p>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Operate every candidate touchpoint from one governance-ready workspace.
              </h1>
              <p className="text-lg text-slate-200"/>
                The recruitment platform unifies sourcing, collaboration, and interviews so talent teams launch faster without
                compromising compliance.
            </div>
            <div className="flex flex-wrap gap-4">{renderPrimaryCtas(viewer)}</div>
            <div className="flex flex-wrap gap-5 text-sm text-indigo-100">
              {trustSignals.map((signal) => (
                <div key={signal} className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400" />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>

          <Panel variant="glass" className="bg-white/5 text-white backdrop-blur">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-200">Data lineage</p>
                <h2 className="mt-2 text-2xl font-semibold">Live performance snapshot</h2>
                <p className="text-sm text-indigo-100">Figures update automatically as recruiters work their queues.</p>
              </div>
              <dl className="space-y-4">
                <div className="rounded-2xl border border-white/10 p-4">
                  <dt className="text-sm uppercase tracking-[0.3em] text-indigo-200">Companies</dt>
                  <dd className="text-3xl font-semibold">{formatMetric(metrics?.companies ?? 0)}</dd>
                  <p className="text-xs text-indigo-100">Organizations coordinating hiring on Talentflow</p>
                </div>
                <div className="rounded-2xl border border-white/10 p-4">
                  <dt className="text-sm uppercase tracking-[0.3em] text-indigo-200">Applications</dt>
                  <dd className="text-3xl font-semibold">{formatMetric(metrics?.applications ?? 0)}</dd>
                  <p className="text-xs text-indigo-100">Application progress recorded across every stage</p>
                </div>
                <div className="rounded-2xl border border-white/10 p-4">
                  <dt className="text-sm uppercase tracking-[0.3em] text-indigo-200">Interviews</dt>
                  <dd className="text-3xl font-semibold">{formatMetric(metrics?.interviews ?? 0)}</dd>
                  <p className="text-xs text-indigo-100">Upcoming interviews that keep teams aligned</p>
                </div>
              </dl>
            </div>
          </Panel>
        </div>
      </Container>
    </section>
  );
}

function formatMetric(value: number) {
  if (value >= 1000) {
    return compactFormatter.format(value);
  }
  return numberFormatter.format(value);
}

function formatNumber(value: number | undefined | null) {
  return numberFormatter.format(value ?? 0);
}
