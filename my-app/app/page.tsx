import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-16 px-6 py-24 sm:px-12 lg:px-16">
      <section className="flex flex-col gap-6">
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-foreground/80">
          Recruitment Platform
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Build the hiring experience your team and candidates deserve.
        </h1>
        <p className="max-w-2xl text-lg text-foreground/70">
          Manage authentication, company onboarding, job postings, interview schedules, and candidate
          pipelines in one place. Choose the path that matches your role to start working with the
          platform.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href={ROUTES.signIn}>
            <Button size="lg">Sign in to dashboard</Button>
          </Link>
          <Link href={ROUTES.register}>
            <Button size="lg" variant="secondary">
              Create candidate account
            </Button>
          </Link>
          <Link href={ROUTES.jobs}>
            <Button size="lg" variant="ghost">
              Explore open roles
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="col-span-2 flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground">For recruiters &amp; admins</h2>
          <p className="text-foreground/70">
            Invite teammates, publish job postings, review applications, and move candidates through the hiring pipeline.
            Tie interview schedules and feedback to every application so nothing slips through the cracks.
          </p>
          <div className="mt-auto flex flex-wrap gap-3">
            <Link href={ROUTES.recruiterDashboard}>
              <Button>Go to recruiter workspace</Button>
            </Link>
            <Link href="/docs/admin">
              <Button variant="secondary" size="sm">
                Read admin guide
              </Button>
            </Link>
          </div>
        </article>
        <article className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground">For candidates</h2>
          <p className="text-foreground/70">
            Create a rich profile, generate tailored CVs, browse openings, and stay on top of interview
            schedules and application stages in real time.
          </p>
          <div className="mt-auto flex flex-col gap-3">
            <Link href={ROUTES.candidatePortal}>
              <Button>Candidate portal</Button>
            </Link>
            <Link href="/docs/candidate">
              <Button variant="secondary" size="sm">
                Candidate handbook
              </Button>
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
