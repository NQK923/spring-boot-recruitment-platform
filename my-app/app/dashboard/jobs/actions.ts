'use server';

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

export type JobFormState = {
  error?: string;
  success?: string;
};

const DASHBOARD_PATH = ROUTES.recruiterDashboard;

function normalizeString(value: FormDataEntryValue | null, allowEmpty = false) {
  if (value === null) {
    return allowEmpty ? "" : null;
  }
  const trimmed = String(value).trim();
  if (!trimmed && !allowEmpty) {
    return null;
  }
  return trimmed;
}

function parseNumber(value: FormDataEntryValue | null) {
  if (value === null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function createJobAction(
  _prevState: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const title = normalizeString(formData.get("title"));
  const description = normalizeString(formData.get("description"), true) ?? "";
  const requirements = normalizeString(formData.get("requirements"), true) ?? "";
  const location = normalizeString(formData.get("location")) ?? "Remote";
  const workType = normalizeString(formData.get("workType")) ?? "REMOTE";
  const positionId = parseNumber(formData.get("positionId"));

  if (!title) {
    return { error: "Title is required." };
  }

  try {
    await apiFetch("/api/jobs", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        requirements,
        location,
        workType,
        positionId,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create job.";
    return { error: message };
  }

  revalidatePath(DASHBOARD_PATH);
  return { success: "Job created successfully." };
}

export async function updateJobAction(
  jobId: number,
  _prevState: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const title = normalizeString(formData.get("title"));
  const description = normalizeString(formData.get("description"), true) ?? "";
  const requirements = normalizeString(formData.get("requirements"), true) ?? "";
  const location = normalizeString(formData.get("location")) ?? "Remote";
  const workType = normalizeString(formData.get("workType")) ?? "REMOTE";
  const status = normalizeString(formData.get("status")) ?? "DRAFT";
  const positionId = parseNumber(formData.get("positionId"));

  if (!title) {
    return { error: "Title cannot be empty." };
  }

  try {
    await apiFetch(`/api/jobs/${jobId}`, {
      method: "PUT",
      body: JSON.stringify({
        title,
        description,
        requirements,
        location,
        workType,
        status,
        positionId,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update job.";
    return { error: message };
  }

  revalidatePath(DASHBOARD_PATH);
  return { success: "Job updated successfully." };
}
