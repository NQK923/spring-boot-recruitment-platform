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
    return { error: "Please choose a status." };
  }

  try {
    await apiFetch(`/api/applications/${applicationId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ newStatus }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update application status.";
    return { error: message };
  }

  revalidatePath(`${ROUTES.recruiterDashboard}/applications/${applicationId}`);
  return { success: "Status updated." };
}

export async function addNoteAction(
  applicationId: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) {
    return { error: "Note content cannot be empty." };
  }

  try {
    await apiFetch(`/api/applications/${applicationId}/notes`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create note.";
    return { error: message };
  }

  revalidatePath(`${ROUTES.recruiterDashboard}/applications/${applicationId}`);
  return { success: "Note added." };
}
