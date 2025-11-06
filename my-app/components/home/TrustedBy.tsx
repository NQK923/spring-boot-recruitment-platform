import { Container } from "@/components/ui/container";

const LOGOS = ["Aidata", "BluePeak Studio", "NextOne Labs", "Southwind Group", "TechNext", "Vega Commerce"] as const;

export function TrustedBy() {
  return (
    <section aria-labelledby="home-trusted-by" className="py-20">
      <Container className="space-y-10">
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.32em]" style={{ color: '#6366F1' }}>
            Được tin tưởng bởi
          </p>
          <h2 id="home-trusted-by" className="text-3xl font-bold text-text">
            Các đội tuyển dụng dẫn đầu thị trường
          </h2>
        </div>
        <div className="rounded-3xl border-2 border-border bg-surface p-8 md:p-10 shadow-xl">
          <ul className="grid grid-cols-2 gap-8 text-center text-sm font-bold uppercase tracking-wide text-muted sm:grid-cols-3 lg:grid-cols-6">
            {LOGOS.map((logo) => (
              <li
                key={logo}
                className="rounded-2xl border-2 border-border bg-surface px-6 py-6 transition-all duration-300 hover:border-primary-600 hover:bg-primary-50 hover:scale-105"
                style={{ 
                  cursor: 'default',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#4F46E5'}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
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
