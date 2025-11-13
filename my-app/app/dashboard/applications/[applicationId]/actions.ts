'use server';

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser } from "@/lib/current-user";

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
  if (newStatus === "HIRED") {
    return { error: "Ứng viên chỉ chuyển sang ĐÃ TUYỂN sau khi tự xác nhận đề nghị." };
  }

  const payload: Record<string, unknown> = { newStatus };

  if (newStatus === "INTERVIEWING") {
    const scheduledAtRaw = String(formData.get("interviewScheduledAt") ?? "").trim();
    const timezone = String(formData.get("interviewTimezone") ?? "").trim();
    const location = String(formData.get("interviewLocation") ?? "").trim();
    const instructions = String(formData.get("interviewInstructions") ?? "").trim();
    if (!scheduledAtRaw || !timezone || !location) {
      return { error: "Vui lòng nhập đầy đủ thời gian, múi giờ và địa điểm phỏng vấn." };
    }
    const isoDate = new Date(scheduledAtRaw);
    if (Number.isNaN(isoDate.getTime())) {
      return { error: "Thời gian phỏng vấn không hợp lệ." };
    }
    payload.interview = {
      scheduledAt: isoDate.toISOString(),
      timezone,
      location,
      instructions: instructions || null,
    };
  }

  if (newStatus === "OFFERED") {
    const salaryRaw = String(formData.get("offerSalaryAmount") ?? "").trim();
    const currency = String(formData.get("offerCurrency") ?? "VND").trim().toUpperCase();
    const notes = String(formData.get("offerNotes") ?? "").trim();
    const expiresAtRaw = String(formData.get("offerExpiresAt") ?? "").trim();

    const salaryNumber = Number(salaryRaw);
    if (!salaryRaw || Number.isNaN(salaryNumber) || salaryNumber <= 0) {
      return { error: "Mức lương đề nghị phải lớn hơn 0." };
    }
    if (!currency) {
      return { error: "Vui lòng nhập đơn vị tiền tệ." };
    }
    let expiresAt: string | null = null;
    if (expiresAtRaw) {
      const expiresDate = new Date(expiresAtRaw);
      if (Number.isNaN(expiresDate.getTime())) {
        return { error: "Hạn phản hồi không hợp lệ." };
      }
      expiresAt = expiresDate.toISOString();
    }
    payload.offer = {
      salaryAmount: salaryNumber,
      currency,
      notes: notes || null,
      expiresAt,
    };
  }

  try {
    await apiFetch(`/api/applications/${applicationId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
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

export async function takeOwnershipAction(
  applicationId: number,
  _prevState: ActionState,
  _formData?: FormData
): Promise<ActionState> {
  const viewer = await getCurrentUser();
  if (!viewer) {
    return { error: "Bạn cần đăng nhập để tiếp nhận hồ sơ." };
  }

  try {
    await apiFetch(`/api/applications/${applicationId}/owner`, {
      method: "PATCH",
      body: JSON.stringify({ ownerUserId: viewer.id }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể tiếp nhận hồ sơ.";
    return { error: message };
  }

  revalidatePath(`${ROUTES.recruiterDashboard}/applications/${applicationId}`);
  return { success: "Bạn đã tiếp nhận hồ sơ." };
}
