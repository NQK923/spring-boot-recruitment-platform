'use server';

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export type UpdateCompanyState = {
  error?: string;
  success?: string;
};

export async function updateCompanyAction(
  _prevState: UpdateCompanyState,
  formData: FormData
): Promise<UpdateCompanyState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const companySize = String(formData.get("companySize") ?? "").trim();
  const companyAddress = String(formData.get("companyAddress") ?? "").trim();

  if (!name) {
    return { error: "Company name is required." };
  }

  try {
    await apiFetch("/api/companies/me", {
      method: "PUT",
      body: JSON.stringify({
        name,
        description: description || null,
        website: website || null,
        logoUrl: logoUrl || null,
        companySize: companySize || null,
        companyAddress: companyAddress || null,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update company.";
    return { error: message };
  }

  revalidatePath("/dashboard/company");
  return { success: "Company details updated." };
}

export type InviteMemberState = {
  error?: string;
  success?: string;
};

export async function inviteCompanyMemberAction(
  _prevState: InviteMemberState,
  formData: FormData
): Promise<InviteMemberState> {
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!email) {
    return { error: "Email address is required." };
  }
  if (!role) {
    return { error: "Choose a role for the invite." };
  }

  try {
    await apiFetch("/api/companies/me/users/invite", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send invitation.";
    return { error: message };
  }

  revalidatePath("/dashboard/company");
  return { success: "Invitation sent successfully." };
}

export type UpdateCompanyUserState = {
  error?: string;
  success?: string;
};

export type UpdateCompanyUserInput = {
  role?: string | null;
  locked?: boolean;
};

export async function updateCompanyUserAction(
  userId: number,
  input: UpdateCompanyUserInput
): Promise<UpdateCompanyUserState> {
  const payload: Record<string, unknown> = {};
  if (input.role !== undefined) {
    const normalizedRole = input.role?.trim() ?? null;
    if (normalizedRole && !["RECRUITER", "COMPANY_ADMIN"].includes(normalizedRole)) {
      return { error: "Unsupported role." };
    }
    payload.role = normalizedRole;
  }
  if (input.locked !== undefined) {
    payload.locked = input.locked;
  }

  if (Object.keys(payload).length === 0) {
    return { error: "Nothing to update." };
  }

  try {
    await apiFetch(`/api/companies/me/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update team member.";
    return { error: message };
  }

  revalidatePath("/dashboard/company");
  return { success: "Team member updated." };
}
