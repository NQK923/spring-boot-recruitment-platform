import { Container } from "@/components/ui/container";

import { HowItWorksTabs, type HowItWorksTrack } from "./how-it-works-tabs";

const TRACKS: HowItWorksTrack[] = [
  {
    id: "candidate",
    label: "Ứng viên",
    caption: "Tạo hồ sơ một lần, ứng tuyển nhanh chóng và nhận thông báo trạng thái ngay khi có thay đổi.",
    steps: [
      {
        title: "Tạo hồ sơ nổi bật",
        description: "Nhập kinh nghiệm, kỹ năng, đặt CV chính và cập nhật thông tin liên hệ chỉ trong vài phút.",
      },
      {
        title: "Ứng tuyển linh hoạt",
        description: "Chọn công việc phù hợp, gửi hồ sơ và để lại lời nhắn cho nhà tuyển dụng dễ hiểu hơn.",
      },
      {
        title: "Theo dõi trạng thái realtime",
        description: "Nhận thông báo khi hồ sơ được xem, phỏng vấn được đặt lịch hoặc offer được gửi đi.",
      },
    ],
  },
  {
    id: "recruiter",
    label: "Nhà tuyển dụng",
    caption: "Quản lý toàn bộ pipeline tuyển dụng với sự minh bạch và cộng tác chặt chẽ giữa các vai trò.",
    steps: [
      {
        title: "Đăng tin và mời nội bộ",
        description: "Tạo job, phân quyền và mời thành viên vào workspace để cùng xử lý hồ sơ.",
      },
      {
        title: "Sàng lọc và giao việc",
        description: "Gắn tag, ghi chú, giao nhiệm vụ và đặt chủ sở hữu cho từng ứng viên không bỏ sót thông tin.",
      },
      {
        title: "Phỏng vấn và gửi offer",
        description: "Chốt lịch phỏng vấn, thu thập phản hồi, gửi offer và đồng bộ kết quả cho mọi bên liên quan.",
      },
    ],
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="home-how-it-works">
      <Container className="space-y-8">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-muted">
            Cách hoạt động
          </p>
          <h2 id="home-how-it-works" className="text-3xl font-semibold text-text">
            3 bước rõ ràng cho cả ứng viên và nhà tuyển dụng
          </h2>
        </div>
        <div className="rounded-3xl border border-border bg-gradient-to-br from-accent-500/10 via-primary-500/8 to-primary-600/10 p-8 shadow-lg dark:from-surface/15 dark:via-surface/10 dark:to-surface/20">
          <HowItWorksTabs tracks={TRACKS} />
        </div>
      </Container>
    </section>
  );
}
