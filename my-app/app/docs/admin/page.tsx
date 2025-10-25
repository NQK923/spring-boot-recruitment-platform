import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const checklist = [
  {
    title: "Workspace preparation",
    items: [
      "Confirm company branding, locations, and default hiring stages.",
      "Create starter job templates and interview scorecards for recruiters.",
      "Document hiring policies (offer approvals, compensation ranges) before launch.",
    ],
  },
  {
    title: "User provisioning",
    items: [
      "Invite COMPANY_ADMIN and RECRUITER accounts from the company dashboard.",
      "Send a welcome packet covering workflows, SLAs, and communication channels.",
      "Review role assignments weekly to ensure access aligns with responsibilities.",
    ],
  },
  {
    title: "Environment hygiene",
    items: [
      "Review security settings (password policy, SSO, MFA) every quarter.",
      "Archive inactive jobs and anonymise candidate data according to policy.",
      "Track platform announcements and roll out new features to your team.",
    ],
  },
];

const escalations = [
  {
    label: "Onboarding",
    description: "Tenant activation, invitation flow validation, initial job imports.",
    contact: "talentflow-onboarding@company.com",
  },
  {
    label: "Security & infra",
    description: "Access policies, suspicious login activity, or compliance questions.",
    contact: "platform-security@company.com",
  },
  {
    label: "Integrations",
    description: "Webhook failures, third-party SSO, analytics data exports.",
    contact: "integrations@company.com",
  },
];

export default function AdminDocsPage() {
  return (
    <Container className="max-w-5xl space-y-10">
      <Panel variant="glass" padding="lg" className="space-y-5">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
            Admin handbook
          </span>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Operate Talentflow safely and at scale.
          </h1>
          <p className="max-w-3xl text-sm text-foreground/70">
            Admins own tenant governance, onboarding, and platform hygiene. Use this guide as your daily
            companion and update it as operational processes evolve.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.recruiterDashboard}>
            <Button size="sm" variant="secondary">
              Back to workspace
            </Button>
          </Link>
          <Link href="/docs/candidate">
            <Button size="sm">Share candidate guide</Button>
          </Link>
        </div>
      </Panel>

      <section id="workspace-preparation">
        <Panel padding="lg" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Onboarding checklist</h2>
            <p className="text-sm text-foreground/60">
              Complete these steps before inviting recruiters or candidates into the platform.
            </p>
          </div>
          <div className="space-y-6">
            {checklist.map((section) => (
              <div
                key={section.title}
                className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 p-5"
              >
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  {section.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section id="access">
        <Panel padding="lg" className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Access & compliance</h2>
            <p className="text-sm text-foreground/60">
              Regular reviews ensure every person retains the right access and that audit logs stay clean.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
              <h3 className="text-sm font-semibold text-foreground">Role hygiene (weekly)</h3>
              <p className="text-sm text-foreground/70">
                Export the user list from admin settings. Remove access for teammates who have left or changed
                responsibilities.
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
              <h3 className="text-sm font-semibold text-foreground">Audit trail (monthly)</h3>
              <p className="text-sm text-foreground/70">
                Review recent application status changes and ensure notes capture decisions and approvals.
              </p>
            </div>
          </div>
          <div className="space-y-2 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
            <h3 className="text-sm font-semibold text-foreground">Data retention</h3>
            <p className="text-sm text-foreground/70">
              Configure automated clean-up for expired invitations, reset codes, and archived applications in line with
              your company policy.
            </p>
          </div>
        </Panel>
      </section>

      <section id="support">
        <Panel padding="lg" className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Escalation matrix</h2>
            <p className="text-sm text-foreground/60">
              Use the matrix below when you encounter platform issues or need cross-team support.
            </p>
          </div>
          <div className="space-y-4">
            {escalations.map((entry) => (
              <div
                key={entry.label}
                className="flex flex-col gap-2 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{entry.label}</p>
                  <p className="text-xs text-foreground/60">{entry.description}</p>
                </div>
                <a
                  href={`mailto:${entry.contact}`}
                  className="text-xs font-semibold text-accent transition hover:text-foreground"
                >
                  {entry.contact}
                </a>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section id="templates">
        <Panel padding="lg" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Communication templates</h2>
            <p className="text-sm text-foreground/60">
              Ready-to-send snippets for your most common invitation and reminder workflows.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div id="invites" className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
              <h3 className="text-sm font-semibold text-foreground">Invite email</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>- Subject: "You're invited to Talentflow"</li>
                <li>- Mention who invited them and why.</li>
                <li>- One sentence on what happens after acceptance.</li>
                <li>- Button linking to the invitation URL plus expiry date.</li>
              </ul>
            </div>
            <div id="reminders" className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
              <h3 className="text-sm font-semibold text-foreground">Reminder nudges</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>- Send a friendly reminder 48 hours before expiry.</li>
                <li>- Include contact info if they need help logging in.</li>
                <li>- Offer to resend the invite if the link has expired.</li>
                <li>- Reiterate the benefits of activating now.</li>
              </ul>
            </div>
          </div>
        </Panel>
      </section>

      <section id="troubleshooting">
        <Panel padding="lg" className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Troubleshooting quick tips</h2>
            <p className="text-sm text-foreground/60">
              Start with these diagnostics before escalating to engineering.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-foreground/70">
            <li>
              - <strong className="text-foreground">Sign-in issues</strong>: confirm the teammate accepted their invite or
              reset their password from the sign-in page.
            </li>
            <li>
              - <strong className="text-foreground">Missing company context</strong>: make sure the teammate is assigned to
              the correct company and role in the admin area.
            </li>
            <li>
              - <strong className="text-foreground">Delayed notifications</strong>: confirm sender addresses are verified
              and ask teammates to check spam folders before escalating.
            </li>
          </ul>
        </Panel>
      </section>
    </Container>
  );
}
