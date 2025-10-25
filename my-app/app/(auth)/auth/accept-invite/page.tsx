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
          <h1 className="text-2xl font-semibold text-foreground">Invalid invitation link</h1>
          <p className="text-sm text-foreground/65">
            We couldn&apos;t find an invitation token in this link. Request a new invite from your company
            admin.
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
    error = err instanceof Error ? err.message : "Unable to verify invitation right now.";
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Accept your invitation</h1>
        <p className="text-sm text-foreground/65">
          Create a password to activate your account and join your company workspace.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Invitation unavailable</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-xs text-red-600/80">
            If this keeps happening, ask your admin to resend the invitation.
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
