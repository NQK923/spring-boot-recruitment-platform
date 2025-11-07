import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser, resolveDefaultRoute } from "@/lib/current-user";

const guides = [
  {
    title: "Sổ tay quản trị viên",
    description:
      "Thiết lập doanh nghiệp, cấu hình luồng khởi tạo và phối hợp gửi lời mời cho những đội tenants mới.",
    href: "/docs/admin",
    cta: "Mở sổ tay quản trị",
  },
  {
    title: "Cẩm nang ứng viên",
    description:
      "Chia sẻ kinh nghiệm cho ứng viên: hoàn thiện hồ sơ, quản lý CV, chuẩn bị phỏng vấn và theo dõi tiến độ.",
    href: "/docs/candidate",
    cta: "Mở cẩm nang ứng viên",
  },
];

export default async function DocsPage() {
  const viewer = await getCurrentUser();
  const defaultRoute = resolveDefaultRoute(viewer?.roles);

  return (
    <Container className="max-w-5xl space-y-10 py-12">
      <Panel variant="glass" padding="lg" className="space-y-6 border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
        <header className="space-y-4">
          <span className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.32em] text-indigo-700">
            📚 Trung tâm tài liệu
          </span>
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            Mọi thứ đội ngũ bạn cần để vận hành TalentFlow.
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-slate-600 font-medium">
            Khám phá tài liệu cho từng vai trò, các bước triển khai và hướng dẫn tích hợp. Hãy đồng bộ những trang này
            với không gian Confluence/Notion của bạn hoặc gửi cho thành viên mới trong quá trình onboarding.
          </p>
        </header>
        <div className="flex flex-wrap gap-3">
          {viewer ? (
            <>
              <Link href={defaultRoute}>
                <Button size="sm" variant="secondary" className="font-semibold">
                  ← Quay lại workspace
                </Button>
              </Link>
              <Link href="/docs/admin">
                <Button size="sm" className="font-semibold">📋 Checklist triển khai</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href={ROUTES.signIn}>
                <Button size="sm" variant="secondary" className="font-semibold">
                  🔐 Đăng nhập
                </Button>
              </Link>
              <Link href={ROUTES.register}>
                <Button size="sm" className="font-semibold">📝 Tạo tài khoản ứng viên</Button>
              </Link>
            </>
          )}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {guides.map((guide) => (
          <Panel
            key={guide.title}
            padding="lg"
            className="flex flex-col justify-between space-y-5 border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50 transition-all duration-200 hover:border-indigo-300 hover:shadow-xl"
          >
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-600">
                ⭐ Tài liệu nổi bật
              </p>
              <h2 className="text-2xl font-bold text-slate-900">{guide.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600 font-medium">{guide.description}</p>
            </div>
            <Link href={guide.href}>
              <Button size="sm" className="w-full font-semibold">{guide.cta}</Button>
            </Link>
          </Panel>
        ))}
      </div>
    </Container>
  );
}
