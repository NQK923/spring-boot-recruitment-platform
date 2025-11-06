'use client';

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const WORKFLOWS = {
  candidate: {
    label: "Ứng viên",
    steps: [
      { title: "Tạo hồ sơ chuyên nghiệp", description: "Hoàn thiện thông tin cá nhân, kỹ năng và CV chuẩn ATS chỉ trong vài phút." },
      { title: "Ứng tuyển tức thì", description: "Chọn việc làm phù hợp, gửi hồ sơ và đính kèm CV ngay trên nền tảng." },
      { title: "Theo dõi trạng thái", description: "Nhận thông báo khi có thay đổi trạng thái, ghi chú phản hồi trực tiếp trên timeline." },
    ],
  },
  recruiter: {
    label: "Nhà tuyển dụng",
    steps: [
      { title: "Đăng tin tuyển dụng", description: "Tạo job mới từ mẫu, gán pipeline và phân quyền cho đội tuyển dụng." },
      { title: "Sàng lọc & giao việc", description: "Chấm điểm hồ sơ, giao nhiệm vụ cho từng thành viên và trao đổi nội bộ." },
      { title: "Phỏng vấn & offer", description: "Đặt lịch phỏng vấn, ghi nhận đánh giá và gửi offer chỉ trong một bảng điều khiển." },
    ],
  },
} as const;

type WorkflowKey = keyof typeof WORKFLOWS;

export function HowItWorks() {
  const [active, setActive] = useState<WorkflowKey>("candidate");
  const workflow = WORKFLOWS[active];

  return (
    <section className="bg-surface/30">
      <Container className="space-y-12 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary-600">
            Lộ trình rõ ràng
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text">Cách TalentFlow đồng hành cùng bạn</h2>
          <p className="mt-4 text-lg text-muted">
            Chọn vai trò để xem các bước tối ưu hoá trải nghiệm tuyển dụng của bạn.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3" role="tablist" aria-label="Lựa chọn vai trò">
          {(Object.keys(WORKFLOWS) as WorkflowKey[]).map((key) => (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={active === key}
              aria-controls={`workflow-panel-${key}`}
              onClick={() => setActive(key)}
              className={[
                "rounded-full border px-5 py-2 text-sm font-semibold transition-colors",
                active === key
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-border bg-surface text-text hover:bg-primary-50 dark:hover:bg-white/5",
              ].join(" ")}
            >
              {WORKFLOWS[key].label}
            </button>
          ))}
        </div>

        <div
          id={`workflow-panel-${active}`}
          role="tabpanel"
          aria-live="polite"
          className="grid gap-6 md:grid-cols-3"
        >
          {workflow.steps.map((step, index) => (
            <Card key={step.title} className="h-full">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-base font-bold text-primary-600">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-text">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
