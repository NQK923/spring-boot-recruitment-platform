"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { updateEducationAction, type EducationInput, type ProfileFormState } from "@/app/candidate/profile/actions";
import type { Education } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EducationFormProps = {
  education: Education[];
};

const emptyEducation: EducationInput = {
  school: "",
  degree: "",
  major: "",
  gpa: "",
  honors: "",
  activities: "",
  startDate: "",
  endDate: "",
};

const initialState: ProfileFormState = {};

export function EducationForm({ education }: EducationFormProps) {
  const initial = useMemo(
    () =>
      education.length > 0
        ? education.map((item) => ({
            school: item.school ?? "",
            degree: item.degree ?? "",
            major: item.major ?? "",
            gpa: item.gpa ?? "",
            honors: item.honors ?? "",
            activities: item.activities ?? "",
            startDate: item.startDate ?? "",
            endDate: item.endDate ?? "",
          }))
        : [emptyEducation],
    [education]
  );

  const [items, setItems] = useState<EducationInput[]>(initial);
  const [state, formAction, pending] = useActionState(updateEducationAction, initialState);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const handleChange = (index: number, key: keyof EducationInput, value: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  };

  const addEducation = () => {
    setItems((prev) => [...prev, { ...emptyEducation }]);
  };

  const removeEducation = (index: number) => {
    setItems((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length > 0 ? next : [{ ...emptyEducation }];
    });
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="education" value={JSON.stringify(items)} />
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={`education-${index}`}
            className="space-y-4 rounded-2xl border border-primary-200/60 bg-white/80 px-4 py-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <label className="flex-1 text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Trường / Học viện</span>
                <Input
                  value={item.school}
                  onChange={(event) => handleChange(index, "school", event.target.value)}
                  placeholder="Đại học Bách Khoa Hà Nội"
                  disabled={pending}
                />
              </label>
              <label className="flex-1 text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Bậc học / Chương trình</span>
                <Input
                  value={item.degree}
                  onChange={(event) => handleChange(index, "degree", event.target.value)}
                  placeholder="Kỹ sư Công nghệ Thông tin"
                  disabled={pending}
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <label className="flex-1 text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Chuyên ngành</span>
                <Input
                  value={item.major}
                  onChange={(event) => handleChange(index, "major", event.target.value)}
                  placeholder="Khoa học dữ liệu"
                  disabled={pending}
                />
              </label>
              <label className="flex-1 text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">GPA (0 - 10)</span>
                <Input
                  value={item.gpa}
                  onChange={(event) => handleChange(index, "gpa", event.target.value)}
                  placeholder="3.6 / 4.0 hoặc 8.5 / 10"
                  disabled={pending}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Ngày bắt đầu</span>
                <Input
                  type="date"
                  value={item.startDate}
                  onChange={(event) => handleChange(index, "startDate", event.target.value)}
                  disabled={pending}
                />
              </label>
              <label className="text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Ngày kết thúc</span>
                <Input
                  type="date"
                  value={item.endDate}
                  onChange={(event) => handleChange(index, "endDate", event.target.value)}
                  disabled={pending}
                />
              </label>
            </div>

            <label className="text-sm text-muted">
              <span className="mb-1 block font-semibold text-text">Danh hiệu / Học bổng</span>
              <textarea
                value={item.honors}
                onChange={(event) => handleChange(index, "honors", event.target.value)}
                rows={2}
                placeholder="- Top 5% khoá K63\n- Scholarship for Outstanding Performance..."
                className="w-full rounded-2xl border border-border bg-bg/70 px-3 py-2 text-sm text-text focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                disabled={pending}
              />
            </label>

            <label className="text-sm text-muted">
              <span className="mb-1 block font-semibold text-text">Hoạt động nổi bật</span>
              <textarea
                value={item.activities}
                onChange={(event) => handleChange(index, "activities", event.target.value)}
                rows={2}
                placeholder="- Lead CLB Học thuật...\n- Tình nguyện tại..."
                className="w-full rounded-2xl border border-border bg-bg/70 px-3 py-2 text-sm text-text focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                disabled={pending}
              />
            </label>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEducation(index)}
                disabled={pending || items.length === 1}
              >
                Xoá mục này
              </Button>
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
          {pending ? "Đang lưu..." : "Lưu học vấn"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={addEducation} disabled={pending}>
          Thêm học vấn
        </Button>
      </div>
    </form>
  );
}
