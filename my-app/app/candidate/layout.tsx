import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAccessTokenFromCookies } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import type { MeResponse, Role } from "@/lib/types";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAccessTokenFromCookies();
  if (!token) {
    redirect(`${ROUTES.signIn}?next=${ROUTES.candidatePortal}`);
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
    redirect(`${ROUTES.signIn}?next=${ROUTES.candidatePortal}`);
  }

  if (!currentUser?.roles.includes("CANDIDATE")) {
    if (currentUser?.roles.some((role) => ["SUPER_ADMIN", "COMPANY_ADMIN", "RECRUITER"].includes(role))) {
      redirect(ROUTES.recruiterDashboard);
    }
    redirect(ROUTES.home);
  }

  return <>{children}</>;
}
