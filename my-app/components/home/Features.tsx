import { Container } from "@/components/ui/container";

const FEATURES = [
  {
    icon: "⚙️",
    title: "Tự động hoá pipeline",
    description: "Kết nối quy trình từ đăng tin, sàng lọc đến thông báo và nhắc việc chỉ trong một bảng trạng thái.",
    gradient: "from-primary-100/90 via-primary-50 to-accent-100/70",
    iconBg: "bg-primary-600/15 text-primary-700",
    borderAccent: "border-primary-400/60",
  },
  {
    icon: "🧾",
    title: "Hồ sơ ứng viên đầy đủ",
    description: "Theo dõi kinh nghiệm, kỹ năng, CV và ghi chú nội bộ trên cùng một giao diện trực quan.",
    gradient: "from-accent-500/20 via-surface to-primary-100/60",
    iconBg: "bg-accent-500/15 text-accent-600",
    borderAccent: "border-accent-400/60",
  },
  {
    icon: "🗓️",
    title: "Lịch phỏng vấn nhanh",
    description: "Chốt múi giờ, gửi thư mời kèm file .ics và đồng bộ với các nền tảng lịch phổ biến.",
    gradient: "from-info-600/15 via-surface to-primary-500/10",
    iconBg: "bg-info-600/15 text-info-600",
    borderAccent: "border-info-500/60",
  },
  {
    icon: "📊",
    title: "Báo cáo tức thì",
    description: "Quan sát tỷ lệ chuyển đổi, thời gian tuyển và nguồn ứng viên để tối ưu chiến dịch.",
    gradient: "from-success-600/15 via-surface to-warning-500/12",
    iconBg: "bg-success-600/15 text-success-600",
    borderAccent: "border-success-500/60",
  },
] as const;

export function Features() {
  return (
    <section aria-labelledby="home-features" className="relative overflow-hidden bg-gradient-to-br from-primary-600/8 via-bg to-accent-500/10 py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.2),_transparent_50%)]" />
      <Container className="space-y-12">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-muted">
            Giải pháp toàn diện
          </p>
          <h2 id="home-features" className="text-3xl font-semibold text-text">
            Giá trị rõ ràng cho mọi đội tuyển dụng
          </h2>
          <p className="text-base text-muted">
            Talentflow giúp doanh nghiệp và ứng viên phối hợp nhịp nhàng, giảm thời gian tuyển và nâng cao trải nghiệm.
          </p>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.18),_transparent_55%)]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className={[
                "relative h-full overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl",
                feature.gradient,
                feature.borderAccent,
                "dark:from-surface/30 dark:via-surface/20 dark:to-surface/25",
              ].join(" ")}
            >
              <div className="pointer-events-none absolute -top-8 -right-6 h-24 w-24 rounded-full bg-white/20 blur-3xl dark:bg-surface/10" />
              <span
                className={[
                  "inline-flex h-11 w-11 items-center justify-center rounded-xl text-2xl",
                  feature.iconBg,
                  "dark:bg-surface/40",
                ].join(" ")}
              >
                {feature.icon}
              </span>
              <h3 className="text-lg font-semibold text-text">{feature.title}</h3>
              <p className="mt-3 text-sm text-muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
