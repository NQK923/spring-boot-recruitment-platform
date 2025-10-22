'use server';

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

export type ProfileFormState = {
  error?: string;
  success?: string;
};

const SUCCESS_REVALIDATE_PATHS = [ROUTES.candidateProfile, ROUTES.candidatePortal];

function revalidateCandidateViews() {
  for (const path of SUCCESS_REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  if (!fullName && !phoneNumber && !summary) {
    return { error: "Please provide at least one field to update." };
  }

  try {
    await apiFetch("/api/profiles/me", {
      method: "PUT",
      body: JSON.stringify({
        fullName: fullName || null,
        phoneNumber: phoneNumber || null,
        summary: summary || null,
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update your profile right now.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Profile updated successfully." };
}

export async function uploadCvAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const versionName = String(formData.get("versionName") ?? "").trim();
  const file = formData.get("file");

  if (!versionName) {
    return { error: "Please provide a version name for the CV." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please attach a CV file before uploading." };
  }

  const payload = new FormData();
  payload.set("versionName", versionName);
  payload.set("file", file);

  try {
    await apiFetch("/api/profiles/me/cvs/upload", {
      method: "POST",
      body: payload,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload your CV right now.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "CV uploaded successfully." };
}

export async function generateCvAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const versionName = String(formData.get("generatedVersionName") ?? "").trim();

  if (!versionName) {
    return { error: "Please provide a version name for the generated CV." };
  }

  try {
    await apiFetch("/api/profiles/me/cvs/generate", {
      method: "POST",
      body: JSON.stringify({ versionName }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate a CV right now.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "CV generated successfully." };
}
