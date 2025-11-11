import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const FEATURES = [
  {
    icon: "🧩",
    title: "Tự động hoá quy trình",
    description:
      "Chuẩn hoá các bước từ đăng tin, phân luồng, gán người phụ trách đến gửi thông báo – mọi thứ chạy tự động theo quy tắc bạn đặt ra.",
    gradient: "from-primary-500/20 via-primary-500/10 to-surface-2",
    chip: "bg-primary-500/20 text-primary-200",
  },
  {
    icon: "📇",
    title: "Hồ sơ ứng viên toàn diện",
    description:
      "Tổng hợp kinh nghiệm, kỹ năng, CV, ghi chú nội bộ và lịch sử tương tác trong một hồ sơ duy nhất, giúp quyết định nhanh và chính xác.",
    gradient: "from-accent-600/20 via-accent-500/12 to-surface-2",
    chip: "bg-accent-600/20 text-accent-100",
  },
  {
    icon: "🗓️",
    title: "Lịch phỏng vấn thông minh",
    description:
      "Đặt lịch theo múi giờ, gửi thư mời kèm file .ics, đồng bộ Google/Outlook và nhắc việc tự động để không bỏ sót buổi phỏng vấn nào.",
    gradient: "from-primary-600/22 via-primary-500/14 to-surface-2",
    chip: "bg-primary-500/20 text-primary-200",
  },
  {
    icon: "📈",
    title: "Bảng điều khiển tức thời",
    description:
      "Theo dõi tỷ lệ chuyển đổi, thời gian tuyển, nguồn ứng viên và hiệu suất từng nhà tuyển dụng với các tiện ích trực quan cập nhật mỗi giờ.",
    gradient: "from-success-600/22 via-success-500/14 to-surface-2",
    chip: "bg-success-600/20 text-success-200",
  },
] as const;

export function Features() {
  return (
    <section
      aria-labelledby="home-features"
      className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 opacity-20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 opacity-15 blur-3xl"
      />
      <Container className="relative space-y-8">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <p className="text-xs uppercase tracking-wider text-purple-600 font-bold">
            Bộ tính năng tinh gọn
          </p>
          <h2 id="home-features" className="text-3xl md:text-4xl font-bold text-slate-900">
            Thiết kế cho đội tuyển dụng hiện đại
          </h2>
          <p className="text-base text-slate-600">
            TalentFlow kết hợp công nghệ và trải nghiệm người dùng: nhẹ nhàng, dễ dùng nhưng đủ mạnh mẽ cho doanh nghiệp.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="group h-full bg-white border-2 border-purple-100 hover:border-purple-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              title={
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-2xl">
                    {feature.icon}
                  </span>
                  <span className="text-base font-bold text-slate-900">{feature.title}</span>
                </span>
              }
            >
              <div className="rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/30 p-3 text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
