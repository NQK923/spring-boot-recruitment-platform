import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const FAQ_ITEMS = [
  {
    question: "Nền tảng có miễn phí cho ứng viên không?",
    answer: "Có, TalentFlow hoàn toàn miễn phí cho ứng viên. Bạn có thể tạo hồ sơ, ứng tuyển và theo dõi trạng thái không giới hạn.",
  },
  {
    question: "Doanh nghiệp có gói dùng thử không?",
    answer: "Có, doanh nghiệp được dùng thử 14 ngày với đầy đủ tính năng pipeline, báo cáo và tự động hoá thông báo.",
  },
  {
    question: "Dữ liệu cá nhân được bảo vệ thế nào?",
    answer: "Mọi dữ liệu đều được mã hoá trong quá trình truyền tải và lưu trữ. Chúng tôi chỉ chia sẻ thông tin với nhà tuyển dụng khi bạn cho phép.",
  },
  {
    question: "Có thể tích hợp với công cụ khác không?",
    answer: "TalentFlow hỗ trợ webhook và API mở để đồng bộ với HRIS, Slack, Gmail và bộ công cụ lịch phổ biến.",
  },
  {
    question: "Tôi có thể theo dõi tiến độ của đội tuyển dụng ra sao?",
    answer: "Bảng điều khiển cho phép xem trạng thái từng job, KPI theo ngày và nhật ký hoạt động chi tiết của từng thành viên.",
  },
  {
    question: "Hỗ trợ khách hàng hoạt động vào thời gian nào?",
    answer: "Đội ngũ thành công khách hàng hỗ trợ 24/7 qua email và live chat, đảm bảo giải quyết mọi vấn đề trong vòng 6 giờ.",
  },
] as const;

export function FAQ() {
  return (
    <section className="bg-bg">
      <Container className="space-y-12 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary-600">
            Câu hỏi thường gặp
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text">Giải đáp nhanh cho những thắc mắc phổ biến</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ_ITEMS.map((item) => (
            <Card key={item.question} className="rounded-2xl border border-border bg-surface">
              <details className="group [&_summary]:list-none">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-left text-base font-semibold text-text">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="text-primary-600 transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted">{item.answer}</p>
              </details>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
