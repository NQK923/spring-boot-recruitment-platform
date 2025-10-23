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
            className="space-y-3 rounded-2xl border border-foreground/10 bg-background/70 px-4 py-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <label className="flex-1 text-sm text-foreground/70">
                <span className="mb-1 block font-semibold text-foreground">School</span>
                <Input
                  value={item.school}
                  onChange={(event) => handleChange(index, "school", event.target.value)}
                  placeholder="University of Hanoi"
                  disabled={pending}
                />
              </label>
              <label className="flex-1 text-sm text-foreground/70">
                <span className="mb-1 block font-semibold text-foreground">Degree / Program</span>
                <Input
                  value={item.degree}
                  onChange={(event) => handleChange(index, "degree", event.target.value)}
                  placeholder="BSc Computer Science"
                  disabled={pending}
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-foreground/70">
                <span className="mb-1 block font-semibold text-foreground">Start date</span>
                <Input
                  type="date"
                  value={item.startDate}
                  onChange={(event) => handleChange(index, "startDate", event.target.value)}
                  disabled={pending}
                />
              </label>
              <label className="text-sm text-foreground/70">
                <span className="mb-1 block font-semibold text-foreground">End date</span>
                <Input
                  type="date"
                  value={item.endDate}
                  onChange={(event) => handleChange(index, "endDate", event.target.value)}
                  disabled={pending}
                />
              </label>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEducation(index)}
                disabled={pending || items.length === 1}
              >
                Remove education
              </Button>
            </div>
          </div>
        ))}
      </div>
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {state.success}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : "Save education"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={addEducation} disabled={pending}>
          Add education
        </Button>
      </div>
    </form>
  );
}
