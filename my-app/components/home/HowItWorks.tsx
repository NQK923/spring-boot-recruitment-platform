'use client';

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const FLOWS = {
  candidate: {
    label: "Ứng viên",
    color: "from-blue-500 to-indigo-500",
    steps: [
      {
        title: "Tạo hồ sơ nổi bật",
        detail: "Hoàn thiện CV chuẩn ATS, nhập kinh nghiệm và kỹ năng chỉ trong 5 phút.",
      },
      {
        title: "Ứng tuyển và theo dõi",
        detail: "Chọn job phù hợp, nộp hồ sơ và theo dõi tiến độ theo thời gian thực qua lịch trình minh bạch.",
      },
      {
        title: "Nhận thông báo kịp thời",
        detail: "Nhận email/SMS khi có lịch phỏng vấn, kết quả từng vòng và thư mời nhận việc.",
      },
    ],
  },
  recruiter: {
    label: "Nhà tuyển dụng",
    color: "from-purple-500 to-pink-500",
    steps: [
      {
        title: "Đăng tin tuyển dụng đa kênh",
        detail: "Sử dụng mẫu hoặc AI gợi ý bản mô tả công việc, xuất bản tới trang tuyển dụng & mạng xã hội.",
      },
      {
        title: "Sàng lọc & phối hợp",
        detail: "Kéo & thả ứng viên qua các giai đoạn, giao việc cho nhóm và ghi chú ngay trên thẻ.",
      },
      {
        title: "Phỏng vấn & báo cáo",
        detail: "Đặt lịch, thu thập phản hồi, gửi thư mời nhận việc và theo dõi KPI tuyển dụng tức thời.",
      },
    ],
  },
} as const;

type FlowKey = keyof typeof FLOWS;

export function HowItWorks() {
  const [flow, setFlow] = useState<FlowKey>("candidate");
  const data = FLOWS[flow];

  return (
    <section className="relative overflow-hidden home-section py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-300 to-blue-300 opacity-20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 opacity-15 blur-3xl"
      />
      <Container className="relative space-y-8">
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <p className="text-xs uppercase tracking-wider text-purple-600 font-bold">
            Quy trình làm việc
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Một quy trình cho tất cả</h2>
          <p className="text-base text-slate-600">
            Chọn vai trò của bạn để xem quy trình làm việc tương ứng
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {(Object.keys(FLOWS) as FlowKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFlow(key)}
              className={[
                "rounded-full border-2 px-6 py-2.5 text-sm font-bold transition-all",
                flow === key
                  ? "border-blue-600 bg-blue-600 text-white shadow-md"
                  : "border-blue-200 bg-white text-slate-700 hover:bg-blue-50 hover:border-blue-300",
              ].join(" ")}
            >
              {FLOWS[key].label}
            </button>
          ))}
        </div>

        <Card className="bg-white border-2 border-purple-100 shadow-md">
          <ol className="relative space-y-6 before:absolute before:left-[18px] before:top-3 before:h-[calc(100%-2rem)] before:w-0.5 before:bg-gradient-to-b before:from-blue-300 before:via-purple-300 before:to-transparent">
            {data.steps.map((step, index) => (
              <li key={step.title} className="relative pl-12">
                <span
                  className={`absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${data.color} text-white font-bold shadow-md ring-4 ring-white`}
                >
                  {index + 1}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{step.detail}</p>
              </li>
            ))}
          </ol>
        </Card>
      </Container>
    </section>
  );
}
