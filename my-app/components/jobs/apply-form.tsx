"use client";

import { useActionState } from "react";
import { applyToJobAction, type ApplyState } from "@/app/jobs/[jobId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  jobPostingId: number;
};

const initialState: ApplyState = {};

export function ApplyForm({ jobPostingId }: Props) {
  const [state, formAction, pending] = useActionState(
    applyToJobAction.bind(null, jobPostingId),
    initialState
  );

  return (
    <form className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-background/70 p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Apply for this role</h2>
        <p className="text-sm text-foreground/60">
          Submit with your latest CV. You can update it later from the candidate portal.
        </p>
      </div>
      <label className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
        CV ID (optional)
        <Input
          name="cvId"
          type="number"
          min={0}
          placeholder="Enter CV identifier"
          disabled={pending}
          className="mt-1"
        />
      </label>
      <label className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
        Source (optional)
        <Input
          name="source"
          placeholder="e.g. Career site, LinkedIn"
          disabled={pending}
          className="mt-1"
        />
      </label>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Submitting..." : "Submit application"}
      </Button>
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
    </form>
  );
}
