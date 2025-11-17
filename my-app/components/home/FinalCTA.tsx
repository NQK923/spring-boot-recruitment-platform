import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/routes";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden home-section py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 opacity-20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-blue-300 to-indigo-300 opacity-15 blur-3xl"
      />
      <Container className="relative">
        <div className="rounded-3xl border-2 border-blue-200 bg-white p-10 text-center shadow-lg">
          <span className="inline-flex rounded-full border-2 border-green-200 bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-2 text-sm font-bold text-white shadow-sm">
            🚀 Bắt đầu trong 5 phút
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900">Sẵn sàng xây dựng đội ngũ tuyển dụng?</h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Dùng thử 14 ngày với đầy đủ tính năng. Không cần thẻ tín dụng.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={ROUTES.recruiterDashboard} aria-label="Đăng ký TalentFlow miễn phí">
                Tạo tài khoản miễn phí
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={ROUTES.jobs} aria-label="Khám phá thêm việc làm">
                Xem việc làm
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
