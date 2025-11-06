"use client";

import { useEffect, useMemo, useState } from "react";

import { Container } from "@/components/ui/container";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Talentflow giúp đội tuyển dụng quan sát toàn bộ pipeline và cập nhật trạng thái ngay khi có thay đổi. Việc cộng tác giữa các vai trò chưa bao giờ dễ đến vậy.",
    name: "Minh Anh",
    role: "Trưởng nhóm tuyển dụng",
    company: "Aquila Digital",
  },
  {
    quote:
      "Chúng tôi mất chưa đầy một tuần để triển khai toàn bộ team. Hồ sơ, lịch phỏng vấn và báo cáo đều nằm chung, giúp đưa ra quyết định nhanh và chính xác hơn.",
    name: "Phương Nam",
    role: "Chief People Officer",
    company: "Lumen Studio",
  },
  {
    quote:
      "Ứng viên đánh giá cao sự minh bạch, còn quản trị viên thì kiểm soát được tiêu chuẩn dữ liệu và quyền truy cập trên toàn tổ chức.",
    name: "Lan Hương",
    role: "Giám đốc nhân sự",
    company: "GreenCore Group",
  },
];

const AUTOPLAY_INTERVAL = 6000;
const SLIDE_COLORS = [
  { bg: "#F0F4FF", accent: "#4F46E5" },
  { bg: "#FFF1F2", accent: "#EE5A52" },
  { bg: "#ECFDF5", accent: "#059669" },
] as const;

export function Testimonials() {
  const items = useMemo(() => TESTIMONIALS, []);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, AUTOPLAY_INTERVAL);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const handleChange = (direction: "prev" | "next") => {
    setActiveIndex((current) => {
      if (direction === "prev") {
        return (current - 1 + items.length) % items.length;
      }
      return (current + 1) % items.length;
    });
  };

  return (
    <section aria-labelledby="home-testimonials" className="py-20">
      <Container className="space-y-10">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em]" style={{ color: '#6366F1' }}>
            Khách hàng nói gì
          </p>
          <h2 id="home-testimonials" className="text-4xl font-bold text-text">
            Được tin tưởng bởi các đội tuyển dụng năng động
          </h2>
        </div>
        <div className="relative rounded-3xl border-2 border-border bg-surface p-8 md:p-10 shadow-xl">
          <div className="overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-lg">
            <ul
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              aria-live="polite"
            >
              {items.map((item, index) => (
                <li
                  key={item.name}
                  className="min-w-full p-8 text-left rounded-2xl"
                  style={{ backgroundColor: SLIDE_COLORS[index % SLIDE_COLORS.length].bg }}
                >
                  <p className="text-lg leading-relaxed text-text">“{item.quote}”</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-1 rounded-full" style={{ backgroundColor: SLIDE_COLORS[index % SLIDE_COLORS.length].accent }} />
                    <div className="text-sm">
                      <p className="font-semibold text-text">{item.name}</p>
                      <p className="text-muted">{item.role}</p>
                      <p className="text-muted">{item.company}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {items.length > 1 ? (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                {items.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    aria-label={`Xem nhận xét ${index + 1}`}
                    className={[
                      "h-2.5 w-2.5 rounded-full transition",
                      index === activeIndex ? "bg-primary-600" : "bg-border hover:bg-primary-200",
                    ].join(" ")}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleChange("prev")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  aria-label="Xem nhận xét trước"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("next")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  aria-label="Xem nhận xét tiếp theo"
                >
                  ›
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
