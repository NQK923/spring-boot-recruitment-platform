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
    <Container className="max-w-5xl space-y-10">
      <Panel variant="glass" padding="lg" className="space-y-5">
        <header className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
            Trung tâm tài liệu
          </span>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Mọi thứ đội ngũ bạn cần để vận hành Talentflow.
          </h1>
          <p className="max-w-3xl text-sm text-foreground/70">
            Khám phá tài liệu cho từng vai trò, các bước triển khai và hướng dẫn tích hợp. Hãy đồng bộ những trang này
            với không gian Confluence/Notion của bạn hoặc gửi cho thành viên mới trong quá trình onboarding.
          </p>
        </header>
        <div className="flex flex-wrap gap-3">
          {viewer ? (
            <>
              <Link href={defaultRoute}>
                <Button size="sm" variant="secondary">
                  Quay lại workspace
                </Button>
              </Link>
              <Link href="/docs/admin">
                <Button size="sm">Checklist triển khai</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href={ROUTES.signIn}>
                <Button size="sm" variant="secondary">
                  Đăng nhập
                </Button>
              </Link>
              <Link href={ROUTES.register}>
                <Button size="sm">Tạo tài khoản ứng viên</Button>
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
            className="flex flex-col justify-between space-y-4 border border-border/60 bg-gradient-to-br from-surface to-slate-900/30"
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted/80">
                Tài liệu nổi bật
              </p>
              <h2 className="text-2xl font-semibold text-foreground">{guide.title}</h2>
              <p className="text-sm text-foreground/70">{guide.description}</p>
            </div>
            <Link href={guide.href}>
              <Button size="sm">{guide.cta}</Button>
            </Link>
          </Panel>
        ))}
      </div>
    </Container>
  );
}
