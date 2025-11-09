'use server';

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import type { EmploymentType, LanguageProficiency, SkillProficiency } from "@/lib/types";

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
  location: string;
  employmentType: EmploymentType | "";
  isCurrent: boolean;
  achievements: string;
  techStack: string[];
};

export type EducationInput = {
  school: string;
  degree: string;
  major: string;
  gpa: string;
  honors: string;
  activities: string;
  startDate: string;
  endDate: string;
};

export type SkillInput = {
  skillName: string;
  proficiency: SkillProficiency | "";
  years: string;
};

export type ProjectInput = {
  name: string;
  role: string;
  summary: string;
  responsibilities: string;
  achievements: string;
  techStack: string[];
  projectUrl: string;
  repoUrl: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

export type CertificationInput = {
  name: string;
  issuer: string;
  issueDate: string;
  expireDate: string;
  credentialId: string;
  credentialUrl: string;
};

export type LanguageInput = {
  language: string;
  proficiency: LanguageProficiency | "";
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

function toBoolean(value: FormDataEntryValue | null): boolean {
  if (typeof value === "string") {
    return value === "on" || value === "true";
  }
  return false;
}

function toOptionalNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

function sanitizeExperience(input: ExperienceInput) {
  return {
    title: input.title.trim() || null,
    companyName: input.companyName.trim() || null,
    description: input.description.trim() || null,
    startDate: input.startDate || null,
    endDate: input.endDate || null,
    location: input.location.trim() || null,
    employmentType: input.employmentType || null,
    isCurrent: input.isCurrent,
    achievements: input.achievements.trim() || null,
    techStack: input.techStack,
  };
}

function sanitizeEducation(input: EducationInput) {
  return {
    school: input.school.trim() || null,
    degree: input.degree.trim() || null,
    major: input.major.trim() || null,
    gpa: input.gpa.trim() || null,
    honors: input.honors.trim() || null,
    activities: input.activities.trim() || null,
    startDate: input.startDate || null,
    endDate: input.endDate || null,
  };
}

function sanitizeSkill(input: SkillInput) {
  return {
    skillName: input.skillName.trim() || null,
    proficiency: input.proficiency || null,
    years: toOptionalNumber(input.years),
  };
}

export async function updateProfileDetailsAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const payload = {
    fullName: String(formData.get("fullName") ?? "").trim() || null,
    phoneNumber: String(formData.get("phoneNumber") ?? "").trim() || null,
    summary: String(formData.get("summary") ?? "").trim() || null,
    emailForCv: String(formData.get("emailForCv") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    website: String(formData.get("website") ?? "").trim() || null,
    linkedin: String(formData.get("linkedin") ?? "").trim() || null,
    github: String(formData.get("github") ?? "").trim() || null,
    portfolio: String(formData.get("portfolio") ?? "").trim() || null,
    yearsOfExperience: toOptionalNumber(String(formData.get("yearsOfExperience") ?? "")),
    desiredPosition: String(formData.get("desiredPosition") ?? "").trim() || null,
    workAuthorization: String(formData.get("workAuthorization") ?? "").trim() || null,
    openToRelocate: toBoolean(formData.get("openToRelocate")),
    preferredCvLanguage: String(formData.get("preferredCvLanguage") ?? "").trim() || null,
  };

  try {
    await apiFetch("/api/profiles/me/enriched", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể lưu thông tin chung vào lúc này.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Đã lưu thông tin chung." };
}

export async function uploadCvAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const versionName = String(formData.get("versionName") ?? "").trim();
  const file = formData.get("file");

  if (!versionName) {
    return { error: "Vui lòng đặt tên cho phiên bản CV." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Vui lòng chọn tệp CV trước khi tải lên." };
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
      error instanceof Error ? error.message : "Không thể tải lên CV vào lúc này.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Đã tải lên CV mới." };
}

export async function generateCvAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const versionName = String(formData.get("generatedVersionName") ?? "").trim();

  if (!versionName) {
    return { error: "Vui lòng đặt tên cho phiên bản CV được tạo." };
  }

  try {
    await apiFetch("/api/profiles/me/cvs/generate", {
      method: "POST",
      body: JSON.stringify({ versionName }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể tạo CV tự động vào lúc này.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Đã thêm bản nháp CV mới." };
}

export async function updateExperiencesAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const experiences = parseJsonArray<ExperienceInput>(formData.get("experiences"))
    .map((experience) => ({
      ...experience,
      techStack: experience.techStack ?? [],
    }))
    .map(sanitizeExperience)
    .filter((experience) =>
      [
        "title",
        "companyName",
        "description",
        "startDate",
        "endDate",
        "location",
        "achievements",
      ].some((key) => experience[key as keyof ReturnType<typeof sanitizeExperience>])
    );

  try {
    await apiFetch("/api/profiles/me", {
      method: "PUT",
      body: JSON.stringify({ experiences }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể lưu kinh nghiệm làm việc.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Đã cập nhật kinh nghiệm." };
}

export async function updateEducationAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const education = parseJsonArray<EducationInput>(formData.get("education"))
    .map(sanitizeEducation)
    .filter((entry) =>
      ["school", "degree", "major", "gpa", "honors", "activities", "startDate", "endDate"].some(
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
      error instanceof Error ? error.message : "Không thể lưu thông tin học vấn.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Đã cập nhật học vấn." };
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
      error instanceof Error ? error.message : "Không thể lưu danh sách kỹ năng.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Đã cập nhật kỹ năng." };
}

export async function createProjectAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const payload = buildProjectPayload(formData);

  try {
    await apiFetch("/api/profiles/me/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể thêm dự án mới lúc này.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Đã thêm dự án." };
}

export async function updateProjectAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const projectIdValue = formData.get("projectId");
  const projectId = Number(projectIdValue);
  if (!Number.isFinite(projectId)) {
    return { error: "Thiếu thông tin dự án cần cập nhật." };
  }

  const payload = buildProjectPayload(formData);

  try {
    await apiFetch(`/api/profiles/me/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể cập nhật dự án.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Đã lưu dự án." };
}

export async function deleteProjectAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const projectIdValue = formData.get("projectId");
  const projectId = Number(projectIdValue);
  if (!Number.isFinite(projectId)) {
    return { error: "Thiếu thông tin dự án cần xoá." };
  }

  try {
    await apiFetch(`/api/profiles/me/projects/${projectId}`, { method: "DELETE" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể xoá dự án vào lúc này.";
    return { error: message };
  }
  revalidateCandidateViews();
  return { success: "Đã xoá dự án." };
}

export async function createCertificationAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const payload = buildCertificationPayload(formData);

  try {
    await apiFetch("/api/profiles/me/certifications", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể thêm chứng chỉ mới.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Đã thêm chứng chỉ." };
}

export async function updateCertificationAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const certificationIdValue = formData.get("certificationId");
  const certificationId = Number(certificationIdValue);
  if (!Number.isFinite(certificationId)) {
    return { error: "Thiếu thông tin chứng chỉ cần cập nhật." };
  }

  const payload = buildCertificationPayload(formData);

  try {
    await apiFetch(`/api/profiles/me/certifications/${certificationId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể cập nhật chứng chỉ.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Đã lưu chứng chỉ." };
}

export async function deleteCertificationAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const certificationIdValue = formData.get("certificationId");
  const certificationId = Number(certificationIdValue);
  if (!Number.isFinite(certificationId)) {
    return { error: "Thiếu thông tin chứng chỉ cần xoá." };
  }

  try {
    await apiFetch(`/api/profiles/me/certifications/${certificationId}`, {
      method: "DELETE",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể xoá chứng chỉ.";
    return { error: message };
  }
  revalidateCandidateViews();
  return { success: "Đã xoá chứng chỉ." };
}

export async function createLanguageAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const payload = buildLanguagePayload(formData);

  try {
    await apiFetch("/api/profiles/me/languages", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể thêm ngoại ngữ.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Đã thêm ngoại ngữ." };
}

export async function updateLanguageAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const languageIdValue = formData.get("languageId");
  const languageId = Number(languageIdValue);
  if (!Number.isFinite(languageId)) {
    return { error: "Thiếu thông tin ngoại ngữ cần cập nhật." };
  }

  const payload = buildLanguagePayload(formData);

  try {
    await apiFetch(`/api/profiles/me/languages/${languageId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể cập nhật ngoại ngữ.";
    return { error: message };
  }

  revalidateCandidateViews();
  return { success: "Đã lưu ngoại ngữ." };
}

export async function deleteLanguageAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const languageIdValue = formData.get("languageId");
  const languageId = Number(languageIdValue);
  if (!Number.isFinite(languageId)) {
    return { error: "Thiếu thông tin ngoại ngữ cần xoá." };
  }

  try {
    await apiFetch(`/api/profiles/me/languages/${languageId}`, {
      method: "DELETE",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể xoá ngoại ngữ.";
    return { error: message };
  }
  revalidateCandidateViews();
  return { success: "Đã xoá ngoại ngữ." };
}

function buildProjectPayload(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim() || null,
    summary: String(formData.get("summary") ?? "").trim() || null,
    responsibilities: String(formData.get("responsibilities") ?? "").trim() || null,
    achievements: String(formData.get("achievements") ?? "").trim() || null,
    techStack: parseJsonArray<string>(formData.get("techStack"))
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
    projectUrl: String(formData.get("projectUrl") ?? "").trim() || null,
    repoUrl: String(formData.get("repoUrl") ?? "").trim() || null,
    startDate: String(formData.get("startDate") ?? "").trim() || null,
    endDate: String(formData.get("endDate") ?? "").trim() || null,
    isCurrent: toBoolean(formData.get("isCurrent")),
  };
}

function buildCertificationPayload(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    issuer: String(formData.get("issuer") ?? "").trim() || null,
    issueDate: String(formData.get("issueDate") ?? "").trim() || null,
    expireDate: String(formData.get("expireDate") ?? "").trim() || null,
    credentialId: String(formData.get("credentialId") ?? "").trim() || null,
    credentialUrl: String(formData.get("credentialUrl") ?? "").trim() || null,
  };
}

function buildLanguagePayload(formData: FormData) {
  const rawProficiency = String(formData.get("proficiency") ?? "").trim().toUpperCase();
  return {
    language: String(formData.get("language") ?? "").trim(),
    proficiency: rawProficiency || null,
  };
}
