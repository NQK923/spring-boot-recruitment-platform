'use server';

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

export type ApplyState = {
  error?: string;
  success?: string;
};

export async function applyToJobAction(
  jobPostingId: number,
  _prevState: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const cvIdRaw = formData.get("cvId");
  const source = String(formData.get("source") ?? "").trim() || null;

  let cvId: number | null = null;
  if (cvIdRaw) {
    const parsed = Number(cvIdRaw);
    if (Number.isNaN(parsed)) {
      return { error: "CV ID must be a number." };
    }
    cvId = parsed;
  }

  try {
    await apiFetch("/api/applications", {
      method: "POST",
      body: JSON.stringify({
        jobPostingId,
        cvId,
        source,
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit application.";
    return { error: message };
  }

  revalidatePath(`${ROUTES.jobs}/${jobPostingId}`);
  revalidatePath(ROUTES.candidatePortal);
  return { success: "Application submitted successfully." };
}
