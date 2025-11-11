import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAccessTokenFromCookies } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import type { MeResponse, Role } from "@/lib/types";

const DASHBOARD_ROLES: Role[] = ["SUPER_ADMIN", "COMPANY_ADMIN", "RECRUITER"];

function hasDashboardAccess(roles: Role[] | undefined) {
  if (!roles || roles.length === 0) {
    return false;
  }
  return roles.some((role) => DASHBOARD_ROLES.includes(role));
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAccessTokenFromCookies();
  if (!token) {
    redirect(`${ROUTES.signIn}?next=${ROUTES.recruiterDashboard}`);
  }

  let currentUser: MeResponse | null = null;
  try {
    const response = await apiFetch("/api/auth/me", { method: "GET" });
    const data = await response.json();
    const rawCompanyId = data?.companyId ?? data?.company_id ?? null;
    const companyId =
      typeof rawCompanyId === "number"
        ? rawCompanyId
        : Number.isFinite(Number(rawCompanyId))
          ? Number(rawCompanyId)
          : null;
    currentUser = {
      id: Number(data.id),
      email: String(data.email ?? ""),
      companyId,
      roles: Array.isArray(data.roles) ? (data.roles as Role[]) : [],
    };
  } catch {
    redirect(`${ROUTES.signIn}?next=${ROUTES.recruiterDashboard}`);
  }

  if (!currentUser || !hasDashboardAccess(currentUser.roles)) {
    if (currentUser?.roles.includes("CANDIDATE")) {
      redirect(ROUTES.candidatePortal);
    }
    redirect(ROUTES.home);
  }

  return <>{children}</>;
}
