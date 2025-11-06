import { Container } from "@/components/ui/container";

const LOGOS = ["Aidata", "BluePeak Studio", "NextOne Labs", "Southwind Group", "TechNext", "Vega Commerce"] as const;

export function TrustedBy() {
  return (
    <section aria-labelledby="home-trusted-by">
      <Container className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-muted">
            Được tin tưởng bởi
          </p>
          <h2 id="home-trusted-by" className="text-xl font-semibold text-text">
            Các đội tuyển dụng dẫn đầu thị trường
          </h2>
        </div>
        <div className="rounded-3xl border border-border bg-gradient-to-r from-primary-600/8 via-surface to-accent-500/8 p-6 shadow-lg dark:from-surface/15 dark:via-surface/8 dark:to-surface/18">
          <ul className="grid grid-cols-2 gap-6 text-center text-sm font-semibold uppercase tracking-wide text-muted sm:grid-cols-3 lg:grid-cols-6">
            {LOGOS.map((logo) => (
              <li
                key={logo}
                className="rounded-2xl border border-transparent bg-surface/60 px-4 py-5 transition hover:border-primary-600 hover:bg-primary-50/60 hover:text-primary-600 dark:bg-surface/20 dark:hover:bg-surface/40"
              >
                {logo}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
