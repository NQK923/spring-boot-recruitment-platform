export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface-muted/30 px-4 py-12 sm:px-6 lg:px-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-border/70 bg-surface/98 shadow-[0_28px_70px_rgba(var(--shadow-soft),0.28)]">
        <div className="flex flex-col md:flex-row">
          <aside className="hidden w-full max-w-[320px] flex-col justify-between border-b border-border/60 bg-gradient-to-br from-[rgba(80,110,255,0.85)] via-[rgba(110,140,255,0.9)] to-[rgba(150,110,255,0.9)] px-8 py-10 text-white md:flex md:border-b-0 md:border-r">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                  Talentflow
                </p>
                <h1 className="mt-3 text-2xl font-semibold leading-snug">
                  One login for every hiring workflow.
                </h1>
              </div>
              <ul className="space-y-3 text-sm text-white/85">
                <li>- Secure gateway verifies every request across services.</li>
                <li>- Candidate profiles sync automatically after registration.</li>
                <li>- Password resets use time-boxed codes for safety.</li>
              </ul>
            </div>
            <p className="text-xs text-white/70">
              Need help? Contact your company admin or the Talentflow support team.
            </p>
          </aside>
          <main className="flex-1 px-6 py-10 sm:px-10">
            <div className="mx-auto w-full max-w-lg space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
