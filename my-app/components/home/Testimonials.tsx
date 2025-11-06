import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Nguyễn Khánh Linh",
    role: "Talent Acquisition Lead · FintechX",
    quote:
      "TalentFlow giúp đội tuyển dụng của chúng tôi rút ngắn 30% thời gian phản hồi ứng viên và luôn giữ pipeline minh bạch với ban lãnh đạo.",
  },
  {
    name: "Trần Duy Minh",
    role: "Senior Developer · Ứng viên",
    quote:
      "Tôi luôn biết trạng thái hồ sơ của mình đang ở đâu và nhận email cập nhật ngay lập tức. Trải nghiệm ứng tuyển rõ ràng hơn rất nhiều.",
  },
  {
    name: "Lê Thảo Vy",
    role: "HR Director · Nova Retail",
    quote:
      "Bộ báo cáo tức thì và nhắc việc tự động giúp đội ngũ quản lý dễ dàng theo dõi KPI tuyển dụng mà không cần bảng tính thủ công.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-bg">
      <Container className="space-y-12 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary-600">
            Khách hàng nói gì?
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text">Tiếng nói từ những đội tuyển dụng hiện đại</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <Card key={item.name} className="flex h-full flex-col gap-6 rounded-3xl p-6">
              <p className="text-sm italic text-muted">“{item.quote}”</p>
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-lg font-semibold text-primary-600">
                  {getInitials(item.name)}
                </span>
                <div>
                  <p className="text-base font-semibold text-text">{item.name}</p>
                  <p className="text-sm text-muted">{item.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
