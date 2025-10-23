import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const milestones = [
  {
    title: "Create your profile",
    steps: [
      "Complete your summary and contact details so recruiters can reach you.",
      "Add at least one experience and one education entry for context.",
      "Upload or generate a CV version tailored to your target roles.",
    ],
  },
  {
    title: "Apply with confidence",
    steps: [
      "Bookmark promising roles in the jobs section.",
      "Apply from the job detail page once signed in to the portal.",
      "Track application status changes directly from your dashboard.",
    ],
  },
  {
    title: "Stay interview-ready",
    steps: [
      "Enable email notifications so you never miss scheduling updates.",
      "Download the calendar file (.ics) for each confirmed interview.",
      "Review recruiter notes and prepare questions ahead of time.",
    ],
  },
];

const resources = [
  {
    label: "Portal overview",
    description: "Quick tour across dashboard, applications, interviews, and CV management.",
    href: "/docs/candidate/portal",
  },
  {
    label: "Interview checklist",
    description: "Guidance on technical setup, common questions, and follow-up etiquette.",
    href: "/docs/candidate/interviews",
  },
  {
    label: "Privacy & data",
    description: "How Talentflow stores your information and the controls at your disposal.",
    href: "/docs/legal/privacy",
  },
];

export default function CandidateDocsPage() {
  return (
    <Container className="max-w-4xl space-y-10">
      <Panel variant="glass" padding="lg" className="space-y-5">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
            Candidate playbook
          </span>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Navigate Talentflow like a pro.
          </h1>
          <p className="text-sm text-foreground/70">
            Use this guide to make the most of your applications, interviews, and profile management across
            the recruitment platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.candidatePortal}>
            <Button size="sm" variant="secondary">
              Go to portal
            </Button>
          </Link>
          <Link href={ROUTES.jobs}>
            <Button size="sm">Browse open jobs</Button>
          </Link>
        </div>
      </Panel>

      <Panel padding="lg" className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Milestones</h2>
          <p className="text-sm text-foreground/60">
            Follow these milestones to keep your journey organised from day one.
          </p>
        </div>
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.title}
              className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 p-5"
            >
              <h3 className="text-sm font-semibold text-foreground">{milestone.title}</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                {milestone.steps.map((step) => (
                  <li key={step}>- {step}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      <Panel padding="lg" className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Common questions</h2>
          <p className="text-sm text-foreground/60">
            Quick answers to the issues we see most often from candidates.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-foreground/70">
          <li>
            - <strong className="text-foreground">I forgot my password</strong>: use the{" "}
            <Link href="/auth/forgot-password" className="text-accent hover:text-foreground">
              reset flow
            </Link>{" "}
            to receive a temporary code by email.
          </li>
          <li>
            - <strong className="text-foreground">My interview slot changed</strong>: check the candidate portal for
            the updated time and download the new calendar file.
          </li>
          <li>
            - <strong className="text-foreground">My file upload failed</strong>: ensure your CV is under 10 MB
            and saved as PDF, then retry on a stable connection.
          </li>
        </ul>
      </Panel>

      <Panel padding="lg" className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Further resources</h2>
          <p className="text-sm text-foreground/60">
            Dive deeper with these hand-picked articles and reference material.
          </p>
        </div>
        <div className="space-y-3">
          {resources.map((resource) => (
            <div
              key={resource.href}
              className="flex flex-col gap-2 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{resource.label}</p>
                <p className="text-xs text-foreground/60">{resource.description}</p>
              </div>
              <Link href={resource.href} className="text-xs font-semibold text-accent transition hover:text-foreground">
                Read more
              </Link>
            </div>
          ))}
        </div>
      </Panel>
    </Container>
  );
}
