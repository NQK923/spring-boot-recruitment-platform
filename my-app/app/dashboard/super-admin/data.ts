import { apiFetch } from "@/lib/api";

export type SuperAdminCompany = {
  id: number;
  name: string;
  status: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  createdAt: string | null;
};

function toNullableString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  const text = String(value).trim();
  return text.length === 0 ? null : text;
}

function normalizeNumberRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") {
    return {};
  }
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, number>>(
    (acc, [key, raw]) => {
      const numeric = Number(raw);
      if (Number.isFinite(numeric)) {
        acc[key] = numeric;
      }
      return acc;
    },
    {}
  );
}

export async function fetchSuperAdminCompanies(): Promise<SuperAdminCompany[]> {
  try {
    const response = await apiFetch("/api/companies", { method: "GET" });
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((company, index) => {
      const item = company as Record<string, unknown>;
      return {
        id: Number(item.id ?? index),
        name: String(item.name ?? "Chưa có tên"),
        status: String(item.status ?? "PENDING").toUpperCase(),
        description: toNullableString(item.description),
        website: toNullableString(item.website),
        logoUrl: toNullableString(item.logoUrl ?? item.logo_url),
        createdAt: toNullableString(item.createdAt ?? item.created_at),
      };
    });
  } catch {
    return [];
  }
}

export type SuperAdminDashboard = {
  totalCompanies: number;
  totalJobPostings: number;
  jobsByStatus: Record<string, number>;
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  topCompaniesByOpenRoles: Array<{
    companyId: number;
    companyName: string;
    openRoles: number;
  }>;
};

export async function fetchSuperAdminDashboard(): Promise<SuperAdminDashboard | null> {
  try {
    const response = await apiFetch("/api/companies/dashboard/super-admin", { method: "GET" });
    const data = await response.json();
    if (!data || typeof data !== "object") {
      return null;
    }
    const payload = data as Record<string, unknown>;
    const topCompaniesRaw = Array.isArray(payload.topCompaniesByOpenRoles)
      ? (payload.topCompaniesByOpenRoles as Array<Record<string, unknown>>)
      : [];

    const topCompanies = topCompaniesRaw.map((item, index) => ({
      companyId: Number(item.companyId ?? index),
      companyName: String(item.companyName ?? "Chưa xác định"),
      openRoles: Number(item.openRoles ?? 0),
    }));

    return {
      totalCompanies: Number(payload.totalCompanies ?? 0),
      totalJobPostings: Number(payload.totalJobPostings ?? 0),
      jobsByStatus: normalizeNumberRecord(payload.jobsByStatus),
      totalApplications: Number(payload.totalApplications ?? 0),
      applicationsByStatus: normalizeNumberRecord(payload.applicationsByStatus),
      topCompaniesByOpenRoles: topCompanies,
    };
  } catch {
    return null;
  }
}

export type SuperAdminCompanyUser = {
  id: number;
  email: string;
  role: string;
  locked: boolean;
  joinedAt: string | null;
};

export async function fetchCompanyUsers(companyId: number): Promise<SuperAdminCompanyUser[]> {
  if (!Number.isFinite(companyId)) {
    return [];
  }

  try {
    const response = await apiFetch(`/api/companies/${companyId}/users`, { method: "GET" });
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    type CompanyUserApi = Partial<SuperAdminCompanyUser> & {
      userId?: number;
      roleName?: string;
      createdAt?: string | null;
      created_at?: string | null;
    };

    return (data as CompanyUserApi[]).map((user, index) => ({
      id: Number(user.userId ?? user.id ?? index),
      email: String(user.email ?? "khongro@talentflow.app"),
      role: String(user.role ?? user.roleName ?? "UNKNOWN"),
      locked: Boolean(user.locked),
      joinedAt: toNullableString(user.joinedAt ?? user.createdAt ?? user.created_at),
    }));
  } catch {
    return [];
  }
}
