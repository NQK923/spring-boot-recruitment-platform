import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/routes";

export function FinalCTA() {
  return (
    <section className="bg-bg">
      <Container>
        <div className="rounded-3xl bg-primary-50 p-10 text-center dark:bg-white/5">
          <h2 className="text-3xl font-bold text-text md:text-4xl">
            Bắt đầu tuyển đúng người ngay hôm nay.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Dùng thử TalentFlow miễn phí trong 14 ngày và trải nghiệm pipeline tuyển dụng tinh gọn, minh bạch.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg">
              <Link href={ROUTES.recruiterDashboard} aria-label="Đăng ký TalentFlow miễn phí">
                Tạo tài khoản miễn phí
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
