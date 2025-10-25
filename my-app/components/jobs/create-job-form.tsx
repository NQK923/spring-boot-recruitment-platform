"use client";

import { useActionState } from "react";
import { createJobAction, type JobFormState } from "@/app/dashboard/jobs/actions";
import { Button } from "@/components/ui/button";
import type { JobPosition } from "@/lib/types";

type Props = {
  positions: JobPosition[];
};

const initialState: JobFormState = {};

const WORK_TYPES = ["REMOTE", "HYBRID", "ONSITE"];

export function CreateJobForm({ positions }: Props) {
  const [state, formAction, pending] = useActionState(createJobAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-foreground/10 bg-background/80 p-6 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-foreground">Create new job</h3>
        <p className="text-sm text-foreground/60">
          Posts immediately become visible to recruiters and, once published, to the public job board.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm text-foreground/80">
        Title
        <input
          name="title"
          placeholder="Senior Backend Engineer"
          required
          disabled={pending}
          className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-foreground/80">
          Work type
          <select
            name="workType"
            defaultValue="REMOTE"
            disabled={pending}
            className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
          >
            {WORK_TYPES.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-foreground/80">
          Location
          <input
            name="location"
            placeholder="Ho Chi Minh City (Hybrid)"
            disabled={pending}
            className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm text-foreground/80">
        Job position
        <select
          name="positionId"
          defaultValue=""
          disabled={pending}
          className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
        >
          <option value="">Unassigned</option>
          {positions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.title}
              {position.level ? ` - ${position.level}` : ""}{" "}
              {position.department ? ` (${position.department})` : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-foreground/80">
        Description
        <textarea
          name="description"
          placeholder="Describe the opportunity, responsibilities, and expectations."
          rows={4}
          disabled={pending}
          className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-foreground/80">
        Requirements
        <textarea
          name="requirements"
          placeholder="List the key qualifications or experience required."
          rows={4}
          disabled={pending}
          className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
        />
      </label>

      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Creating..." : "Create job"}
      </Button>
    </form>
  );
}


