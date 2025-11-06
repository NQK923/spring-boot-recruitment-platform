'use server';

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function updateStatusAction(
  applicationId: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const newStatus = String(formData.get("status") ?? "").toUpperCase();
  if (!newStatus) {
    return { error: "Vui lòng chọn trạng thái." };
  }

  try {
    await apiFetch(`/api/applications/${applicationId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ newStatus }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể cập nhật trạng thái hồ sơ.";
    return { error: message };
  }

  revalidatePath(`${ROUTES.recruiterDashboard}/applications/${applicationId}`);
  return { success: "Đã cập nhật trạng thái." };
}

export async function addNoteAction(
  applicationId: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) {
    return { error: "Nội dung ghi chú không được để trống." };
  }

  try {
    await apiFetch(`/api/applications/${applicationId}/notes`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể tạo ghi chú.";
    return { error: message };
  }

  revalidatePath(`${ROUTES.recruiterDashboard}/applications/${applicationId}`);
  return { success: "Đã thêm ghi chú." };
}
