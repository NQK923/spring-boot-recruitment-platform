"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { updateExperiencesAction, type ExperienceInput, type ProfileFormState } from "@/app/candidate/profile/actions";
import type { Experience } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ExperiencesFormProps = {
  experiences: Experience[];
};

const emptyExperience: ExperienceInput = {
  title: "",
  companyName: "",
  description: "",
  startDate: "",
  endDate: "",
};

const initialState: ProfileFormState = {};

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
          }))
        : [emptyExperience],
    [experiences]
  );

  const [items, setItems] = useState<ExperienceInput[]>(initial);
  const [state, formAction, pending] = useActionState(updateExperiencesAction, initialState);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const handleChange = (index: number, key: keyof ExperienceInput, value: string) => {
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
            className="space-y-3 rounded-2xl border border-border bg-bg/70 px-4 py-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <label className="flex-1 text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Role title</span>
                <Input
                  value={experience.title}
                  onChange={(event) => handleChange(index, "title", event.target.value)}
                  placeholder="Senior Designer"
                  disabled={pending}
                />
              </label>
              <label className="flex-1 text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Company</span>
                <Input
                  value={experience.companyName}
                  onChange={(event) => handleChange(index, "companyName", event.target.value)}
                  placeholder="Acme Labs"
                  disabled={pending}
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">Start date</span>
                <Input
                  type="date"
                  value={experience.startDate}
                  onChange={(event) => handleChange(index, "startDate", event.target.value)}
                  disabled={pending}
                />
              </label>
              <label className="text-sm text-muted">
                <span className="mb-1 block font-semibold text-text">End date</span>
                <Input
                  type="date"
                  value={experience.endDate}
                  onChange={(event) => handleChange(index, "endDate", event.target.value)}
                  disabled={pending}
                />
              </label>
            </div>
            <label className="text-sm text-muted">
              <span className="mb-1 block font-semibold text-text">Summary</span>
              <textarea
                value={experience.description}
                onChange={(event) => handleChange(index, "description", event.target.value)}
                rows={3}
                placeholder="Highlight responsibilities or achievements."
                className="w-full rounded-2xl border border-border bg-bg/70 px-3 py-2 text-sm text-text focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                disabled={pending}
              />
            </label>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeExperience(index)}
                disabled={pending || items.length === 1}
              >
                Remove experience
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
          {pending ? "Saving..." : "Save experiences"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={addExperience} disabled={pending}>
          Add experience
        </Button>
      </div>
    </form>
  );
}
