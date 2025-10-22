const summaryMetrics = [
  { label: "Open jobs", value: 8, change: "+2 vs last week" },
  { label: "Active candidates", value: 47, change: "+12 in pipeline" },
  { label: "Interviews scheduled", value: 9, change: "3 happening today" },
];

const pipelineBreakdown = [
  { stage: "Applied", count: 32 },
  { stage: "Screening", count: 18 },
  { stage: "Interviewing", count: 11 },
  { stage: "Offer", count: 3 },
];

const upcomingInterviews = [
  {
    candidate: "Tran Thi B",
    role: "Frontend Engineer",
    time: "Today · 14:00",
    participants: ["Recruiter #12", "Hiring Manager"],
  },
  {
    candidate: "Nguyen Van C",
    role: "Product Designer",
    time: "Tomorrow · 09:30",
    participants: ["Recruiter #08", "Design Lead"],
  },
  {
    candidate: "Pham Minh D",
    role: "Backend Engineer",
    time: "Tomorrow · 16:00",
    participants: ["Recruiter #03", "CTO"],
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Recruiter workspace</h1>
        <p className="text-sm text-foreground/70">
          High-level glance at jobs, applications, and interviews. Replace mock data with real metrics
          from Company, Job, Application, and Interview services via the gateway.
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm md:grid-cols-3">
        {summaryMetrics.map((metric) => (
          <div key={metric.label} className="flex flex-col gap-1">
            <span className="text-sm text-foreground/60">{metric.label}</span>
            <span className="text-3xl font-semibold text-foreground">{metric.value}</span>
            <span className="text-xs text-emerald-600">{metric.change}</span>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
          <header>
            <h2 className="text-lg font-semibold text-foreground">Pipeline snapshot</h2>
            <p className="text-sm text-foreground/60">
              Actual values will stream from Application Service once the proxy APIs are connected.
            </p>
          </header>
          <div className="space-y-3">
            {pipelineBreakdown.map((stage) => (
              <div key={stage.stage} className="flex items-center justify-between text-sm">
                <span className="text-foreground/70">{stage.stage}</span>
                <span className="font-semibold text-foreground">{stage.count}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
          <header>
            <h2 className="text-lg font-semibold text-foreground">Upcoming interviews</h2>
            <p className="text-sm text-foreground/60">
              Replace this list with data from Interview Service (`/api/interviews/my`) filtered by recruiter.
            </p>
          </header>
          <div className="space-y-4 text-sm">
            {upcomingInterviews.map((item) => (
              <div key={`${item.candidate}-${item.time}`} className="rounded-xl border border-foreground/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{item.candidate}</span>
                  <span className="text-xs text-foreground/60">{item.time}</span>
                </div>
                <p className="text-foreground/70">{item.role}</p>
                <p className="text-xs text-foreground/50">{item.participants.join(", ")}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
