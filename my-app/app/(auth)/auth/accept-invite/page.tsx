import { redirect } from "next/navigation";
import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, resolveDefaultRoute } from "@/lib/current-user";
import type { InvitationDetails } from "@/lib/types";

type AcceptInviteSearchParams = {
  token?: string | string[];
};

type AcceptInvitePageProps = {
  searchParams: Promise<AcceptInviteSearchParams> | AcceptInviteSearchParams;
};

function extractToken(param: string | string[] | undefined) {
  if (Array.isArray(param)) {
    return typeof param[0] === "string" ? param[0] : undefined;
  }
  return typeof param === "string" ? param : undefined;
}

async function fetchInvitation(token: string): Promise<InvitationDetails> {
  const encodedToken = encodeURIComponent(token);
  const response = await apiFetch(`/api/auth/invites/${encodedToken}`, {
    method: "GET",
    skipAuthHeaders: true,
  });
  return (await response.json()) as InvitationDetails;
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const resolvedParams = await Promise.resolve(searchParams);
  const tokenParam = extractToken(resolvedParams?.token);
  const viewer = await getCurrentUser();

  if (viewer) {
    const defaultRoute = resolveDefaultRoute(viewer.roles);
    redirect(defaultRoute);
  }

  if (!tokenParam || tokenParam.trim().length === 0) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-text">Liên kết mời không hợp lệ</h1>
          <p className="text-sm text-text/65">
            Không tìm thấy mã lời mời trong liên kết này. Vui lòng yêu cầu quản trị công ty gửi lại lời mời.
          </p>
        </header>
      </div>
    );
  }

  let invitation: InvitationDetails | null = null;
  let error: string | null = null;

  try {
    invitation = await fetchInvitation(tokenParam.trim());
  } catch (err) {
    error = err instanceof Error ? err.message : "Hiện không thể xác minh lời mời.";
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-text">Chấp nhận lời mời</h1>
        <p className="text-sm text-text/65">
          Tạo mật khẩu để kích hoạt tài khoản và tham gia workspace của công ty.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Không thể sử dụng lời mời</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-xs text-red-600/80">
            Nếu vấn đề tiếp tục, hãy nhờ quản trị viên gửi lại lời mời.
          </p>
        </div>
      ) : null}

      {invitation ? (
        <AcceptInviteForm
          token={tokenParam.trim()}
          email={invitation.email}
          role={invitation.roleToGrant}
          expiresAt={invitation.expiresAt}
        />
      ) : null}
    </div>
  );
}
