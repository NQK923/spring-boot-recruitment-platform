import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/layout/account-menu";
import { ROUTES } from "@/lib/routes";
import { apiFetch } from "@/lib/api";
import { getAccessTokenFromCookies } from "@/lib/session";
import type { MeResponse } from "@/lib/types";

function describePrimaryRole(roles: string[] | undefined) {
  if (!roles || roles.length === 0) {
    return null;
  }
  if (roles.includes("SUPER_ADMIN")) return "Super Admin";
  if (roles.includes("COMPANY_ADMIN")) return "Company Admin";
  if (roles.includes("RECRUITER")) return "Recruiter";
  if (roles.includes("CANDIDATE")) return "Candidate";
  return roles[0];
}

export async function NavigationActions() {
  const token = getAccessTokenFromCookies();
  if (!token) {
    return (
      <div className="flex items-center gap-3">
        <Link href={ROUTES.signIn} className="hidden sm:inline-flex">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </Link>
        <Link href={ROUTES.register}>
          <Button size="sm">Get started</Button>
        </Link>
      </div>
    );
  }

  let currentUser: MeResponse | null;
  try {
    const response = await apiFetch("/api/auth/me", { method: "GET" });
    const data = await response.json();
    currentUser = {
      id: Number(data.id),
      email: String(data.email ?? ""),
      roles: Array.isArray(data.roles) ? data.roles : [],
    };
  } catch {
    currentUser = null;
  }

  if (!currentUser) {
    return (
      <div className="flex items-center gap-3">
        <Link href={ROUTES.signIn}>
          <Button size="sm">Sign in again</Button>
        </Link>
      </div>
    );
  }

  const roleLabel = describePrimaryRole(currentUser.roles);

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="hidden flex-col text-right sm:flex">
        <span className="font-medium text-foreground">{currentUser.email}</span>
        {roleLabel ? (
          <span className="text-xs text-foreground/60">{roleLabel}</span>
        ) : null}
      </div>
      <AccountMenu />
    </div>
  );
}
