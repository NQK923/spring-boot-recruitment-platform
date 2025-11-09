import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/routes";

const STATS = [
  { value: "4,8 / 5", label: "Điểm hài lòng ứng viên" },
  { value: "30%", label: "Giảm thời gian phản hồi" },
  { value: "14 ngày", label: "Chu trình tuyển trung bình" },
] as const;
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 pt-24 md:pb-24 md:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 opacity-30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 left-16 h-80 w-80 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 opacity-20 blur-3xl"
      />
      <Container className="relative">
        {/* Main Content */}
        <div className="mx-auto max-w-4xl text-center space-y-8 mb-12">
          <div className="inline-flex items-center gap-2 rounded-pill border-2 border-blue-200 bg-white px-4 py-2 text-xs text-blue-700 font-bold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            SaaS tinh gọn cho đội tuyển dụng hiện đại
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Tuyển đúng người, minh bạch toàn bộ pipeline
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 leading-relaxed">
            Từ đăng job đa kênh, sàng lọc, phối hợp phỏng vấn đến gửi offer — mọi bước diễn ra trên một nền tảng hiện đại
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Button
              asChild
              size="lg"
              data-analytics-id="hero_cta_candidate"
              data-role="candidate"
              data-section="hero"
            >
              <Link href={ROUTES.candidatePortal} aria-label="Khám phá bảng việc làm mới">
                Khám phá việc làm mới
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              data-analytics-id="hero_cta_recruiter"
              data-role="recruiter"
              data-section="hero"
            >
              <Link href={ROUTES.recruiterDashboard} aria-label="Dùng thử 14 ngày miễn phí">
                Dùng thử miễn phí 14 ngày
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-3 mb-12 max-w-3xl mx-auto">
          {STATS.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-white p-5 text-center shadow-sm border-2 border-blue-100 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-200"
            >
              <dd className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{item.value}</dd>
              <dt className="text-sm text-slate-600 mt-2 font-medium">{item.label}</dt>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {/* Feature Card 1 */}
          <Card className="rounded-2xl border-2 border-blue-200 bg-white p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Đăng job đa kênh</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Đẩy tin lên Career site, mạng xã hội và TalentFlow chỉ trong một thao tác
                </p>
              </div>
            </div>
          </Card>

          {/* Feature Card 2 */}
          <Card className="rounded-2xl border-2 border-purple-200 bg-white p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
                <span className="text-2xl">🗓️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Phối hợp phỏng vấn</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Kéo thả lịch, mời hội đồng phỏng vấn, nhận feedback theo thời gian thực
                </p>
              </div>
            </div>
          </Card>

          {/* Dashboard Preview Card */}
          <Card className="rounded-2xl border-2 border-indigo-200 bg-white p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 md:col-span-2 lg:col-span-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100">
                  <span className="text-2xl">📊</span>
                </div>
                <span className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-xs text-white font-bold">
                  ⚡ Live
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Đo lường chính xác</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Dashboard trực quan với tỷ lệ chuyển đổi realtime
                </p>
                <div className="space-y-2.5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-3 border border-purple-200">
                  <div className="flex items-center justify-between text-xs text-purple-900 font-bold">
                    <span>Pipeline hiện tại</span>
                    <span className="bg-purple-100 px-2 py-0.5 rounded-full">+37</span>
                  </div>
                  <Progress label="Sàng lọc" value={72} tone="primary" />
                  <Progress label="Phỏng vấn" value={48} tone="accent" />
                  <Progress label="Đề nghị" value={18} tone="success" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}

type ProgressProps = {
  label: string;
  value: number;
  tone?: "primary" | "accent" | "success";
};

function Progress({ label, value, tone = "primary" }: ProgressProps) {
  const palette = {
    primary: "from-blue-500 to-indigo-500",
    accent: "from-purple-500 to-pink-500",
    success: "from-green-500 to-emerald-500",
  } as const;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-700">
        <span className="font-semibold">{label}</span>
        <span className="font-bold text-slate-900">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/80">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${palette[tone]} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
