export default function CandidatePortalPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Candidate portal</h1>
        <p className="text-sm text-foreground/70">
          Track your applications, manage CV versions, and review interview schedules once you sign in.
        </p>
      </header>
      <section className="rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <p className="text-sm text-foreground/60">
          Hook this page to the Application Service and User Profile Service to show real-time progress of
          each submission and interview.
        </p>
      </section>
    </div>
  );
}
