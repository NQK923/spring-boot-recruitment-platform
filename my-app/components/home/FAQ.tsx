import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const FAQ_ITEMS = [
  {
    question: "Nền tảng có miễn phí cho ứng viên không?",
    answer:
      "Có, TalentFlow hoàn toàn miễn phí cho ứng viên. Bạn có thể tạo hồ sơ, ứng tuyển và theo dõi trạng thái không giới hạn.",
  },
  {
    question: "Doanh nghiệp có gói dùng thử không?",
    answer:
      "Có, doanh nghiệp được dùng thử 14 ngày với đầy đủ tính năng pipeline, báo cáo và tự động hoá thông báo.",
  },
  {
    question: "Dữ liệu cá nhân được bảo vệ thế nào?",
    answer:
      "Mọi dữ liệu đều được mã hoá trong quá trình truyền tải và lưu trữ. Chúng tôi chỉ chia sẻ thông tin với nhà tuyển dụng khi bạn cho phép.",
  },
  {
    question: "Có thể tích hợp với công cụ khác không?",
    answer:
      "TalentFlow hỗ trợ webhook và API mở để đồng bộ với HRIS, Slack, Gmail và bộ công cụ lịch phổ biến.",
  },
  {
    question: "Tôi có thể theo dõi tiến độ của đội tuyển dụng ra sao?",
    answer:
      "Bảng điều khiển cho phép xem trạng thái từng job, KPI theo ngày và nhật ký hoạt động chi tiết của từng thành viên.",
  },
  {
    question: "Hỗ trợ khách hàng hoạt động vào thời gian nào?",
    answer:
      "Đội ngũ thành công khách hàng hỗ trợ 24/7 qua email và live chat, đảm bảo giải quyết mọi vấn đề trong vòng 6 giờ.",
  },
] as const;

export function FAQ() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-white py-16 pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-20 right-20 h-72 w-72 rounded-full bg-gradient-to-br from-purple-300 to-blue-300 opacity-15 blur-3xl"
      />
      <Container className="relative space-y-8">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <p className="text-xs uppercase tracking-wider text-purple-600 font-bold">
            Câu hỏi thường gặp
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Giải đáp thắc mắc</h2>
          <p className="text-base text-slate-600">
            Những câu hỏi được nhiều đội tuyển dụng gửi tới chúng tôi
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 max-w-5xl mx-auto">
          {FAQ_ITEMS.map((item) => (
            <Card
              key={item.question}
              className="bg-white border-2 border-purple-100 hover:border-purple-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <details className="group [&_summary]:list-none">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-left text-base font-bold text-slate-900 hover:text-purple-600 transition-colors">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg font-bold transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.answer}</p>
              </details>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
