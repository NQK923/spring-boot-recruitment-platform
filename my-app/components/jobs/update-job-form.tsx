"use client";

import { useActionState } from "react";
import { updateJobAction, type JobFormState } from "@/app/dashboard/jobs/actions";
import { Button } from "@/components/ui/button";
import type { JobPosting, JobPosition, JobStatus } from "@/lib/types";

type Props = {
  job: JobPosting;
  positions: JobPosition[];
};

const initialState: JobFormState = {};

const STATUSES: JobStatus[] = ["DRAFT", "PUBLISHED", "PAUSED", "CLOSED"];
const WORK_TYPES = ["REMOTE", "HYBRID", "ONSITE"];

export function UpdateJobForm({ job, positions }: Props) {
  const [state, formAction, pending] = useActionState(
    updateJobAction.bind(null, job.id),
    initialState
  );

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-foreground/10 bg-background/80 p-4">
      <div className="flex flex-col gap-1 text-sm">
        <p className="font-semibold text-foreground">{job.title}</p>
        <p className="text-xs text-foreground/50">
          Last updated {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : "recently"}
        </p>
      </div>

      <input type="hidden" name="title" value={job.title} />
      <input type="hidden" name="description" value={job.description ?? ""} />
      <input type="hidden" name="requirements" value={job.requirements ?? ""} />

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
          Status
          <select
            name="status"
            defaultValue={job.status}
            disabled={pending}
            className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
          Work type
          <select
            name="workType"
            defaultValue={job.workType ?? "REMOTE"}
            disabled={pending}
            className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
          >
            {WORK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
          Location
          <input
            name="location"
            defaultValue={job.location ?? ""}
            disabled={pending}
            className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
        Job position
        <select
          name="positionId"
          defaultValue={job.jobPosition?.id ? String(job.jobPosition.id) : ""}
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
        {pending ? "Saving..." : "Save job"}
      </Button>
    </form>
  );
}


