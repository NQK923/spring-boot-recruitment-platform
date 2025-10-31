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
