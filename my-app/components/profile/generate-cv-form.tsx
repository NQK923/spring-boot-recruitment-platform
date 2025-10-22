"use client";

import { useActionState, useEffect, useRef } from "react";
import { generateCvAction, type ProfileFormState } from "@/app/candidate/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ProfileFormState = {};

export function GenerateCvForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(generateCvAction, initialState);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 rounded-xl border border-foreground/10 bg-background/80 p-4"
    >
      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
        Version name
        <Input
          name="generatedVersionName"
          placeholder="New grad - condensed"
          disabled={pending}
          required
        />
      </label>
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Generating..." : "Generate CV shell"}
      </Button>
    </form>
  );
}
