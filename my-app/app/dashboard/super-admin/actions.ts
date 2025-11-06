"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { apiFetch } from "@/lib/api";

function safeNumber(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function safeRedirectPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return ROUTES.superAdminDashboard;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return ROUTES.superAdminDashboard;
  }

  return trimmed;
}

function withRefreshParam(path: string): string {
  const [base, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  const stamp = Date.now().toString();
  params.set("_ts", stamp);
  const query = params.toString();
  return query ? `${base}?${query}` : `${base}?_ts=${stamp}`;
}

export type CreateCompanyState = {
  error?: string;
  success?: string;
};

export async function createCompanyAction(
  _prevState: CreateCompanyState,
  formData: FormData
): Promise<CreateCompanyState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();

  if (!name) {
    return { error: "Tên công ty là bắt buộc." };
  }

  try {
    await apiFetch("/api/companies", {
      method: "POST",
      body: JSON.stringify({
        name,
        description: description || null,
        website: website || null,
        logoUrl: logoUrl || null,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo công ty.";
    return { error: message };
  }

  revalidatePath(ROUTES.superAdminCompanies);
  revalidatePath(ROUTES.superAdminUsers);

  return { success: "Đã tạo công ty thành công." };
}

export type InviteCompanyUserState = {
  error?: string;
  success?: string;
};

export async function inviteCompanyUserAction(
  _prevState: InviteCompanyUserState,
  formData: FormData
): Promise<InviteCompanyUserState> {
  const companyId = safeNumber(formData.get("companyId"));
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() || "COMPANY_ADMIN";

  if (companyId == null) {
    return { error: "Hãy chọn công ty để gửi lời mời." };
  }
  if (!email) {
    return { error: "Email người nhận là bắt buộc." };
  }

  try {
    await apiFetch(`/api/companies/${companyId}/users/invite`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể gửi lời mời.";
    return { error: message };
  }

  revalidatePath(ROUTES.superAdminCompanies);
  revalidatePath(ROUTES.superAdminUsers);

  return { success: "Đã xếp lịch gửi email mời." };
}

export async function updateCompanyStatusAction(formData: FormData): Promise<void> {
  const companyId = safeNumber(formData.get("companyId"));
  const status = formData.get("status");
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));
  if (companyId == null || typeof status !== "string" || status.trim() === "") {
    console.error("Invalid company status payload.", { companyId, status });
    return;
  }

  try {
    await apiFetch(`/api/companies/${companyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    revalidatePath(ROUTES.superAdminDashboard);
    redirect(withRefreshParam(redirectTo));
  } catch (error) {
    console.error("Failed to update company status", error);
  }
}

export async function updateJobStatusAction(formData: FormData): Promise<void> {
  const jobId = safeNumber(formData.get("jobId"));
  const status = formData.get("status");
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));
  if (jobId == null || typeof status !== "string" || status.trim() === "") {
    console.error("Invalid job status payload.", { jobId, status });
    return;
  }

  try {
    await apiFetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    revalidatePath(ROUTES.superAdminDashboard);
    redirect(withRefreshParam(redirectTo));
  } catch (error) {
    console.error("Failed to update job status", error);
  }
}

export type UpdateCompanyUserState = {
  error?: string;
  success?: string;
};

type UpdateCompanyUserLockInput = {
  companyId: number;
  userId: number;
  locked: boolean;
};

export async function updateCompanyUserLockAction(
  input: UpdateCompanyUserLockInput
): Promise<UpdateCompanyUserState> {
  const companyId = Number(input.companyId);
  const userId = Number(input.userId);

  if (!Number.isFinite(companyId) || !Number.isFinite(userId)) {
    return { error: "Dữ liệu người dùng không hợp lệ." };
  }

  try {
    await apiFetch(`/api/companies/${companyId}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locked: Boolean(input.locked) }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể cập nhật trạng thái người dùng.";
    return { error: message };
  }

  revalidatePath(ROUTES.superAdminUsers);
  revalidatePath(ROUTES.superAdminCompanies);

  return { success: input.locked ? "Đã khóa người dùng." : "Đã mở khóa người dùng." };
}
