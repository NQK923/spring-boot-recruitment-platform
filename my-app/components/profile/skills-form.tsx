"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { updateSkillsAction, type ProfileFormState, type SkillInput } from "@/app/candidate/profile/actions";
import type { Skill } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SKILL_OPTIONS = [
  { label: "Mới bắt đầu", value: "BEGINNER" },
  { label: "Trung cấp", value: "INTERMEDIATE" },
  { label: "Nâng cao", value: "ADVANCED" },
  { label: "Chuyên gia", value: "EXPERT" },
];

type SkillsFormProps = {
  skills: Skill[];
};

const emptySkill: SkillInput = { skillName: "", proficiency: "", years: "" };

const initialState: ProfileFormState = {};

const normalizeProficiency = (value: Skill["proficiency"]): SkillInput["proficiency"] =>
  value ?? "";

export function SkillsForm({ skills }: SkillsFormProps) {
  const initial = useMemo(
    () =>
      skills.length > 0
        ? skills.map((skill) => ({
            skillName: skill.skillName ?? "",
            proficiency: normalizeProficiency(skill.proficiency),
            years: skill.years?.toString() ?? "",
          }))
        : [emptySkill],
    [skills]
  );

  const [items, setItems] = useState<SkillInput[]>(initial);
  const [state, formAction, pending] = useActionState(updateSkillsAction, initialState);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const handleChange = (index: number, key: keyof SkillInput, value: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  };

  const addSkill = () => {
    setItems((prev) => [...prev, { ...emptySkill }]);
  };

  const removeSkill = (index: number) => {
    setItems((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length > 0 ? next : [{ ...emptySkill }];
    });
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="skills" value={JSON.stringify(items)} />
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`skill-${index}`}
            className="flex flex-col gap-3 rounded-2xl border border-primary-200/60 bg-white/80 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:gap-4"
          >
            <Input
              value={item.skillName}
              onChange={(event) => handleChange(index, "skillName", event.target.value)}
              placeholder="Product discovery"
              disabled={pending}
              className="flex-[2] min-w-0"
            />
            <select
              value={item.proficiency}
              onChange={(event) => handleChange(index, "proficiency", event.target.value)}
              disabled={pending}
              className="flex-1 rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
            >
              <option value="">Trình độ</option>
              {SKILL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Input
              type="number"
              min={0}
              max={60}
              value={item.years}
              onChange={(event) => handleChange(index, "years", event.target.value)}
              placeholder="Số năm"
              disabled={pending}
              className="w-20 sm:w-24"
            />
            <button
              type="button"
              onClick={() => removeSkill(index)}
              disabled={pending || items.length === 1}
              className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-red-300 bg-red-50 text-red-700 transition-all hover:border-red-400 hover:bg-red-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              title="Xóa kỹ năng"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
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
          {pending ? "Đang lưu..." : "Lưu kỹ năng"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={addSkill} disabled={pending}>
          Thêm kỹ năng
        </Button>
      </div>
    </form>
  );
}
