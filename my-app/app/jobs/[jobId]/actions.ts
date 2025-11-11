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
  if (typeof cvIdRaw === "string" && cvIdRaw.trim().length > 0) {
    const parsed = Number(cvIdRaw.trim());
    if (Number.isNaN(parsed)) {
      return { error: "Mã CV phải là số." };
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
      error instanceof Error ? error.message : "Không thể gửi hồ sơ ứng tuyển.";
    return { error: message };
  }

  revalidatePath(`${ROUTES.jobs}/${jobPostingId}`);
  revalidatePath(ROUTES.candidatePortal);
  return { success: "Gửi hồ sơ thành công." };
}
