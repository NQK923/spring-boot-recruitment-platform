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
      "Tài liệu hóa chính sách tuyển dụng (phê duyệt lời mời làm việc, khung lương) trước khi triển khai.",
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
    description: "Kích hoạt tài khoản khách hàng, kiểm tra luồng mời tham gia, nhập dữ liệu tin tuyển dụng ban đầu.",
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
    <Container className="max-w-5xl space-y-10 py-12">
      <Panel variant="glass" padding="lg" className="space-y-6 border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
        <div className="space-y-4">
          <span className="inline-block rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.32em] text-purple-700">
            👨‍💼 Sổ tay quản trị viên
          </span>
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            Vận hành TalentFlow an toàn và ở quy mô lớn.
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-slate-600 font-medium">
            Quản trị viên chịu trách nhiệm quản lý khách hàng, onboarding và giữ môi trường vận hành sạch. Hãy sử dụng sổ
            tay này mỗi ngày và cập nhật khi quy trình nội bộ thay đổi.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.recruiterDashboard}>
            <Button size="sm" variant="secondary" className="font-semibold">
              ← Quay lại không gian làm việc
            </Button>
          </Link>
          <Link href="/docs/candidate">
            <Button size="sm" className="font-semibold">📖 Chia sẻ cẩm nang ứng viên</Button>
          </Link>
        </div>
      </Panel>

      <section id="workspace-preparation">
        <Panel padding="lg" className="space-y-6 border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">📋 Checklist triển khai</h2>
            <p className="text-sm text-slate-600 font-medium">
              Hoàn thành những bước này trước khi mời nhà tuyển dụng hoặc ứng viên vào nền tảng.
            </p>
          </div>
          <div className="space-y-5">
            {checklist.map((section) => (
              <div
                key={section.title}
                className="space-y-3 rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-5"
              >
                <h3 className="text-base font-bold text-indigo-900">{section.title}</h3>
                <ul className="space-y-2 text-sm text-slate-700 font-medium">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-indigo-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section id="access">
        <Panel padding="lg" className="space-y-6 border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">🔒 Truy cập & tuân thủ</h2>
            <p className="text-sm text-slate-600 font-medium">
              Rà soát định kỳ để đảm bảo mọi người giữ đúng quyền truy cập và nhật ký luôn sạch.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 p-5">
              <h3 className="text-base font-bold text-emerald-900">Vệ sinh phân quyền (hằng tuần)</h3>
              <p className="text-sm text-slate-700 font-medium">
                Xuất danh sách người dùng trong phần quản trị. Thu hồi quyền với các thành viên đã nghỉ việc hoặc đổi
                nhiệm vụ.
              </p>
            </div>
            <div className="space-y-3 rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 p-5">
              <h3 className="text-base font-bold text-emerald-900">Theo dõi nhật ký (hằng tháng)</h3>
              <p className="text-sm text-slate-700 font-medium">
                Rà soát các lần đổi trạng thái ứng tuyển và chắc chắn rằng ghi chú thể hiện rõ quyết định và phê duyệt.
              </p>
            </div>
          </div>
          <div className="space-y-3 rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 p-5">
            <h3 className="text-base font-bold text-emerald-900">Lưu trữ dữ liệu</h3>
            <p className="text-sm text-slate-700 font-medium">
              Thiết lập tự động xóa lời mời hết hạn, mã đặt lại mật khẩu và hồ sơ đã lưu trữ theo chính sách công ty.
            </p>
          </div>
        </Panel>
      </section>

      <section id="support">
        <Panel padding="lg" className="space-y-6 border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">💬 Ma trận hỗ trợ</h2>
            <p className="text-sm text-slate-600 font-medium">
              Sử dụng bảng sau khi bạn gặp sự cố nền tảng hoặc cần phối hợp cùng đội khác.
            </p>
          </div>
          <div className="space-y-4">
            {escalations.map((entry) => (
              <div
                key={entry.label}
                className="flex flex-col gap-3 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-base font-bold text-amber-900">{entry.label}</p>
                  <p className="text-sm text-slate-700 font-medium">{entry.description}</p>
                </div>
                <a
                  href={`mailto:${entry.contact}`}
                  className="text-sm font-bold text-indigo-600 transition hover:text-indigo-700 hover:underline"
                >
                  {entry.contact}
                </a>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section id="templates">
        <Panel padding="lg" className="space-y-6 border-2 border-pink-200 bg-gradient-to-br from-white to-pink-50">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">📧 Mẫu liên lạc</h2>
            <p className="text-sm text-slate-600 font-medium">
              Những đoạn văn bản sẵn sàng gửi cho các tình huống mời tham gia và nhắc nhở phổ biến nhất.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div id="invites" className="space-y-3 rounded-xl border-2 border-pink-300 bg-gradient-to-r from-pink-50 to-rose-50 p-5">
              <h3 className="text-base font-bold text-pink-900">Email mời tham gia</h3>
              <ul className="space-y-2 text-sm text-slate-700 font-medium">
                <li className="flex gap-2">
                  <span className="text-pink-600">•</span>
                  <span>Tiêu đề: &#34;Mời bạn tham gia TalentFlow&#34;</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-600">•</span>
                  <span>Nhắc lại ai đã mời và lý do cụ thể.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-600">•</span>
                  <span>Một câu giải thích điều gì xảy ra sau khi chấp nhận.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-600">•</span>
                  <span>Nút liên kết tới URL lời mời kèm ngày hết hạn.</span>
                </li>
              </ul>
            </div>
            <div id="reminders" className="space-y-3 rounded-xl border-2 border-pink-300 bg-gradient-to-r from-pink-50 to-rose-50 p-5">
              <h3 className="text-base font-bold text-pink-900">Thông báo nhắc nhở</h3>
              <ul className="space-y-2 text-sm text-slate-700 font-medium">
                <li className="flex gap-2">
                  <span className="text-pink-600">•</span>
                  <span>Gửi lời nhắc thân thiện trước 48 giờ khi lời mời sắp hết hạn.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-600">•</span>
                  <span>Đính kèm thông tin liên hệ nếu họ cần hỗ trợ đăng nhập.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-600">•</span>
                  <span>Đề nghị gửi lại lời mời nếu liên kết đã hết hạn.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-600">•</span>
                  <span>Nhắc lại lợi ích của việc kích hoạt ngay hôm nay.</span>
                </li>
              </ul>
            </div>
          </div>
        </Panel>
      </section>

      <section id="troubleshooting">
        <Panel padding="lg" className="space-y-6 border-2 border-cyan-200 bg-gradient-to-br from-white to-cyan-50">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">🔧 Mẹo xử lý nhanh</h2>
            <p className="text-sm text-slate-600 font-medium">
              Bắt đầu với những bước này trước khi nhờ tới đội kỹ thuật.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            <li className="flex gap-2">
              <span className="text-cyan-600">•</span>
              <span>
                <strong className="font-bold text-cyan-900">Sự cố đăng nhập</strong>: kiểm tra thành viên đã chấp nhận lời mời
                hay chưa hoặc gửi yêu cầu đặt lại mật khẩu từ trang đăng nhập.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-600">•</span>
              <span>
                <strong className="font-bold text-cyan-900">Thiếu bối cảnh công ty</strong>: đảm bảo thành viên đã được gán vào
                đúng công ty và vai trò trong mục quản trị.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-600">•</span>
              <span>
                <strong className="font-bold text-cyan-900">Thông báo đến chậm</strong>: xác nhận địa chỉ người gửi đã được
                xác thực và nhắc thành viên kiểm tra thư mục spam trước khi leo thang.
              </span>
            </li>
          </ul>
        </Panel>
      </section>
    </Container>
  );
}
