import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/routes";

export function FinalCTA() {
  return (
    <section aria-labelledby="home-final-cta">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-primary-600/30 bg-gradient-to-r from-primary-500/15 via-primary-50 to-accent-500/15 p-10 text-center shadow-lg dark:from-surface/10 dark:via-surface/5 dark:to-accent-500/20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.25),_transparent_55%)]" />
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary-600">
            Sẵn sàng bứt tốc
          </p>
          <h2 id="home-final-cta" className="mt-4 text-3xl font-semibold text-text">
            Bắt đầu tuyển đúng người ngay hôm nay
          </h2>
          <p className="mt-3 text-base text-muted">
            Tạo tài khoản miễn phí để kết nối ứng viên phù hợp, tự động hoá pipeline và nâng cao trải nghiệm tuyển dụng.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg">
              <Link href={ROUTES.recruiterDashboard}>Tạo tài khoản miễn phí</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
