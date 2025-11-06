"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { updateSkillsAction, type ProfileFormState, type SkillInput } from "@/app/candidate/profile/actions";
import type { Skill } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SkillsFormProps = {
  skills: Skill[];
};

const emptySkill: SkillInput = { skillName: "" };

const initialState: ProfileFormState = {};

export function SkillsForm({ skills }: SkillsFormProps) {
  const initial = useMemo(
    () =>
      skills.length > 0
        ? skills.map((skill) => ({ skillName: skill.skillName ?? "" }))
        : [emptySkill],
    [skills]
  );

  const [items, setItems] = useState<SkillInput[]>(initial);
  const [state, formAction, pending] = useActionState(updateSkillsAction, initialState);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const handleChange = (index: number, value: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, skillName: value } : item))
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
            className="flex flex-col gap-2 rounded-2xl border border-border bg-bg/70 px-4 py-3 sm:flex-row sm:items-center"
          >
            <Input
              value={item.skillName}
              onChange={(event) => handleChange(index, event.target.value)}
              placeholder="Product discovery"
              disabled={pending}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSkill(index)}
              disabled={pending || items.length === 1}
            >
              Remove
            </Button>
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
          {pending ? "Saving..." : "Save skills"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={addSkill} disabled={pending}>
          Add skill
        </Button>
      </div>
    </form>
  );
}
