"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadCvAction, type ProfileFormState } from "@/app/candidate/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ProfileFormState = {};

export function UploadCvForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(uploadCvAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state?.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 rounded-xl border border-foreground/10 bg-background/80 p-4"
      encType="multipart/form-data"
    >
      <div className="grid gap-3 md:grid-cols-[2fr,3fr]">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
          Version name
          <Input
            name="versionName"
            placeholder="Product manager - Apr 2026"
            disabled={pending}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
          Upload file
          <Input name="file" type="file" accept=".pdf,.doc,.docx" disabled={pending} required />
        </label>
      </div>
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
        {pending ? "Uploading..." : "Upload CV"}
      </Button>
    </form>
  );
}
