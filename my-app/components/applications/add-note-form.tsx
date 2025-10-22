"use client";

import { useActionState } from "react";
import { addNoteAction, type ActionState } from "@/app/dashboard/applications/[applicationId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  applicationId: number;
};

const initialState: ActionState = {};

export function AddNoteForm({ applicationId }: Props) {
  const [state, formAction, pending] = useActionState(
    addNoteAction.bind(null, applicationId),
    initialState
  );

  return (
    <form className="flex flex-col gap-3" action={formAction}>
      <Input
        name="content"
        placeholder="Add a note about this candidate..."
        required
        disabled={pending}
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Add note"}
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
