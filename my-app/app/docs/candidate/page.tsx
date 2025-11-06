import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const milestones = [
  {
    title: "Tạo hồ sơ cá nhân",
    steps: [
      "Hoàn thiện phần giới thiệu và thông tin liên hệ để nhà tuyển dụng dễ dàng kết nối.",
      "Thêm ít nhất một kinh nghiệm làm việc và một học vấn để cung cấp bối cảnh đầy đủ.",
      "Tải lên hoặc tạo bản CV phù hợp với vị trí mục tiêu.",
    ],
  },
  {
    title: "Ứng tuyển tự tin",
    steps: [
      "Đánh dấu những tin hấp dẫn trong danh sách việc làm.",
      "Đăng nhập cổng ứng viên và nộp hồ sơ từ trang chi tiết việc làm.",
      "Theo dõi thay đổi trạng thái ứng tuyển trực tiếp trong bảng điều khiển.",
    ],
  },
  {
    title: "Luôn sẵn sàng phỏng vấn",
    steps: [
      "Bật thông báo email để không bỏ lỡ cập nhật lịch phỏng vấn.",
      "Tải tệp lịch (.ics) cho mỗi buổi phỏng vấn đã xác nhận.",
      "Xem ghi chú của nhà tuyển dụng và chuẩn bị câu hỏi trước buổi gặp.",
    ],
  },
];

const resources = [
  {
    label: "Tổng quan portal",
    description: "Giới thiệu nhanh về dashboard, đơn ứng tuyển, lịch phỏng vấn và quản lý CV.",
    href: "/docs/candidate/portal",
  },
  {
    label: "Checklist phỏng vấn",
    description: "Hướng dẫn chuẩn bị thiết bị, câu hỏi thường gặp và phép lịch sự sau buổi phỏng vấn.",
    href: "/docs/candidate/interviews",
  },
  {
    label: "Quyền riêng tư & dữ liệu",
    description: "Cách Talentflow lưu trữ thông tin và các tùy chọn kiểm soát của bạn.",
    href: "/docs/legal/privacy",
  },
];

export default function CandidateDocsPage() {
  return (
    <Container className="max-w-4xl space-y-10">
      <Panel variant="glass" padding="lg" className="space-y-5">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
            Cẩm nang ứng viên
          </span>
          <h1 className="text-3xl font-semibold text-text sm:text-4xl">
            Chinh phục Talentflow như một chuyên gia.
          </h1>
          <p className="text-sm text-muted">
            Dùng cẩm nang này để tối ưu từng đơn ứng tuyển, lịch phỏng vấn và việc quản lý hồ sơ trên nền tảng tuyển
            dụng.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.candidatePortal}>
            <Button size="sm" variant="secondary">
              Vào cổng ứng viên
            </Button>
          </Link>
          <Link href={ROUTES.jobs}>
            <Button size="sm">Xem việc đang tuyển</Button>
          </Link>
        </div>
      </Panel>

      <Panel padding="lg" className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-text">Các cột mốc chính</h2>
          <p className="text-sm text-muted">
            Bám sát những cột mốc này để hành trình của bạn luôn mạch lạc ngay từ ngày đầu tiên.
          </p>
        </div>
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.title}
              className="space-y-3 rounded-2xl border border-border bg-surface p-5"
            >
              <h3 className="text-sm font-semibold text-text">{milestone.title}</h3>
              <ul className="space-y-2 text-sm text-muted">
                {milestone.steps.map((step) => (
                  <li key={step}>- {step}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      <Panel padding="lg" className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-text">Câu hỏi thường gặp</h2>
          <p className="text-sm text-muted">
            Những câu trả lời nhanh cho các tình huống ứng viên hay gặp nhất.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-muted">
          <li>
            - <strong className="text-text">Quên mật khẩu</strong>: sử dụng{" "}
            <Link href="/auth/forgot-password" className="text-primary-600 hover:text-text">
              luồng đặt lại
            </Link>{" "}
            để nhận mã tạm qua email.
          </li>
          <li>
            - <strong className="text-text">Lịch phỏng vấn bị đổi</strong>: kiểm tra lại cổng ứng viên để xem
            thời gian mới và tải tệp lịch cập nhật.
          </li>
          <li>
            - <strong className="text-text">Tải CV thất bại</strong>: đảm bảo tệp dưới 10 MB, định dạng PDF và thử
            lại khi kết nối ổn định.
          </li>
        </ul>
      </Panel>

      <Panel padding="lg" className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-text">Tài nguyên bổ sung</h2>
          <p className="text-sm text-muted">
            Đào sâu hơn với những bài viết và tài liệu tham khảo được chọn lọc dưới đây.
          </p>
        </div>
        <div className="space-y-3">
          {resources.map((resource) => (
            <div
              key={resource.href}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-text">{resource.label}</p>
                <p className="text-xs text-muted">{resource.description}</p>
              </div>
              <Link href={resource.href} className="text-xs font-semibold text-primary-600 transition hover:text-text">
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      </Panel>
    </Container>
  );
}
