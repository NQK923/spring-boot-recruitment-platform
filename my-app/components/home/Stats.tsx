import { Container } from "@/components/ui/container";

const STATS = [
  { value: "10.000+", label: "Ứng viên đang hoạt động" },
  { value: "1.200+", label: "Doanh nghiệp tin dùng" },
  { value: "4.8/5", label: "Điểm hài lòng trung bình" },
  { value: "24 giờ", label: "Thời gian phản hồi trung bình" },
] as const;

export function Stats() {
  return (
    <section aria-labelledby="home-stats" className="relative overflow-hidden bg-gradient-to-br from-primary-700/10 via-bg to-accent-600/10 py-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.08),_transparent_60%)]" />
      <Container className="space-y-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-muted">
            Số liệu tin cậy
          </p>
          <h2 id="home-stats" className="mt-2 text-3xl font-semibold text-text">
            Bằng chứng từ các đội tuyển dụng đang sử dụng Talentflow
          </h2>
        </div>
        <div className="grid gap-6 text-center md:grid-cols-2 xl:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-gradient-to-br from-primary-600/10 via-surface to-accent-500/10 p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:from-surface/25 dark:via-surface/15 dark:to-surface/25"
            >
              <p className="text-4xl font-semibold text-primary-600">{stat.value}</p>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
