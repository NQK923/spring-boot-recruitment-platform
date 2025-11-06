import { Container } from "@/components/ui/container";

const FEATURES = [
  {
    icon: "⚙️",
    title: "Tự động hoá pipeline",
    description: "Kết nối quy trình từ đăng tin, sàng lọc đến thông báo và nhắc việc chỉ trong một bảng trạng thái.",
    bgColor: "linear-gradient(135deg, #E0E7FF 0%, #F0F4FF 50%, #E0E7FF 100%)",
    iconBg: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
    borderColor: "#A5B4FC",
  },
  {
    icon: "🧾",
    title: "Hồ sơ ứng viên đầy đủ",
    description: "Theo dõi kinh nghiệm, kỹ năng, CV và ghi chú nội bộ trên cùng một giao diện trực quan.",
    bgColor: "linear-gradient(135deg, #FFE4E6 0%, #FFF1F2 50%, #FFE4E6 100%)",
    iconBg: "linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)",
    borderColor: "#FCA5A5",
  },
  {
    icon: "🗓️",
    title: "Lịch phỏng vấn nhanh",
    description: "Chốt múi giờ, gửi thư mời kèm file .ics và đồng bộ với các nền tảng lịch phổ biến.",
    bgColor: "linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 50%, #DBEAFE 100%)",
    iconBg: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    borderColor: "#93C5FD",
  },
  {
    icon: "📊",
    title: "Báo cáo tức thì",
    description: "Quan sát tỷ lệ chuyển đổi, thời gian tuyển và nguồn ứng viên để tối ưu chiến dịch.",
    bgColor: "linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 50%, #D1FAE5 100%)",
    iconBg: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    borderColor: "#6EE7B7",
  },
] as const;

export function Features() {
  return (
    <section aria-labelledby="home-features" className="relative overflow-hidden bg-bg py-20">
      <Container className="space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.32em]" style={{ color: '#6366F1' }}>
            Giải pháp toàn diện
          </p>
          <h2 id="home-features" className="text-4xl font-bold text-text">
            Giá trị rõ ràng cho mọi đội tuyển dụng
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Talentflow giúp doanh nghiệp và ứng viên phối hợp nhịp nhàng, giảm thời gian tuyển và nâng cao trải nghiệm.
          </p>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.18),_transparent_55%)]" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="group relative h-full overflow-hidden rounded-3xl border-2 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
              style={{
                background: feature.bgColor,
                borderColor: feature.borderColor,
              }}
            >
              <div className="relative p-8 space-y-6">
                <div className="inline-flex">
                  <span
                    className="inline-flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 text-white shadow-xl"
                    style={{ background: feature.iconBg }}
                  >
                    {feature.icon}
                  </span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-text leading-tight">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{feature.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
