"use client";

import { useActionState, useEffect } from "react";
import { updateProfileAction, type ProfileFormState } from "@/app/candidate/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  fullName?: string | null;
  phoneNumber?: string | null;
  summary?: string | null;
};

const initialState: ProfileFormState = {};

export function UpdateProfileForm({ fullName, phoneNumber, summary }: Props) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state?.success]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-foreground/80">
          Full name
          <Input
            name="fullName"
            defaultValue={fullName ?? ""}
            placeholder="Nguyen Van A"
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-foreground/80">
          Phone number
          <Input
            name="phoneNumber"
            defaultValue={phoneNumber ?? ""}
            placeholder="+84 900 000 000"
            disabled={pending}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm text-foreground/80">
        Summary
        <textarea
          name="summary"
          defaultValue={summary ?? ""}
          placeholder="Share a short bio so recruiters know what motivates you."
          disabled={pending}
          rows={4}
          className="min-h-[120px] rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-0"
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
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
