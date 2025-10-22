const sampleApplications = [
  { job: "Frontend Engineer", status: "Interviewing", updatedAt: "2 hours ago" },
  { job: "Product Designer", status: "Screening", updatedAt: "Yesterday" },
  { job: "QA Analyst", status: "Applied", updatedAt: "2 days ago" },
];

export default function CandidatePortalPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Candidate portal</h1>
        <p className="text-sm text-foreground/70">
          Track applications, manage CV versions, and review interview schedules. Replace the mock content
          with live data from User Profile, Job, Application, and Interview services via the gateway.
        </p>
      </header>
      <section className="rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Recent applications</h2>
        <p className="text-sm text-foreground/60">
          Fetch from `/api/applications/my` (proxy to Application Service) to show real updates.
        </p>
        <div className="mt-4 space-y-3 text-sm">
          {sampleApplications.map((item) => (
            <div
              key={item.job}
              className="flex items-center justify-between rounded-xl border border-foreground/10 px-4 py-3"
            >
              <div>
                <p className="font-medium text-foreground">{item.job}</p>
                <p className="text-xs text-foreground/50">Last updated {item.updatedAt}</p>
              </div>
              <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
