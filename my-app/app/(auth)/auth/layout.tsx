export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface/30 px-4 py-12 sm:px-6 lg:px-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface shadow-lg">
        <div className="flex flex-col md:flex-row">
          <aside className="hidden w-full max-w-[320px] flex-col justify-between border-b border-border bg-gradient-to-br from-primary-600 via-accent-600 to-primary-500 px-8 py-10 text-surface md:flex md:border-b-0 md:border-r">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface/80">
                  Talentflow
                </p>
                <h1 className="mt-3 text-2xl font-semibold leading-snug">
                  Đăng nhập một lần cho mọi quy trình tuyển dụng.
                </h1>
              </div>
              <ul className="space-y-3 text-sm text-surface/85">
                <li>- Onboarding có hướng dẫn giúp thành viên mới vào đúng workspace.</li>
                <li>- Hồ sơ ứng viên được đồng bộ ngay khi tài khoản được tạo.</li>
                <li>- Đặt lại mật khẩu nhanh chóng, an toàn và hoàn tất trên mọi thiết bị.</li>
              </ul>
            </div>
            <p className="text-xs text-surface/70">
              Cần hỗ trợ? Hãy liên hệ quản trị viên công ty hoặc đội hỗ trợ Talentflow.
            </p>
          </aside>
          <main className="flex-1 px-6 py-10 sm:px-10">
            <div className="mx-auto w-full max-w-lg space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
