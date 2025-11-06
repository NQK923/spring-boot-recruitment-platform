import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/routes";

export function FinalCTA() {
  return (
    <section aria-labelledby="home-final-cta" className="relative overflow-hidden py-20">
      <Container>
        <div 
          className="relative overflow-hidden rounded-3xl p-12 text-center shadow-2xl"
          style={{ background: 'linear-gradient(to right, #4F46E5, #9333EA, #FF6B6B)' }}
        >
          <div className="relative">
            <span 
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.28em] text-white backdrop-blur-sm border shadow-lg"
              style={{ background: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              ⚡ Sẵn sàng bứt tốc
            </span>
            <h2 id="home-final-cta" className="mt-4 text-4xl font-bold text-white drop-shadow-md">
              Bắt đầu tuyển đúng người ngay hôm nay
            </h2>
            <p className="mt-4 text-lg text-white/95 drop-shadow-sm max-w-2xl mx-auto">
              Tạo tài khoản miễn phí để kết nối ứng viên phù hợp, tự động hoá pipeline và nâng cao trải nghiệm tuyển dụng.
            </p>
            <div className="mt-8 flex justify-center">
              <Button 
                asChild 
                size="lg" 
                style={{ background: 'white', color: '#4F46E5' }}
                className="shadow-xl hover:opacity-90 transition-all"
              >
                <Link href={ROUTES.recruiterDashboard}>Tạo tài khoản miễn phí →</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
