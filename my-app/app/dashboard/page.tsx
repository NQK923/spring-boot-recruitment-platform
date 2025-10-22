export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Recruiter workspace</h1>
        <p className="text-sm text-foreground/70">
          Manage companies, job postings, applications, and interview schedules. This page will surface
          analytics once authentication is wired.
        </p>
      </header>
      <section className="grid gap-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <p className="text-sm text-foreground/60">
          Connect the auth flow to unlock recruiter dashboards, job management, and application pipelines.
        </p>
      </section>
    </div>
  );
}
