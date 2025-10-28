"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import { apiFetch } from "@/lib/api";

function safeNumber(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function updateCompanyStatusAction(formData: FormData): Promise<void> {
  const companyId = safeNumber(formData.get("companyId"));
  const status = formData.get("status");
  if (companyId == null || typeof status !== "string" || status.trim() === "") {
    console.error("Invalid company status payload.", { companyId, status });
    return;
  }

  try {
    await apiFetch(`/api/companies/${companyId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    revalidatePath(ROUTES.superAdminDashboard);
  } catch (error) {
    console.error("Failed to update company status", error);
  }
}

export async function updateJobStatusAction(formData: FormData): Promise<void> {
  const jobId = safeNumber(formData.get("jobId"));
  const status = formData.get("status");
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
  } catch (error) {
    console.error("Failed to update job status", error);
  }
}
