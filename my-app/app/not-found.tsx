import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 py-16">
      <Container className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-lg mx-auto">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full bg-white/80 px-5 py-2 text-sm font-bold uppercase tracking-widest text-indigo-600 shadow-md border border-indigo-100">
              404 • Không tìm thấy trang
            </div>
            <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
              Ồ! Có gì đó sai sai...
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-700 leading-relaxed">
              Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-blue-200/50 bg-white/80 p-8 shadow-lg shadow-blue-200/50 backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Có thể bạn đang tìm?</h2>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 shrink-0">
                  <svg className="h-3.5 w-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Trang chủ</p>
                  <p className="text-sm text-gray-600">Cập nhật tin tức và câu chuyện tuyển dụng mới nhất</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 shrink-0">
                  <svg className="h-3.5 w-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Việc làm đang tuyển</p>
                  <p className="text-sm text-gray-600">Khám phá hàng trăm cơ hội nghề nghiệp phù hợp với bạn</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 shrink-0">
                  <svg className="h-3.5 w-3.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Không gian ứng viên</p>
                  <p className="text-sm text-gray-600">Theo dõi đơn ứng tuyển và lịch phỏng vấn của bạn</p>
                </div>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button asChild className="rounded-xl shadow-md">
                <Link href={ROUTES.home} className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Về trang chủ
                </Link>
              </Button>
              <Button asChild variant="secondary" className="rounded-xl shadow-md">
                <Link href={ROUTES.jobs} className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Xem việc làm
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-200/50 bg-white/80 p-8 shadow-lg shadow-purple-200/50 backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Cần hỗ trợ?</h2>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50/50 p-5">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 mt-0.5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Liên hệ với chúng tôi</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Nếu bạn cho rằng đây là lỗi hệ thống, hãy liên hệ đội ngũ hỗ trợ để được giúp đỡ.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 mt-0.5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Tài liệu hữu ích</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Khám phá các bài viết hướng nghiệp, mẹo phỏng vấn và cẩm nang tìm việc.
                    </p>
                    <Button asChild variant="ghost" size="sm" className="mt-3 rounded-lg text-blue-700 hover:bg-blue-100">
                      <Link href={ROUTES.docs} className="flex items-center gap-1.5">
                        Xem tài liệu
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
