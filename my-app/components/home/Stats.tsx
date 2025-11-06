import { Container } from "@/components/ui/container";

const STATS = [
  { value: "10.000+", label: "Ứng viên đang hoạt động", context: "Nguồn nhân lực chất lượng cao trên toàn quốc." },
  { value: "1.200+", label: "Doanh nghiệp tin dùng", context: "Từ start-up tăng trưởng nhanh đến tập đoàn đa quốc gia." },
  { value: "4,8 / 5", label: "Mức độ hài lòng", context: "Điểm trung bình từ khảo sát 1.200 ứng viên + recruiter." },
  { value: "24 giờ", label: "Phản hồi trung bình", context: "Nhờ workflow tự động & nhắc việc thông minh." },
] as const;

export function Stats() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-purple-50 py-16">
      <Container className="space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-wider text-blue-600 font-bold">
            Những con số biết nói
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Được tin tưởng bởi cộng đồng tuyển dụng</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl bg-white p-5 text-center shadow-sm border-2 border-blue-100 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-200"
            >
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{item.value}</p>
              <p className="mt-2 text-sm font-bold text-slate-800">{item.label}</p>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.context}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
