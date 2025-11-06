import { Container } from "@/components/ui/container";

const STATS = [
  { value: "10.000+", label: "Ứng viên đang hoạt động", gradient: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)", bgColor: "#F0F4FF" },
  { value: "1.200+", label: "Doanh nghiệp tin dùng", gradient: "linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)", bgColor: "#FFF1F2" },
  { value: "4.8/5", label: "Điểm hài lòng trung bình", gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)", bgColor: "#ECFDF5" },
  { value: "24 giờ", label: "Thời gian phản hồi trung bình", gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)", bgColor: "#EFF6FF" },
] as const;

export function Stats() {
  return (
    <section aria-labelledby="home-stats" className="relative overflow-hidden py-20">
      <Container className="space-y-12">
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.32em]" style={{ color: '#6366F1' }}>
            Số liệu tin cậy
          </p>
          <h2 id="home-stats" className="text-4xl font-bold text-text max-w-3xl mx-auto">
            Bằng chứng từ các đội tuyển dụng đang sử dụng Talentflow
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="group relative rounded-3xl border-2 border-transparent p-10 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:border-white overflow-hidden"
              style={{ backgroundColor: stat.bgColor }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ 
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)'
              }} />
              <div className="relative text-center space-y-3">
                <p className="text-6xl font-extrabold" style={{
                  background: stat.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>{stat.value}</p>
                <p className="text-sm font-semibold text-muted leading-snug">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
