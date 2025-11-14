'use server';

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

export type JobFormState = {
  error?: string;
  success?: string;
};

const DASHBOARD_PATHS = [ROUTES.recruiterDashboard, ROUTES.companyAdminDashboard] as const;

function revalidateDashboards() {
  for (const path of DASHBOARD_PATHS) {
    revalidatePath(path);
  }
}

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
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizePositiveInteger(value: number | null) {
  if (value === null) {
    return null;
  }
  const floored = Math.floor(value);
  return Number.isNaN(floored) ? null : floored;
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
  const salaryRange = normalizeString(formData.get("salaryRange"), true);
  const benefits = normalizeString(formData.get("benefits"), true);
  const rawHiringQuantity = normalizePositiveInteger(parseNumber(formData.get("hiringQuantity")));

  if (rawHiringQuantity !== null && rawHiringQuantity < 1) {
    return { error: "Số lượng tuyển phải từ 1 trở lên." };
  }

  if (!title) {
    return { error: "Vui lòng nhập tiêu đề." };
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
        salaryRange: salaryRange && salaryRange.length > 0 ? salaryRange : null,
        benefits: benefits && benefits.length > 0 ? benefits : null,
        hiringQuantity: rawHiringQuantity ?? 1,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã có lỗi xảy ra. Không thể tạo việc làm.";
    return { error: message };
  }

  revalidateDashboards();
  return { success: "Đã tạo việc làm mới thành công." };
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
  const salaryRange = normalizeString(formData.get("salaryRange"), true);
  const benefits = normalizeString(formData.get("benefits"), true);
  const rawHiringQuantity = normalizePositiveInteger(parseNumber(formData.get("hiringQuantity")));

  if (rawHiringQuantity !== null && rawHiringQuantity < 1) {
    return { error: "Số lượng tuyển phải từ 1 trở lên." };
  }

  if (!title) {
    return { error: "Vui lòng nhập tiêu đề." };
  }

  try {
    const payload: Record<string, unknown> = {
      title,
      description,
      requirements,
      location,
      workType,
      status,
      positionId,
      salaryRange: salaryRange && salaryRange.length > 0 ? salaryRange : null,
      benefits: benefits && benefits.length > 0 ? benefits : null,
    };

    if (rawHiringQuantity !== null) {
      payload.hiringQuantity = rawHiringQuantity;
    }

    await apiFetch(`/api/jobs/${jobId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã có lỗi xảy ra. Không thể cập nhật việc làm.";
    return { error: message };
  }

  revalidateDashboards();
  return { success: "Đã cập nhật việc làm thành công." };
}

export async function createJobPositionAction(
  _prevState: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const title = normalizeString(formData.get("positionTitle"));
  const department = normalizeString(formData.get("positionDepartment"), true);
  const level = normalizeString(formData.get("positionLevel"), true);

  if (!title) {
    return { error: "Vui lòng nhập tên vị trí chuẩn hóa." };
  }

  try {
    await apiFetch("/api/jobs/positions", {
      method: "POST",
      body: JSON.stringify({
        title,
        department: department && department.length > 0 ? department : null,
        level: level && level.length > 0 ? level : null,
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Đã có lỗi xảy ra. Không thể thêm vị trí chuẩn hóa.";
    return { error: message };
  }

  revalidateDashboards();
  return { success: "Đã ghi nhận vị trí chuẩn hóa mới." };
}
