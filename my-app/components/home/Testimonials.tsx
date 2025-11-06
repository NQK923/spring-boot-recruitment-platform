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
const SLIDE_GRADIENTS = [
  "bg-gradient-to-br from-primary-600/15 via-surface to-accent-500/10",
  "bg-gradient-to-br from-accent-500/15 via-surface to-primary-500/10",
  "bg-gradient-to-br from-success-600/15 via-surface to-info-600/10",
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
    <section aria-labelledby="home-testimonials">
      <Container className="space-y-8">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-muted">
            Khách hàng nói gì
          </p>
          <h2 id="home-testimonials" className="text-3xl font-semibold text-text">
            Được tin tưởng bởi các đội tuyển dụng năng động
          </h2>
        </div>
        <div className="relative rounded-3xl border border-border bg-gradient-to-br from-primary-600/12 via-surface to-accent-500/10 p-6 shadow-xl dark:from-surface/15 dark:via-surface/10 dark:to-surface/20">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-lg dark:bg-surface/95">
            <ul
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              aria-live="polite"
            >
              {items.map((item, index) => (
                <li
                  key={item.name}
                  className={[
                    "min-w-full p-8 text-left",
                    SLIDE_GRADIENTS[index % SLIDE_GRADIENTS.length],
                    "rounded-2xl",
                  ].join(" ")}
                >
                  <p className="text-lg leading-relaxed text-text">“{item.quote}”</p>
                  <div className="mt-6 text-sm text-muted">
                    <p className="font-semibold text-text">{item.name}</p>
                    <p>{item.role}</p>
                    <p>{item.company}</p>
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
