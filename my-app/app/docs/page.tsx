import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser, resolveDefaultRoute } from "@/lib/current-user";

const guides = [
  {
    title: "Admin handbook",
    description:
      "Provision companies, configure entry flows, and coordinate invitations for new tenant teams.",
    href: "/docs/admin",
    cta: "Open admin guide",
  },
  {
    title: "Candidate playbook",
    description:
      "Share best practices with applicants: profile completeness, CV management, interview tips.",
    href: "/docs/candidate",
    cta: "Open candidate guide",
  },
];

const links = [
  {
    section: "Reference",
    items: [
      { label: "Roles & permissions", href: "/docs/reference/roles" },
      { label: "Automation rules", href: "/docs/reference/automations" },
      { label: "Analytics & reporting", href: "/docs/reference/analytics" },
    ],
  },
  {
    section: "Operations",
    items: [
      { label: "Rollout checklist", href: "/docs/ops/rollout" },
      { label: "Candidate comms templates", href: "/docs/ops/templates" },
      { label: "Support & escalation", href: "/docs/ops/support" },
    ],
  },
];

export default async function DocsPage() {
  const viewer = await getCurrentUser();
  const defaultRoute = resolveDefaultRoute(viewer?.roles);

  return (
    <Container className="max-w-5xl space-y-10">
      <Panel variant="glass" padding="lg" className="space-y-5">
        <header className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
            Documentation hub
          </span>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Everything your team needs to run Talentflow.
          </h1>
          <p className="max-w-3xl text-sm text-foreground/70">
            Explore role-specific guides, rollout steps, and integration references. Keep these pages in
            sync with your Confluence/Notion space or publish them during onboarding.
          </p>
        </header>
        <div className="flex flex-wrap gap-3">
          {viewer ? (
            <>
              <Link href={defaultRoute}>
                <Button size="sm" variant="secondary">
                  Return to workspace
                </Button>
              </Link>
              <Link href="/docs/ops/rollout">
                <Button size="sm">Implementation checklist</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href={ROUTES.signIn}>
                <Button size="sm" variant="secondary">
                  Sign in
                </Button>
              </Link>
              <Link href={ROUTES.register}>
                <Button size="sm">Create candidate account</Button>
              </Link>
            </>
          )}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {guides.map((guide) => (
          <Panel key={guide.title} padding="lg" className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">{guide.title}</h2>
              <p className="text-sm text-foreground/70">{guide.description}</p>
            </div>
            <Link href={guide.href}>
              <Button size="sm">{guide.cta}</Button>
            </Link>
          </Panel>
        ))}
      </div>

      <Panel padding="lg" className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Quick links</h2>
          <p className="text-sm text-foreground/60">
            Shortcuts to the most common documents referenced during rollout and daily operations.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {links.map((group) => (
            <div key={group.section} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                {group.section}
              </p>
              <ul className="space-y-2 text-sm text-foreground/70">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition hover:text-foreground">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>
    </Container>
  );
}
