'use server';

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export type CreateCompanyState = {
  error?: string;
  success?: string;
};

export async function createCompanyAction(
  _prevState: CreateCompanyState,
  formData: FormData
): Promise<CreateCompanyState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();

  if (!name) {
    return { error: "Company name is required." };
  }

  try {
    await apiFetch("/api/companies", {
      method: "POST",
      body: JSON.stringify({
        name,
        description: description || null,
        website: website || null,
        logoUrl: logoUrl || null,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create company.";
    return { error: message };
  }

  revalidatePath("/dashboard/super-admin");
  return { success: "Company created successfully." };
}

export type InviteCompanyUserState = {
  error?: string;
  success?: string;
};

export async function inviteCompanyUserAction(
  _prevState: InviteCompanyUserState,
  formData: FormData
): Promise<InviteCompanyUserState> {
  const companyId = Number(formData.get("companyId") ?? 0);
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!companyId || Number.isNaN(companyId)) {
    return { error: "Select a company before sending an invite." };
  }
  if (!email) {
    return { error: "Email address is required." };
  }
  if (!role) {
    return { error: "Choose a role for the invite." };
  }

  try {
    await apiFetch(`/api/companies/${companyId}/users/invite`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send invitation.";
    return { error: message };
  }

  revalidatePath("/dashboard/super-admin");
  return { success: "Invitation sent successfully." };
}
