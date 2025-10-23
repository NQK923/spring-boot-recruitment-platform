import type { MeResponse, Role } from "./types";
import { apiFetch } from "./api";
import { getAccessTokenFromCookies } from "./session";
import { ROUTES } from "./routes";

export async function getCurrentUser(): Promise<MeResponse | null> {
  const token = await getAccessTokenFromCookies();
  if (!token) {
    return null;
  }

  try {
    const response = await apiFetch("/api/auth/me", { method: "GET" });
    const data = await response.json();
    return {
      id: Number(data.id),
      email: String(data.email ?? ""),
      roles: Array.isArray(data.roles) ? (data.roles as Role[]) : [],
    };
  } catch {
    return null;
  }
}

export function resolveDefaultRoute(roles: Role[] | undefined): string {
  if (!roles || roles.length === 0) {
    return ROUTES.recruiterDashboard;
  }
  if (roles.includes("SUPER_ADMIN")) {
    return ROUTES.superAdminDashboard;
  }
  if (roles.includes("COMPANY_ADMIN")) {
    return ROUTES.companyAdminDashboard;
  }
  if (roles.includes("RECRUITER")) {
    return ROUTES.recruiterDashboard;
  }
  if (roles.includes("CANDIDATE")) {
    return ROUTES.candidatePortal;
  }
  return ROUTES.recruiterDashboard;
}
