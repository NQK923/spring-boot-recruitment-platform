'use server';

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

export type OfferActionState = {
  error?: string;
  success?: string;
};

export async function respondOfferAction(
  applicationId: number,
  _prevState: OfferActionState,
  formData: FormData
): Promise<OfferActionState> {
  const decision = String(formData.get("decision") ?? "").toUpperCase();
  const noteRaw = String(formData.get("note") ?? "").trim();
  if (decision !== "ACCEPT" && decision !== "DECLINE") {
    return { error: "Vui lòng chọn hành động." };
  }

  try {
    await apiFetch(`/api/applications/${applicationId}/offer/response`, {
      method: "POST",
      body: JSON.stringify({
        decision,
        note: noteRaw || null,
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể gửi phản hồi của bạn.";
    return { error: message };
  }

  revalidatePath(`${ROUTES.candidateApplications}/${applicationId}`);
  revalidatePath(ROUTES.candidatePortal);
  return {
    success: decision === "ACCEPT" ? "Bạn đã chấp nhận đề nghị. Hẹn gặp lại trong ngày nhận việc!" : "Đã ghi nhận quyết định từ chối của bạn.",
  };
}
