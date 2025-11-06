import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SocialSignIn } from "@/components/auth/social-sign-in";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser, resolveDefaultRoute } from "@/lib/current-user";

type SignInSearchParams = {
  registered?: string;
  reset?: string;
  next?: string;
  error?: string;
};

type SignInPageProps = {
  searchParams: Promise<SignInSearchParams> | SignInSearchParams;
};

function sanitizeNext(nextValue: string | undefined) {
  if (typeof nextValue !== "string") {
    return null;
  }
  return nextValue.startsWith("/") && !nextValue.startsWith("//") ? nextValue : null;
}

function resolveSocialError(code: string | undefined): string | null {
  if (!code) {
    return null;
  }
  switch (code) {
    case "google_sign_in_failed":
      return "Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.";
    case "google_missing_credential":
      return "Đăng nhập Google không trả về thông tin xác thực. Vui lòng thử lại.";
    default:
      return null;
  }
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const justRegistered = resolvedSearchParams?.registered === "1";
  const passwordReset = resolvedSearchParams?.reset === "1";
  const requestedNext = sanitizeNext(resolvedSearchParams?.next);
  const viewer = await getCurrentUser();

  if (viewer) {
    const defaultRoute = resolveDefaultRoute(viewer.roles);
    redirect(requestedNext ?? defaultRoute);
  }

  const safeNext = requestedNext ?? ROUTES.recruiterDashboard;
  const socialError = resolveSocialError(resolvedSearchParams?.error);

  return (
    <div className="space-y-6">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Đăng nhập</h1>
        <p className="text-sm text-slate-600 font-medium">
          Nhập thông tin để truy cập workspace tuyển dụng của bạn.
        </p>
      </header>

      {justRegistered ? (
        <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          ✓ Tạo tài khoản thành công. Đăng nhập bằng thông tin vừa tạo để tiếp tục.
        </div>
      ) : null}

      {passwordReset ? (
        <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          ✓ Mật khẩu đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.
        </div>
      ) : null}

      <div className="space-y-5">
        <SocialSignIn nextPath={safeNext} initialError={socialError} />
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
          <span className="h-px flex-1 bg-slate-300" />
          <span>Hoặc tiếp tục bằng email</span>
          <span className="h-px flex-1 bg-slate-300" />
        </div>
        <SignInForm defaultNext={safeNext} />
      </div>
    </div>
  );
}
