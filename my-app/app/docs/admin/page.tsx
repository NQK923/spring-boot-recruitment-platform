import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const checklist = [
  {
    title: "Workspace preparation",
    items: [
      "Confirm company details and tenant configuration via Company Service.",
      "Create initial job positions and templates to accelerate recruiter setup.",
      "Set app.jwt.secret across gateway and resource services before launch.",
    ],
  },
  {
    title: "User provisioning",
    items: [
      "Invite COMPANY_ADMIN and RECRUITER accounts from the company dashboard.",
      "Verify invitation emails are delivered through Notification Service (check RabbitMQ bindings).",
      "Audit role assignments in Auth Service to ensure least-privilege access.",
    ],
  },
  {
    title: "Environment hygiene",
    items: [
      "Monitor gateway logs for denied requests and missing headers.",
      "Schedule database migrations via Liquibase change sets for each microservice.",
      "Ensure discovery-service and gateway are healthy before allowing recruiters in.",
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
    description: "Gateway policies, JWT issues, rate limiting or suspicious activity.",
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
          <Link href="/docs/ops/rollout">
            <Button size="sm">Launch checklist</Button>
          </Link>
        </div>
      </Panel>

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
              Export Auth Service role assignments. Confirm recruiters associated with inactive tenants are removed.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
            <h3 className="text-sm font-semibold text-foreground">Audit trail (monthly)</h3>
            <p className="text-sm text-foreground/70">
              Review application status changes via Application Service and ensure notes/history reflect decisions.
            </p>
          </div>
        </div>
        <div className="space-y-2 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
          <h3 className="text-sm font-semibold text-foreground">Data retention</h3>
          <p className="text-sm text-foreground/70">
            Configure automated clean-up for expired invitations, password reset tokens, and archived applications
            according to your company policy.
          </p>
        </div>
      </Panel>

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

      <Panel padding="lg" className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Troubleshooting quick tips</h2>
          <p className="text-sm text-foreground/60">
            Start with these diagnostics before escalating to engineering.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-foreground/70">
          <li>
            - <strong className="text-foreground">Gateway 401</strong>: confirm the request includes the JWT from the
            Auth Service and that the shared secret matches environment configs.
          </li>
          <li>
            - <strong className="text-foreground">Missing company headers</strong>: verify `AddCompanyIdHeaderFilter`
            reaches Company Service and that the user is mapped in `company_users`.
          </li>
          <li>
            - <strong className="text-foreground">Delayed notifications</strong>: inspect RabbitMQ queues for
            `user.invited`, `application.status.changed`, or `interview.scheduled` bindings.
          </li>
        </ul>
      </Panel>
    </Container>
  );
}
