import { Container } from "@/components/ui/container";

const FAQ_ITEMS = [
  {
    question: "Nền tảng có miễn phí cho ứng viên không?",
    answer: "Có. Ứng viên sử dụng Talentflow hoàn toàn miễn phí để tạo hồ sơ, ứng tuyển và theo dõi trạng thái.",
  },
  {
    question: "Doanh nghiệp có gói dùng thử không?",
    answer: "Có. Bạn có 14 ngày dùng thử miễn phí để trải nghiệm toàn bộ tính năng quản lý tuyển dụng đa vai trò.",
  },
  {
    question: "Dữ liệu cá nhân được bảo vệ thế nào?",
    answer:
      "Thông tin được mã hoá khi lưu trữ và truyền tải. Chỉ khi bạn cấp quyền thì nhà tuyển dụng mới có thể xem chi tiết.",
  },
  {
    question: "Tôi có thể xuất lịch phỏng vấn không?",
    answer: "Có. Talentflow hỗ trợ gửi file .ics và đồng bộ với Google Calendar hoặc Outlook trong một cú nhấp.",
  },
  {
    question: "Có thể mời nhiều nhà tuyển dụng cùng xử lý?",
    answer:
      "Hoàn toàn được. Bạn phân quyền theo vai trò (SUPER_ADMIN, COMPANY_ADMIN, RECRUITER) cho từng thành viên trong workspace.",
  },
  {
    question: "Talentflow hỗ trợ báo cáo gì?",
    answer:
      "Bảng điều khiển cung cấp tỷ lệ chuyển đổi, nguồn ứng viên, thời gian tuyển và hiệu suất từng vị trí theo thời gian thực.",
  },
] as const;

export function FAQ() {
  return (
    <section aria-labelledby="home-faq" className="relative overflow-hidden py-20">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.32em]" style={{ color: '#6366F1' }}>Câu hỏi thường gặp</p>
          <h2 id="home-faq" className="text-4xl font-bold text-text">
            Chúng tôi luôn đồng hành cùng bạn
          </h2>
          <p className="text-lg text-muted">
            Nếu cần thêm thông tin về triển khai hay chính sách, hãy liên hệ đội hỗ trợ Talentflow để được hướng dẫn chi tiết.
          </p>
        </div>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <details
              key={item.question}
              className="group rounded-3xl border-2 border-border bg-surface p-6 md:p-8 shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold text-text">
                <span>{item.question}</span>
                <span aria-hidden="true" className="text-2xl transition-transform duration-300 group-open:rotate-90" style={{ color: '#6366F1' }}>
                  →
                </span>
              </summary>
              <p className="mt-4 text-base leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
