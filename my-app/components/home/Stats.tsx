import { Container } from "@/components/ui/container";

const STATS = [
  { value: "10.000+", label: "Ứng viên đang hoạt động" },
  { value: "1.200+", label: "Doanh nghiệp tin dùng" },
  { value: "4,8 / 5", label: "Mức độ hài lòng trung bình" },
  { value: "24 giờ", label: "Thời gian phản hồi trung bình" },
] as const;

export function Stats() {
  return (
    <section className="bg-bg">
      <Container className="py-20">
        <div className="grid gap-8 text-center md:grid-cols-4">
          {STATS.map((item) => (
            <div key={item.label} className="space-y-2">
              <p className="text-4xl font-bold text-primary-600">{item.value}</p>
              <p className="text-sm text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
