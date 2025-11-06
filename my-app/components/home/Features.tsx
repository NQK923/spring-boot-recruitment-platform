import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const FEATURES = [
  {
    title: "Tự động hoá pipeline",
    description: "Từ đăng tin, sàng lọc đến thông báo nội bộ đều chạy tự động theo quy tắc của doanh nghiệp.",
  },
  {
    title: "Hồ sơ ứng viên đầy đủ",
    description: "Tổng hợp kinh nghiệm, kỹ năng, CV, ghi chú và lịch sử tương tác trong một giao diện duy nhất.",
  },
  {
    title: "Lịch phỏng vấn nhanh",
    description: "Đặt lịch theo múi giờ, gửi thư mời và file .ics chỉ với vài cú nhấp, hạn chế trùng lịch.",
  },
  {
    title: "Báo cáo tức thì",
    description: "Theo dõi tỷ lệ chuyển đổi, thời gian tuyển dụng và nguồn ứng viên được cập nhật liên tục.",
  },
] as const;

export function Features() {
  return (
    <section aria-labelledby="home-features" className="bg-bg">
      <Container className="space-y-12 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary-600">
            Bộ tính năng cốt lõi
          </p>
          <h2 id="home-features" className="mt-3 text-3xl font-bold text-text">
            Giải pháp tinh gọn cho cả ứng viên và doanh nghiệp
          </h2>
          <p className="mt-4 text-lg text-muted">
            TalentFlow tích hợp đầy đủ công cụ tuyển dụng hiện đại, giảm thao tác thủ công và tăng trải nghiệm minh bạch.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="h-full rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-xl font-semibold text-text">{feature.title}</h3>
              <p className="mt-3 text-sm text-muted">{feature.description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
