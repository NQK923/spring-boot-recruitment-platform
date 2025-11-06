import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const checklist = [
  {
    title: "Chuẩn bị workspace",
    items: [
      "Xác nhận bộ nhận diện doanh nghiệp, địa điểm và các giai đoạn tuyển dụng mặc định.",
      "Tạo mẫu tin tuyển dụng và phiếu chấm điểm phỏng vấn để đội ngũ sử dụng ngay.",
      "Tài liệu hóa chính sách tuyển dụng (phê duyệt offer, khung lương) trước khi triển khai.",
    ],
  },
  {
    title: "Cấp quyền người dùng",
    items: [
      "Mời tài khoản COMPANY_ADMIN và RECRUITER từ bảng điều khiển công ty.",
      "Gửi gói chào mừng bao gồm quy trình làm việc, SLA và kênh trao đổi chính.",
      "Rà soát phân quyền mỗi tuần để bảo đảm quyền truy cập đúng với trách nhiệm.",
    ],
  },
  {
    title: "Giữ môi trường sạch",
    items: [
      "Đánh giá cài đặt bảo mật (mật khẩu, SSO, MFA) mỗi quý một lần.",
      "Lưu trữ tin tuyển dụng không hoạt động và ẩn danh dữ liệu ứng viên theo chính sách.",
      "Theo dõi thông báo nền tảng và phổ biến tính năng mới cho đội ngũ.",
    ],
  },
];

const escalations = [
  {
    label: "Onboarding",
    description: "Kích hoạt tenant, kiểm tra luồng mời tham gia, nhập dữ liệu tin tuyển dụng ban đầu.",
    contact: "talentflow-onboarding@company.com",
  },
  {
    label: "Bảo mật & hạ tầng",
    description: "Chính sách truy cập, hoạt động đăng nhập bất thường, câu hỏi tuân thủ.",
    contact: "platform-security@company.com",
  },
  {
    label: "Tích hợp",
    description: "Sự cố webhook, đăng nhập SSO bên thứ ba, xuất dữ liệu phân tích.",
    contact: "integrations@company.com",
  },
];

