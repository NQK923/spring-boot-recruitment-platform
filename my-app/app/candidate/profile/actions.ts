'use server';

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

export type ProfileFormState = {
  error?: string;
  success?: string;
};

export type ExperienceInput = {
  title: string;
  companyName: string;
  description: string;
  startDate: string;
  endDate: string;
};

export type EducationInput = {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
};

export type SkillInput = {
  skillName: string;
};

const SUCCESS_REVALIDATE_PATHS = [ROUTES.candidateProfile, ROUTES.candidatePortal];

function revalidateCandidateViews() {
  for (const path of SUCCESS_REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

function parseJsonArray<T>(value: FormDataEntryValue | null): T[] {
  if (typeof value !== "string" || value.trim().length === 0) {
    return [];
  }
  try {
    return JSON.parse(value) as T[];
  } catch {
    return [];
  }
}

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

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

function sanitizeExperience(input: ExperienceInput) {
  return {
    title: input.title.trim() || null,
    companyName: input.companyName.trim() || null,
    description: input.description.trim() || null,
    startDate: input.startDate ? input.startDate : null,
    endDate: input.endDate ? input.endDate : null,
  };
}

function sanitizeEducation(input: EducationInput) {
  return {
    school: input.school.trim() || null,
    degree: input.degree.trim() || null,
    startDate: input.startDate ? input.startDate : null,
    endDate: input.endDate ? input.endDate : null,
  };
}

function sanitizeSkill(input: SkillInput) {
  return {
    skillName: input.skillName.trim() || null,
  };
}

export async function updateExperiencesAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const experiences = parseJsonArray<ExperienceInput>(formData.get("experiences"))
    .map(sanitizeExperience)
    .filter((experience) =>
      ["title", "companyName", "description", "startDate", "endDate"].some(
        (key) => experience[key as keyof ReturnType<typeof sanitizeExperience>]
      )
    );

  try {
    await apiFetch("/api/profiles/me", {
      method: "PUT",
      body: JSON.stringify({ experiences }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update experiences right now.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Experiences updated." };
}

export async function updateEducationAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const education = parseJsonArray<EducationInput>(formData.get("education"))
    .map(sanitizeEducation)
    .filter((entry) =>
      ["school", "degree", "startDate", "endDate"].some(
        (key) => entry[key as keyof ReturnType<typeof sanitizeEducation>]
      )
    );

  try {
    await apiFetch("/api/profiles/me", {
      method: "PUT",
      body: JSON.stringify({ education }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update education right now.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Education updated." };
}

export async function updateSkillsAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const skills = parseJsonArray<SkillInput>(formData.get("skills"))
    .map(sanitizeSkill)
    .filter((skill) => skill.skillName);

  try {
    await apiFetch("/api/profiles/me", {
      method: "PUT",
      body: JSON.stringify({ skills }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update skills right now.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Skills updated." };
}
