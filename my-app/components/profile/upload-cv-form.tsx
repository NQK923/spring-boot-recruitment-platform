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
      className="space-y-4 rounded-2xl border border-primary-200/60 bg-gradient-to-br from-white to-primary-50/20 p-5 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Tên phiên bản
          <Input
            name="versionName"
            placeholder="Product Manager - Tháng 4 2026"
            disabled={pending}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Tải lên file
          <Input name="file" type="file" accept=".pdf,.doc,.docx" disabled={pending} required />
        </label>
      </div>
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Đang tải lên..." : "Tải lên CV"}
      </Button>
    </form>
  );
}
