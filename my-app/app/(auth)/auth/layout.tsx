export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12 sm:px-6 lg:px-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex flex-col md:flex-row">
          <aside className="hidden w-full max-w-[360px] flex-col justify-between bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 px-8 py-10 text-white md:flex">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">
                  TalentFlow
                </p>
                <h1 className="mt-3 text-2xl font-bold leading-snug">
                  Đăng nhập một lần cho mọi quy trình tuyển dụng.
                </h1>
              </div>
              <ul className="space-y-3.5 text-sm font-medium text-white/90">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-300">✓</span>
                  <span>Onboarding có hướng dẫn giúp thành viên mới vào đúng workspace.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-300">✓</span>
                  <span>Hồ sơ ứng viên được đồng bộ ngay khi tài khoản được tạo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-300">✓</span>
                  <span>Đặt lại mật khẩu nhanh chóng, an toàn và hoàn tất trên mọi thiết bị.</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/90">Cần hỗ trợ?</p>
              <p className="text-sm text-white/70">
                Hãy liên hệ quản trị viên công ty hoặc đội hỗ trợ TalentFlow.
              </p>
            </div>
          </aside>
          <main className="flex-1 px-6 py-10 sm:px-12">
            <div className="mx-auto w-full max-w-md space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
