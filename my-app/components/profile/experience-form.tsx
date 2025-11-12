"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { updateExperiencesAction, type ExperienceInput, type ProfileFormState } from "@/app/candidate/profile/actions";
import type { EmploymentType, Experience } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/profile/tag-input";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";

type ExperiencesFormProps = {
  experiences: Experience[];
};

const emptyExperience: ExperienceInput = {
  title: "",
  companyName: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  employmentType: "",
  isCurrent: false,
  achievements: "",
  techStack: [],
};

const employmentOptions: Array<{ label: string; value: EmploymentType }> = [
  { label: "Toàn thời gian", value: "FULL_TIME" },
  { label: "Bán thời gian", value: "PART_TIME" },
  { label: "Hợp đồng", value: "CONTRACT" },
  { label: "Thực tập", value: "INTERN" },
];

const initialState: ProfileFormState = {};

const normalizeEmploymentType = (
  value: Experience["employmentType"]
): ExperienceInput["employmentType"] => value ?? "";

export function ExperiencesForm({ experiences }: ExperiencesFormProps) {
  const initial = useMemo(
    () =>
      experiences.length > 0
        ? experiences.map((experience) => ({
            title: experience.title ?? "",
            companyName: experience.companyName ?? "",
            description: experience.description ?? "",
            startDate: experience.startDate ?? "",
            endDate: experience.endDate ?? "",
            location: experience.location ?? "",
            employmentType: normalizeEmploymentType(experience.employmentType),
            isCurrent: Boolean(experience.current),
            achievements: experience.achievements ?? "",
            techStack: experience.techStack ?? [],
          }))
        : [emptyExperience],
    [experiences]
  );

  const [items, setItems] = useState<ExperienceInput[]>(initial);
  const [state, formAction, pending] = useActionState(updateExperiencesAction, initialState);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const handleChange = (index: number, key: keyof ExperienceInput, value: string | boolean | string[]) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  };

  const addExperience = () => {
    setItems((prev) => [...prev, { ...emptyExperience }]);
  };

  const removeExperience = (index: number) => {
    setItems((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length > 0 ? next : [{ ...emptyExperience }];
    });
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="experiences" value={JSON.stringify(items)} />
      <div className="space-y-4">
        {items.map((experience, index) => (
          <div
            key={`experience-${index}`}
            className="space-y-4 rounded-2xl border border-primary-200/60 bg-white/80 px-4 py-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <label className="flex-1 text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Chức danh</span>
                <Input
                  value={experience.title}
                  onChange={(event) => handleChange(index, "title", event.target.value)}
                  placeholder="Product Design Lead"
                  disabled={pending}
                />
              </label>
              <label className="flex-1 text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Công ty / Tổ chức</span>
                <Input
                  value={experience.companyName}
                  onChange={(event) => handleChange(index, "companyName", event.target.value)}
                  placeholder="TalentFlow"
                  disabled={pending}
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <label className="flex-1 text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Địa điểm</span>
                <Input
                  value={experience.location}
                  onChange={(event) => handleChange(index, "location", event.target.value)}
                  placeholder="TP. Hồ Chí Minh"
                  disabled={pending}
                />
              </label>
              <label className="flex-1 text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Hình thức làm việc</span>
                <select
                  value={experience.employmentType}
                  onChange={(event) =>
                    handleChange(index, "employmentType", event.target.value as EmploymentType | "")
                  }
                  disabled={pending}
                  className="w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                >
                  <option value="">Chọn hình thức</option>
                  {employmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Ngày bắt đầu</span>
                <Input
                  type="date"
                  value={experience.startDate}
                  onChange={(event) => handleChange(index, "startDate", event.target.value)}
                  disabled={pending}
                />
              </label>
              <label className="text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Ngày kết thúc</span>
                <Input
                  type="date"
                  value={experience.endDate}
                  onChange={(event) => handleChange(index, "endDate", event.target.value)}
                  disabled={pending || experience.isCurrent}
                />
                <span className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={experience.isCurrent}
                    onChange={(event) => handleChange(index, "isCurrent", event.target.checked)}
                    disabled={pending}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Đang làm việc tại đây
                </span>
              </label>
            </div>

            <label className="text-sm text-muted">
              <span className="mb-1 block font-semibold text-text">Mô tả trách nhiệm chính</span>
              <AutoResizeTextarea
                value={experience.description}
                onChange={(event) => handleChange(index, "description", event.target.value)}
                placeholder="Tóm tắt ngắn gọn phạm vi công việc và bối cảnh đội nhóm."
                disabled={pending}
                minRows={3}
                maxRows={10}
              />
            </label>

            <label className="text-sm text-muted">
              <span className="mb-1 block font-semibold text-text">
                Thành tựu / Kết quả chính (mỗi dòng một bullet, ưu tiên số liệu)
              </span>
              <AutoResizeTextarea
                value={experience.achievements}
                onChange={(event) => handleChange(index, "achievements", event.target.value)}
                placeholder="- Tăng tỉ lệ chuyển đổi +25%...\n- Rút ngắn thời gian xử lý 3 tuần → 5 ngày..."
                disabled={pending}
                minRows={3}
                maxRows={12}
              />
            </label>

            <TagInput
              label="Công nghệ / Công cụ chính"
              placeholder="Ví dụ: React, Spring Boot, OKR..."
              values={experience.techStack}
              onChangeAction={(stack) => handleChange(index, "techStack", stack)}
              disabled={pending}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeExperience(index)}
                disabled={pending || items.length === 1}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-2 border-red-300 bg-red-50 text-red-700 transition-all hover:border-red-400 hover:bg-red-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                title="Xóa kinh nghiệm"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {state.success}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu kinh nghiệm"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={addExperience} disabled={pending}>
          Thêm kinh nghiệm
        </Button>
      </div>
    </form>
  );
}