export default function AdminDocsPage() {
  return (
    <Container className="max-w-5xl space-y-10">
      <Panel variant="glass" padding="lg" className="space-y-5">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
            Sổ tay quản trị viên
          </span>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Vận hành Talentflow an toàn và ở quy mô lớn.
          </h1>
          <p className="max-w-3xl text-sm text-foreground/70">
            Quản trị viên chịu trách nhiệm quản lý tenant, onboarding và giữ môi trường vận hành sạch. Hãy sử dụng sổ
            tay này mỗi ngày và cập nhật khi quy trình nội bộ thay đổi.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.recruiterDashboard}>
            <Button size="sm" variant="secondary">
              Quay lại workspace
            </Button>
          </Link>
          <Link href="/docs/candidate">
            <Button size="sm">Chia sẻ cẩm nang ứng viên</Button>
          </Link>
        </div>
      </Panel>

      <section id="workspace-preparation">
        <Panel padding="lg" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Checklist triển khai</h2>
            <p className="text-sm text-foreground/60">
              Hoàn thành những bước này trước khi mời nhà tuyển dụng hoặc ứng viên vào nền tảng.
            </p>
          </div>
          <div className="space-y-6">
            {checklist.map((section) => (
              <div
                key={section.title}
                className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 p-5"
              >
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  {section.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section id="access">
        <Panel padding="lg" className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Truy cập & tuân thủ</h2>
            <p className="text-sm text-foreground/60">
              Rà soát định kỳ để đảm bảo mọi người giữ đúng quyền truy cập và nhật ký luôn sạch.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
              <h3 className="text-sm font-semibold text-foreground">Vệ sinh phân quyền (hằng tuần)</h3>
              <p className="text-sm text-foreground/70">
                Xuất danh sách người dùng trong phần quản trị. Thu hồi quyền với các thành viên đã nghỉ việc hoặc đổi
                nhiệm vụ.
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
              <h3 className="text-sm font-semibold text-foreground">Theo dõi nhật ký (hằng tháng)</h3>
              <p className="text-sm text-foreground/70">
                Rà soát các lần đổi trạng thái ứng tuyển và chắc chắn rằng ghi chú thể hiện rõ quyết định và phê duyệt.
              </p>
            </div>
          </div>
          <div className="space-y-2 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
            <h3 className="text-sm font-semibold text-foreground">Lưu trữ dữ liệu</h3>
            <p className="text-sm text-foreground/70">
              Thiết lập tự động xóa lời mời hết hạn, mã đặt lại mật khẩu và hồ sơ đã lưu trữ theo chính sách công ty.
            </p>
          </div>
        </Panel>
      </section>

      <section id="support">
        <Panel padding="lg" className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Ma trận hỗ trợ</h2>
            <p className="text-sm text-foreground/60">
              Sử dụng bảng sau khi bạn gặp sự cố nền tảng hoặc cần phối hợp cùng đội khác.
            </p>
          </div>
          <div className="space-y-4">
            {escalations.map((entry) => (
              <div
                key={entry.label}
                className="flex flex-col gap-2 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{entry.label}</p>
                  <p className="text-xs text-foreground/60">{entry.description}</p>
                </div>
                <a
                  href={`mailto:${entry.contact}`}
                  className="text-xs font-semibold text-accent transition hover:text-foreground"
                >
                  {entry.contact}
                </a>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section id="templates">
        <Panel padding="lg" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Mẫu liên lạc</h2>
            <p className="text-sm text-foreground/60">
              Những đoạn văn bản sẵn sàng gửi cho các tình huống mời tham gia và nhắc nhở phổ biến nhất.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div id="invites" className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
              <h3 className="text-sm font-semibold text-foreground">Email mời tham gia</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>- Tiêu đề: &#34;Mời bạn tham gia Talentflow&#34;</li>
                <li>- Nhắc lại ai đã mời và lý do cụ thể.</li>
                <li>- Một câu giải thích điều gì xảy ra sau khi chấp nhận.</li>
                <li>- Nút liên kết tới URL lời mời kèm ngày hết hạn.</li>
              </ul>
            </div>
            <div id="reminders" className="space-y-3 rounded-2xl border border-foreground/10 bg-surface/95 p-5">
              <h3 className="text-sm font-semibold text-foreground">Thông báo nhắc nhở</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>- Gửi lời nhắc thân thiện trước 48 giờ khi lời mời sắp hết hạn.</li>
                <li>- Đính kèm thông tin liên hệ nếu họ cần hỗ trợ đăng nhập.</li>
                <li>- Đề nghị gửi lại lời mời nếu liên kết đã hết hạn.</li>
                <li>- Nhắc lại lợi ích của việc kích hoạt ngay hôm nay.</li>
              </ul>
            </div>
          </div>
        </Panel>
      </section>

      <section id="troubleshooting">
        <Panel padding="lg" className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Mẹo xử lý nhanh</h2>
            <p className="text-sm text-foreground/60">
              Bắt đầu với những bước này trước khi nhờ tới đội kỹ thuật.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-foreground/70">
            <li>
              - <strong className="text-foreground">Sự cố đăng nhập</strong>: kiểm tra thành viên đã chấp nhận lời mời
              hay chưa hoặc gửi yêu cầu đặt lại mật khẩu từ trang đăng nhập.
            </li>
            <li>
              - <strong className="text-foreground">Thiếu bối cảnh công ty</strong>: đảm bảo thành viên đã được gán vào
              đúng công ty và vai trò trong mục quản trị.
            </li>
            <li>
              - <strong className="text-foreground">Thông báo đến chậm</strong>: xác nhận địa chỉ người gửi đã được
              xác thực và nhắc thành viên kiểm tra thư mục spam trước khi leo thang.
            </li>
          </ul>
        </Panel>
      </section>
    </Container>
  );
}
